# DK Dream Kitchen – Mobile App (Expo SDK 58, React Native, TypeScript)

Palette (from the client's website): forest green #1D3C2C, cream #F1E9D4, paper #F8F5EC.
Flow: animated splash -> onboarding (Next, Next, Next) -> Home. Tabs: Menu, Gallery, Home, Order, Contact, Reserve.

## Run locally
    npm install
    npx expo start

## Get the APK (GitHub Actions)
1. Create a GitHub repo and upload this whole folder (keep `package-lock.json` and the `.github` folder).
2. Push to `main`. Open the repo > Actions > "Build Android APK" (or press Run workflow).
3. When it finishes, download `DK-Dream-Kitchen-apk` from the run's Artifacts. Unzip and install the APK.
Versions are pinned (ubuntu-24.04, Node 22, JDK 17, `npm ci` from the lockfile), so no manual changes are needed.

## One-time email activation (free FormSubmit)
Bookings, orders and messages go to dkdreamk@gmail.com. The first submission triggers an
"Activate Form" email to that inbox: click the link once.

## Edit content
- `src/theme.ts` colours · `src/data/brand.ts` logo, contacts, hours · `src/data/menu.ts` menu
- `onboardingEveryLaunch` in brand.ts: false = onboarding only on first launch.
