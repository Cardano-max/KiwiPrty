# 📱 Get an installable Android APK (to send your client)

The app is built with **Expo**. Expo's cloud (**EAS Build**) compiles the APK for you and gives you a
**download link on expo.dev** — that's the link you send the client. You don't need a Mac, Android
Studio, or any SDK.

> Why you run this (and not me): an EAS build runs under **your** free Expo account, and my build
> sandbox has no Android SDK and can't reach Expo's build servers. The commands below are
> copy-paste — it takes ~15 minutes, mostly waiting.

---

## Step 1 — one-time: a free Expo account
Sign up at **https://expo.dev** (just email + password). That's it.

## Step 2 — point the app at your live backend
Open **`apps/mobile/eas.json`** and replace `EXPO_PUBLIC_API_URL` (appears twice) with your live
backend URL — the `https://…onrender.com` link from the **Deploy to Render** step. This is so the app
shows live data. (No backend yet? Deploy it first — see the main README's one-click button.)

## Step 3 — build the APK
In a terminal on any computer with internet:

```bash
cd apps/mobile
npm install
npx eas-cli@latest login         # your expo.dev email + password
npx eas-cli@latest init          # press Y to create the project (first time only)
npx eas-cli@latest build -p android --profile preview
```

Wait ~10–15 min. When it finishes it prints a link like:

```
🤖 Android app:
https://expo.dev/accounts/<you>/projects/kiwi-party/builds/<id>
```

Open that link → there's a **Download** button and a **QR code** for the `.apk`.

## Step 4 — what your client does (on an Android phone)
1. Open the expo.dev link (or the direct `.apk` link) on the phone.
2. Tap **Download** → open the downloaded `.apk`.
3. If Android warns, allow **"Install from unknown apps"** → **Install**.
4. Open **Kiwi Party**. Demo logins (OTP `123456`): buyer `9000000001`, supplier `9000000010`,
   admin `9000000099`.

---

## ⚡ Even faster: test with no build (2 minutes)
If you just want the client to *try* it immediately without an APK:

```bash
cd apps/mobile
EXPO_PUBLIC_API_URL="https://your-backend.onrender.com" npx expo start
```
A QR code appears. The client installs **Expo Go** (Play Store / App Store) and scans it — the app
runs live on their phone.

## 🍏 iPhone / App Store / Play Store (later)
- iOS test build (TestFlight) or store builds need an **Apple Developer** ($99/yr) and/or **Google
  Play** ($25 once) account:
  ```bash
  npx eas-cli@latest build -p ios --profile production       # iOS (needs Apple account)
  npx eas-cli@latest build -p android --profile production   # Play Store .aab
  npx eas-cli@latest submit -p android                       # upload to Play Store
  ```
- `app.json` already has the app name, icon, colour, and bundle/package IDs set.

---

### Tip: I can trigger the build for you *if* you want
If you create an Expo **access token** (expo.dev → Account → Settings → Access Tokens) and paste it to
me, I can *try* to start the build from here — but Expo's servers are partially blocked in my
environment, so it may fail. Running the 4 commands above on your own machine is the reliable path.
