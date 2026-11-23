// Birthday Surprise backend: unlocks a customer's studio automatically when they pay on Shopify.
//
//  shopifyOrderPaid  ← Shopify calls this when an order is paid (webhook "Order payment").
//  claimPurchase     ← the studio calls this after login, to unlock websites bought with that email.
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { verifyShopify, creditsFromOrder } = require("./lib");

admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = admin.firestore;
const REGION = "asia-south1";
const SHOPIFY_SECRET = defineSecret("SHOPIFY_WEBHOOK_SECRET");
// SKUs of your Shopify products that give studio access (comma-separated). 1 item = 1 website.
const STUDIO_SKUS = defineString("STUDIO_SKUS", { default: "BS-STUDIO" });

/** Moves unclaimed purchases for this email onto the user's account. Returns how many websites were added. */
function applyToUser(uid, email){
  const pRef = db.collection("purchases").doc(email), uRef = db.collection("users").doc(uid);
  return db.runTransaction(async t => {
    const p = await t.get(pRef);
    const n = p.exists ? Number(p.data().unclaimed || 0) : 0;
    if (n <= 0) return 0;
    const u = await t.get(uRef);
    const patch = { email, active: true, quota: FieldValue.increment(n), paidVia: "shopify", activatedAt: FieldValue.serverTimestamp() };
    if (!u.exists) Object.assign(patch, { name: "", createdAt: FieldValue.serverTimestamp() });
    t.set(uRef, patch, { merge: true });
    t.update(pRef, { unclaimed: 0, claimedBy: uid, claimedAt: FieldValue.serverTimestamp() });
    return n;
  });
}

exports.shopifyOrderPaid = onRequest({ region: REGION, secrets: [SHOPIFY_SECRET] }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("POST only");
  if (!verifyShopify(req.rawBody, req.get("X-Shopify-Hmac-Sha256"), SHOPIFY_SECRET.value())){
    console.warn("Rejected webhook: bad signature");
    return res.status(401).send("bad signature");
  }
  const o = creditsFromOrder(req.body, STUDIO_SKUS.value());
  if (!o.orderId) return res.status(200).send("ignored");
  const orderRef = db.collection("orders").doc(o.orderId);
  // Shopify may send the same order more than once: record it only the first time.
  const isNew = await db.runTransaction(async t => {
    if ((await t.get(orderRef)).exists) return false;
    t.set(orderRef, Object.assign({}, o, { at: FieldValue.serverTimestamp() }));
    if (o.email && o.credits > 0){
      t.set(db.collection("purchases").doc(o.email), {
        email: o.email,
        unclaimed: FieldValue.increment(o.credits),
        total: FieldValue.increment(o.credits),
        orders: FieldValue.arrayUnion(o.orderName || o.orderId),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    return true;
  });
  // Already have a verified account with this email? Unlock right now.
  if (isNew && o.email && o.credits > 0){
    try {
      const user = await admin.auth().getUserByEmail(o.email);
      if (user.emailVerified) await applyToUser(user.uid, o.email);
    } catch (e){ /* no account yet: it unlocks when they register and log in */ }
  }
  console.log("Order", o.orderName || o.orderId, o.email, "websites:", o.credits, isNew ? "" : "(duplicate)");
  res.status(200).send("ok");
});

exports.claimPurchase = onCall({ region: REGION }, async req => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Please log in first.");
  const email = String(req.auth.token.email || "").trim().toLowerCase();
  if (!email) throw new HttpsError("failed-precondition", "This account has no email.");
  if (req.auth.token.firebase && req.auth.token.firebase.sign_in_provider !== "google.com") throw new HttpsError("permission-denied", "Please log in with Google (Gmail).");
  if (!req.auth.token.email_verified) return { status: "verify" };
  const added = await applyToUser(req.auth.uid, email);
  if (added > 0) return { status: "activated", added };
  const p = await db.collection("purchases").doc(email).get();
  return { status: p.exists ? "already" : "none" };
});
