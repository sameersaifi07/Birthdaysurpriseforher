// Pure helpers (no Firebase), so they can be tested on their own.
const crypto = require("crypto");

/** True when the webhook really comes from your Shopify store (signed with your webhook secret). */
function verifyShopify(rawBody, hmacHeader, secret){
  if (!rawBody || !hmacHeader || !secret) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(digest), b = Buffer.from(String(hmacHeader));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Reads a Shopify order: who paid, and how many studio websites they bought (by SKU). */
function creditsFromOrder(order, skus){
  order = order || {};
  const email = String(order.email || order.contact_email || (order.customer && order.customer.email) || "").trim().toLowerCase();
  const wanted = new Set(String(skus || "").split(",").map(s => s.trim().toUpperCase()).filter(Boolean));
  let credits = 0;
  for (const li of order.line_items || []){
    if (wanted.has(String(li.sku || "").trim().toUpperCase())) credits += Math.max(0, Math.floor(Number(li.quantity) || 0));
  }
  return {
    email, credits,
    orderId: order.id != null ? String(order.id) : "",
    orderName: String(order.name || ""),
    total: String(order.total_price || ""),
    currency: String(order.currency || "")
  };
}

module.exports = { verifyShopify, creditsFromOrder };
