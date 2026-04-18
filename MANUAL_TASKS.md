# Manual Tasks — Remaining work that needs your hands

Everything in this file requires a real device, a developer account, design assets, or a decision only you can make. Work through top-to-bottom in roughly the order shown.

---

## 1. Ship-blockers (required before store submission)

### 1.1 Device QA on real hardware
- [ ] Install on a physical iOS device via TestFlight or a signed dev build.
- [ ] Install on a physical mid-range Android (API 30+).
- [ ] Run through the critical flows:
  - [ ] Add person → add gift → view on Person Detail → delete
  - [ ] Shared gift: add → verify appears on both timelines → delete → verify removed from both
  - [ ] Shared occasion: add anniversary with 2 people → verify one notification scheduled with joined names
  - [ ] Contacts import with 2+ contacts
  - [ ] Backup → restore (both Replace and Merge) → verify photos re-link
  - [ ] Delete All Data → verify MMKV + photos wiped, currency unlocked
  - [ ] Rate limit: add 5 gifts within 5 min → confirm interstitial fires on 5th, not again within 10 min
- [ ] Run all screens under VoiceOver (iOS) and TalkBack (Android); fix any unreadable elements.
- [ ] Verify 60fps on Android: scroll People List with 50+ people, open FABMenu, swipe-to-delete — no jank.
- [ ] Verify dark mode on every screen. Code uses `useColorScheme()` + tokenized colors, but only real eyes can catch contrast issues.

### 1.2 Font scaling
- [ ] iOS: Settings → Accessibility → Display & Text Size → Larger Accessibility Sizes → max. Verify no truncation on gift/person cards, no broken layouts.
- [ ] Android: Settings → Display → Font size → largest. Same check.
- [ ] `maxFontSizeMultiplier={1.3}` is already applied to CountdownBadge, Chip, PersonAvatar initials, PersonAvatarStack overflow, OccasionCard. If you find others that overflow, add the same prop.

### 1.3 AdMob production setup
- [ ] Create AdMob account + app entries for iOS and Android at https://admob.google.com/.
- [ ] Create ad units: banner, interstitial, rewarded (one of each per platform, minimum).
- [ ] Swap test IDs in `constants/config.ts::AD_UNIT_IDS` with real IDs.
- [ ] In `app.json`, add the `react-native-google-mobile-ads` plugin config under `expo.plugins`:
  ```json
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-XXXXXXXX~XXXXXXXXXX",
      "iosAppId": "ca-app-pub-XXXXXXXX~XXXXXXXXXX",
      "userTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."
    }
  ]
  ```
- [ ] Sanity check: confirm no `__DEV__`-gated real IDs slip into release bundles. `utils/adsInit.ts` and `components/ads/*` already check `__DEV__` for TestIds — keep that pattern.

### 1.4 iCloud container (iOS only)
Current `utils/backupUtils.ts::writeToDestination` writes to a path like `/Library/Mobile Documents/iCloud~com~giftremembrance~app/Documents/` but the container itself doesn't exist until you configure entitlements.
- [ ] In Apple Developer portal, create an iCloud Container with identifier `iCloud.com.giftremembrance.app` (or whatever matches your bundle id; update `backupUtils.ts` path if different).
- [ ] In `app.json`, add iOS entitlements:
  ```json
  "ios": {
    "bundleIdentifier": "com.giftremembrance.app",
    "entitlements": {
      "com.apple.developer.icloud-container-identifiers": [
        "iCloud.com.giftremembrance.app"
      ],
      "com.apple.developer.icloud-services": ["CloudDocuments"],
      "com.apple.developer.ubiquity-container-identifiers": [
        "iCloud.com.giftremembrance.app"
      ]
    },
    "usesIcloudStorage": true
  }
  ```
- [ ] Rebuild with EAS or `expo prebuild`. Verify a backup zip appears in Files app → iCloud Drive → Gift Remembrance after "Backup Now".

### 1.5 Store assets
- [ ] App icon — 1024×1024 master, exported per platform. Replace placeholders in `assets/icon.png`.
- [ ] Splash screen — update `assets/splash.png` (or migrate to `expo-splash-screen` config in `app.json`).
- [ ] Screenshots — 6.9", 6.5" iPhone; 12.9" iPad; Android phone + tablet. Capture clean states (populated Home, Person Detail with gifts, Calendar, Settings).
- [ ] App description, keywords, subtitle, promotional text.
- [ ] Age rating: 4+ (no objectionable content).
- [ ] Privacy labels:
  - **iOS** App Privacy: Contact Info (Name — linked to user, user-provided), Photos (linked to user, user-provided), Identifiers (AdMob — linked to user, third-party advertising).
  - **Android** Data Safety: Contacts (optional, user-initiated, not shared), Photos (optional, user-initiated, not shared), Advertising ID (Google). No Drive OAuth means no sensitive-scope verification path.

### 1.6 Signing & upload
- [ ] iOS: set up App Store Connect app record; configure EAS with Apple certificates; `eas build --platform ios --profile production`.
- [ ] Android: generate signing keystore; configure EAS Android credentials; `eas build --platform android --profile production`.
- [ ] Submit to TestFlight / Internal Testing first; dogfood for at least a week before public release.

---

## 2. Post-ship nice-to-haves

### 2.1 Sentry DSN wiring
Code scaffold exists at `utils/errorTracking.ts` — DSN read from `Constants.expoConfig.extra.sentryDsn`.
- [ ] Create a Sentry project at https://sentry.io.
- [ ] Add `extra.sentryDsn` to `app.json`:
  ```json
  "extra": {
    "sentryDsn": "https://<your-public-key>@o<orgid>.ingest.sentry.io/<projectid>"
  }
  ```
- [ ] Follow https://docs.sentry.io/platforms/react-native/ for native source-map upload config.
- [ ] Test a deliberate crash in dev and confirm it arrives in the Sentry dashboard.

### 2.2 E2E testing
Recommended: **Maestro** (simpler than Detox for Expo apps).
- [ ] `curl -Ls "https://get.maestro.mobile.dev" | bash`
- [ ] Create `.maestro/critical-flow.yaml` covering: Add Person → Add Gift → appears on Home → delete → empty state.
- [ ] Create `.maestro/backup-flow.yaml` covering: Add Person → Backup → Delete All → Restore → verify person re-appears.
- [ ] Wire into CI (GitHub Actions has Maestro examples).

### 2.3 Home-screen widgets (native code required)
- [ ] iOS: new Widget Extension target in Xcode showing next 3 occasions from shared UserDefaults. Needs a bridge to write MMKV → App Group UserDefaults.
- [ ] Android: new Glance widget. Same bridge pattern.
- This is a multi-day effort — consider post-1.0.

### 2.4 `expo-file-system` v4 migration
- Currently all filesystem calls use `expo-file-system/legacy`. The new API is class-based with handles.
- [ ] Follow https://docs.expo.dev/versions/latest/sdk/filesystem/ migration guide.
- [ ] Affected files: `utils/backupUtils.ts`, `utils/photoUtils.ts`, `utils/safUtils.ts`, `utils/reconcile.ts`, `store/thunks/restoreThunk.ts`.
- Defer until Expo drops legacy support (likely SDK 56+).

### 2.5 `npm audit` review
- [ ] Run `npm audit` and triage findings.
- [ ] Prefer `npm audit fix` for non-breaking patches; review `--force` proposals manually before applying.

### 2.6 Multi-photo per gift (design decision)
- `constants/config.ts::APP_CONFIG.maxPhotosPerGift = 5` is declared but the `Gift.photoUri` field is a single string.
- [ ] Decide: keep single photo (ship as-is) OR migrate to `photoUris: string[]`. Latter requires:
  - New schema version 3 migration
  - UI changes in GiftPhotoPicker, GiftDetail, GiftCard, backupUtils photo copy
  - 1–2 days of work

### 2.7 i18n full coverage
Infrastructure set up at `utils/i18n.ts` with English baseline and ~10 keys demoed in Home. Next languages to consider: Spanish, Japanese, Vietnamese (matching your user's locale heritage).
- [ ] Add `es`, `ja`, `vi` translation dictionaries.
- [ ] Wrap remaining hardcoded strings across all screens and components with `t()` calls. Expect 200+ string touches.
- [ ] Wire the Language picker in Settings to actually change locale (currently a stub).

---

## 3. Decisions only you can make

- **License in `README.md`** — currently says "MIT (or pick your own)". Decide.
- **Support email in `PRIVACY_POLICY.md`** — currently `support@giftremembrance.app`. Point at a real mailbox you check.
- **Privacy policy hosting** — GitHub Pages, Notion public page, or embedded in the app. Link from Settings → About and from store listings.
- **Analytics stance** — current codebase ships ZERO analytics (design choice per privacy policy). If you ever want basic opt-in telemetry, pick a privacy-friendly tool (Aptabase, Plausible-for-apps) and gate it behind explicit user consent.
- **Backup file format** — `.gftrmb.zip` is the current extension. If you ever share backups between users (not currently supported), you'll want a cryptographic signature to detect tampering.

---

## Status legend

- [ ] = not done
- [x] = complete

Last updated: 2026-04-18
