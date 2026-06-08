# Kiwi Party — Mobile App (Android + iOS)

The native **customer app**, built with **Expo / React Native** (one codebase → Android **and**
iOS). It talks to the same backend API as the web app (`apps/web`).

## Screens

Home (trending) · Search (incl. AI search) · Product detail (price slabs / MOQ / add to cart) ·
Cart + checkout (multi-supplier, GST) · OTP login · My orders · Account · AI assistant chat.

## Run it (test on a real phone in minutes — no Mac/Android Studio needed)

1. **Start the backend** (or use your deployed URL): in `apps/web`, `npm run dev` →
   `http://localhost:3000`.
2. Point the app at it. Use your computer's LAN IP so a phone can reach it (not `localhost`):
   ```bash
   cd apps/mobile
   npm install
   EXPO_PUBLIC_API_URL="http://<your-computer-LAN-IP>:3000" npx expo start
   ```
   (Or set it to your deployed Render URL to skip running the backend.)
3. Install **Expo Go** on your phone (App Store / Play Store) and **scan the QR code**. The app opens
   live on your phone — edits hot-reload.

Demo logins (OTP `123456`): buyer `9000000001` · supplier `9000000010` · admin `9000000099`.

## Build real store apps (when ready)

Use **EAS Build** (Expo's cloud build — no Mac needed for iOS):
```bash
npm install -g eas-cli
eas build --platform android   # → an .aab/.apk for Play Store
eas build --platform ios       # → an .ipa for App Store (needs an Apple Developer account)
```
`app.json` already sets the app name, icon, color, and bundle/package IDs.

## Notes

- **Verified here:** TypeScript typechecks and the whole app compiles through Metro
  (`npx expo export --platform web` → 521 modules bundled). Final on-device testing is the
  Expo Go step above.
- `EXPO_PUBLIC_API_URL` is the only config — it's the backend base URL.
- The app uses Bearer-token auth against the existing REST API (`/api/products`, `/api/auth/login`,
  `/api/cart`, `/api/checkout`, `/api/orders`, `/api/ai/chat`).
