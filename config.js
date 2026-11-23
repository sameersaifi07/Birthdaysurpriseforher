/* ═══════════════════════════════════════════════════════════════
   ✏️  ONE SETTINGS FILE FOR THE WHOLE SITE
   index.html (shop), studio.html (customers), view.html (partner link)
   and admin.html (you) all read this file.
   Setup guide: README.md → "Turn on the online studio".
   ═══════════════════════════════════════════════════════════════ */
window.BS = {
  brand: "Birthday Surprise",
  whatsapp: "917881192526",

  // Your Shopify product page for "Do it yourself" (paste the link, e.g. https://yourstore.myshopify.com/products/birthday-surprise).
  // When set, the shop's buy button and the studio's "Buy" button open it. Payment there unlocks the studio automatically.
  shopUrl: "",
  functionsRegion: "asia-south1",

  // Developer accounts: these emails can open admin.html and edit every website.
  // Sign in to them with Google (Google emails count as verified).
  adminEmails: ["samsaifi2526@gmail.com"],

  // Paste your Firebase web app settings here (Project settings → Your apps → Config).
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    appId: ""
  }
};

/* Loads the Firebase SDK parts a page needs (app + the ones listed). */
window.BS.loadFirebase = function (parts) {
  const V = "10.12.2", base = "https://www.gstatic.com/firebasejs/" + V + "/firebase-";
  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("load " + src)); document.head.appendChild(s); });
  return load(base + "app-compat.js")
    .then(() => Promise.all(parts.map(p => load(base + p + "-compat.js"))))
    .then(() => { if (!firebase.apps.length) firebase.initializeApp(window.BS.firebase); return firebase; });
};

/* Friendly login error messages, shared by every page. */
window.BS.authError = function (e) {
  const c = (e && e.code) || "";
  return c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") ? "Email or password is wrong."
    : c.includes("email-already-in-use") ? "This email is already registered. Try Login instead."
    : c.includes("weak-password") ? "Please use a password with at least 6 characters."
    : c.includes("invalid-email") ? "Please enter a valid email."
    : c.includes("popup-closed") || c.includes("cancelled-popup") ? "Google sign-in was closed. Please try again."
    : c.includes("popup-blocked") ? "Your browser blocked the Google window. Allow pop-ups and try again."
    : c.includes("unauthorized-domain") ? "This website address isn't allowed yet in Firebase (README → Authorized domains)."
    : c.includes("network") ? "No internet connection. Please try again."
    : c.includes("too-many-requests") ? "Too many tries. Please wait a minute and try again."
    : "Something went wrong. Please try again.";
};
