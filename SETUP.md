# Southern Stock Take — replacement package

## What changed
- Google-only sign-in using the existing Firebase project.
- All authenticated Google users share the same `stores/southern` inventory database, so the same URL works on different phones/accounts.
- Real-time Firestore listeners update every device.
- Activity log + live toast/browser notifications for changes made by another user while the app is open.
- Product/item-code photo attachment. On a phone, the photo field uses the camera when the browser supports `capture="environment"`.
- DHL-style logistics UI direction: yellow / red / charcoal, compact tables, strong status badges, responsive mobile layout.
- Google Sheets mirror via the included Apps Script.
- Firebase Storage rules included for product photos.

## Firebase Console — required once
1. Authentication → Sign-in method → enable **Google**.
2. Authentication → Settings → Authorized domains → add your deployed domain, e.g. `southern-stock-take.vercel.app`.
3. Firestore Database → create/keep the database.
4. Storage → enable Firebase Storage.
5. Firestore Rules → replace with `firestore.rules`.
6. Storage Rules → replace with `storage.rules`.

The Firebase web configuration is already in `firebase.js` and matches the current repository configuration.

## Google Sheets
1. Create one Google Sheet for the branch.
2. Open Extensions → Apps Script.
3. Copy `apps-script/Code.gs` into the Apps Script project.
4. Deploy → New deployment → Web app.
5. Execute as: **Me**.
6. Who has access: **Anyone**.
7. Copy the `/exec` URL into Settings → Google Sheets in the app.
8. Paste the Google Spreadsheet ID into the second field and Save Settings.
9. Press Sync Now.

The Sheet is a mirror/backup. Firestore remains the live multi-device database so concurrent updates do not depend on a single browser session.

## Important notification note
The Activity feed and in-app/browser notifications are real-time when the website is open. Full push notifications while the website is completely closed require Firebase Cloud Messaging sender/server setup; this package intentionally does not ship a server credential.

## Deploy
Replace the existing repo files with this package and deploy the same Vercel/Firebase URL. After deploying, hard-refresh once because the PWA service worker cache version is `v4`.
