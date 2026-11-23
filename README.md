# Birthday Surprise: sales website

Your public shop page, plus a live demo (sample content only, nothing private).

```
index.html        ← the sales page
demo/index.html   ← the live demo people tap through
demo/media/       ← sample photos used by the demo
```

## 1. Add your details (2 minutes)
Open `index.html` in Notepad and edit the `SITE` block at the top:

```js
whatsapp: "917881192526",          // already set: your number with country code
instagram: "",                     // optional
email: "samsaifi2526@gmail.com",   // already set
```
Prices are in `plans` (`price: "499"` …). Change the names, prices and bullet points to whatever you sell.

Every "Get / Order" button opens WhatsApp with a ready message, including the plan name and price.

## 2. Put it online (GitHub Pages, free)
1. Create a **new public repository**, e.g. `birthday-surprise`.
2. **Add file → Upload files**, then drag in `index.html` **and the `demo` folder**. Use Chrome so the folder keeps its structure.
3. **Commit changes**.
4. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
5. After 1–2 minutes your site is live at `https://YOUR-USERNAME.github.io/birthday-surprise/`.

Or drag the whole folder onto <https://app.netlify.com/drop>.

## 3. Turn on Login / Register (Google + email), free
The Login button stays hidden until you add your Firebase keys. To turn it on:

1. Go to <https://console.firebase.google.com> → **Add project** (any name, e.g. `birthday-surprise`). You can turn Google Analytics off.
2. Left menu: **Build → Authentication → Get started**.
   - **Sign-in method** tab: enable **Google** (pick your support email) and **Email/Password**.
   - **Settings → Authorized domains → Add domain**: `sameersaifi07.github.io` (plus your Netlify domain, if you use one).
3. **Project settings** (gear icon) → **Your apps** → the web icon `</>` → register the app (name: `website`; skip Hosting).
4. It shows a `firebaseConfig`. Copy 4 values into the `SITE` block in `index.html`:
   ```js
   firebase: {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     appId: "1:123...:web:abc..."
   }
   ```
5. Upload `index.html` again. The **Login** button appears, and visitors can register or sign in with Google or email.

Notes:
- These keys are **meant to be public**. It's safe for them to be in the page.
- You'll find every signed-up user in Firebase → Authentication → **Users**.
- Login won't work from a file opened on your computer (`file://`). Test it on the live site.

## Keep separate
- Never upload Mansi's website or the developer kit (`birthday-builder-dev`) here.
- Customers get their builder file + license key from you directly after they pay.
