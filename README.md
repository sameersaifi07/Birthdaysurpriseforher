# Birthday Surprise: shop + online studio (pay → automatic access, one Gmail per purchase)

```
index.html     ← the shop. Login with Google only
studio.html    ← customers build + publish their website (unlocks automatically after payment)
view.html      ← the partner's link: countdown → PIN → surprise (no login)
admin.html     ← YOU: customers, Shopify orders, edit any website, checks, bugs, template
config.js      ← settings (Firebase keys, Shopify link, WhatsApp, developer email)
demo/          ← SHORT public demo (4 chapters). The full design is NOT here
firebase.json  ← tells Firebase what to put online (one command does everything)
firebase/      ← security rules + the backend that receives Shopify payments
```

## How it works
1. The customer buys on **Shopify** using their **Gmail**.
2. Shopify tells your backend “paid” → that Gmail gets 1 website (2 if they bought 2).
3. They open the studio, tap **Continue with Google** with that Gmail → it's already unlocked.
4. **One purchase = one Gmail.** Another Gmail shows “No purchase found” + Buy now → they pay again.
5. They publish and send the link to their partner. The partner only types the PIN, never logs in.
6. Customer typed the wrong email at checkout? admin.html → 🛒 Shopify orders → **↪ Move to another Gmail**.

---

## Put everything live (one time, ~40 minutes)

### 1. Firebase project (in the browser)
1. <https://console.firebase.google.com> → **Add project** (e.g. `birthday-surprise`).
2. **Upgrade to Blaze** (needs a card; small shops normally pay ₹0). Then Google Cloud → Billing → **Budgets** → set an alert, e.g. ₹200/month.
3. **Authentication** → Get started → Sign-in method → enable **Google only**. (Leave Email/Password OFF.)
4. **Firestore Database** → Create → location **asia-south1 (Mumbai)**.
5. **Storage** → Get started → same location.
6. **Project settings** (gear) → Your apps → web `</>` → register → copy `apiKey`, `authDomain`, `projectId`, `storageBucket`, `appId` into **config.js**.

### 2. Put it online from your PC (PowerShell, in this folder)
```
npm install -g firebase-tools
firebase login
```
Open `.firebaserc` and replace `PUT-YOUR-PROJECT-ID-HERE` with your projectId. Then:
```
cd firebase/functions; npm install; cd ../..
firebase deploy
```
That one command puts online: the website, studio, partner link and developer panel, the security rules, and the Shopify backend.
Your site is live at **`https://YOUR-PROJECT-ID.web.app`** (Google login works there automatically).
It prints the backend link ending in **`/shopifyOrderPaid`**: copy it for step 4.

### 3. Let phones download the websites (CORS, one line)
<https://console.cloud.google.com> → your project → **Cloud Shell** `>_` → paste (use your `storageBucket`):
```
echo '[{"origin":["*"],"method":["GET","HEAD"],"maxAgeSeconds":3600}]' > cors.json && gsutil cors set cors.json gs://YOUR-BUCKET
```

### 4. Shopify
1. **Product**: “Birthday Surprise – Do it yourself”, ₹499, untick *physical product*, **SKU `BS-STUDIO`**, no inventory tracking.
   Description: *“Pay with your Gmail. After payment, open https://YOUR-PROJECT-ID.web.app/studio.html and continue with Google using that Gmail.”*
   Copy the product link into **config.js → `shopUrl`**.
2. **Settings → Notifications → Webhooks → Create webhook**: Event **Order payment**, JSON, URL = your `/shopifyOrderPaid` link.
3. Copy the key shown as **“Your webhooks will be signed with …”**, then in PowerShell:
```
firebase functions:secrets:set SHOPIFY_WEBHOOK_SECRET
firebase deploy
```
4. **Order confirmation email** (Settings → Notifications → Order confirmation → Edit code), paste near the top:
```liquid
{% for line in line_items %}{% if line.sku == 'BS-STUDIO' %}
<p><b>Your studio is ready 🎁</b><br>Open <a href="https://YOUR-PROJECT-ID.web.app/studio.html">your Birthday Surprise studio</a> and continue with Google using <b>{{ email }}</b>.</p>
{% break %}{% endif %}{% endfor %}
```

### 5. Your developer setup
1. Open `https://YOUR-PROJECT-ID.web.app/admin.html` → Continue with Google as **samsaifi2526@gmail.com**.
2. **🧩 Template** tab → upload `birthday-builder-dev/src/app-template.html` (your full design, kept private).
3. **Test**: make a 100%-off discount code, buy the product with another Gmail of yours, open the studio with that Gmail → it should be unlocked. Build, publish, open the link on your phone, then **🩺 Check** in admin.html.

Any change later (text, prices, config.js): edit the file, run `firebase deploy` again.

---

## Your developer panel (admin.html)
- **🛒 Shopify orders**: who paid, how many websites, unlocked or waiting; **↪ Move to another Gmail** for typos.
- **👥 Customers**: all accounts, “💳 paid on Shopify”, websites allowed; **Activate/Deactivate** (use Deactivate for refunds).
- **🌐 Websites**: every website with PIN and unlock time; **✏️ Edit**, Open, Copy link, **🩺 Check / Check all**.
- **🐞 Bugs**: errors from partners' real phones.
- **🧩 Template**: upload your full design.

## Keeping your design private
- The public site has only the short demo; the other 13 chapters' code isn't in it.
- The full design is in private storage; only paying (unlocked) customers' studios load it.
- After a design change: upload the new template in 🧩 Template; rebuild the demo in the developer kit (`node tools/make-demo.js`) and `firebase deploy`.
- Honest limit: anything a browser shows can be studied by a determined person. This stops casual copying.

## Good to know
- Only Google accounts can log in (enforced by the security rules too, not just the page).
- Refunds don't lock automatically: Customers → Deactivate.
- More SKUs that unlock the studio (e.g. a premium product): `firebase deploy` asks for `STUDIO_SKUS` the first time; answer e.g. `BS-STUDIO,BS-PREMIUM` (saved in `firebase/functions/.env.<projectId>`).
- GitHub Pages is no longer needed. If you keep the old GitHub repo, delete it (it has the old full demo in its history).
- Customers must only upload music they have the rights to. Never put Mansi's website or the developer kit here.
