# Gift Remembrance — Never Repeat a Gift

## Product Requirements Document

**Version:** 1.2.0 | **Type:** Offline-First Mobile Utility | **Platforms:** iOS & Android

**Companion documents:** `GiftRemembrance_DataSchema.md` (data model), `GiftRemembrance_ImplementationPlan.md` (build phases), `GiftRemembrance_UISpec.md` (complete visual & interaction design)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system) — see `GiftRemembrance_UISpec.md` for complete tokens
4. [Project Structure](#4-project-structure)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Specifications](#6-technical-specifications)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Platform Compatibility](#8-platform-compatibility)
9. [Development Milestones](#9-development-milestones)
10. [Risk Management](#10-risk-management)
11. [Appendix](#11-appendix)

---

## 1. Project Overview

**App Name:** `Gift Remembrance — Never Repeat a Gift`

**Objective:** A fully offline-first mobile utility for iOS and Android that helps people remember what gifts they've given and received, track birthdays and anniversaries (including shared ones like a parents' anniversary), attach photos to gift memories, and manage annual gift budgets per person. No account required, no login, no forced cloud sync — everything lives locally on device. Automatic local snapshot backups plus an optional one-time folder pick for cloud sync via iCloud (iOS) or Storage Access Framework (Android).

> **Core Principle:** Every feature works in airplane mode. All data stored locally via MMKV. Cloud backup is strictly optional and user-initiated once. Ad-supported monetization with a friction-based trigger (rate limiting) that also serves as UX protection against impulse data entry.

**Core Value Props:**

- Log every gift you give and receive — never repeat a gift accidentally again
- Photo attachments for visual memory of gifts
- Upcoming occasion reminders — birthdays, anniversaries, Christmas, custom dates
- **Shared occasions** — a single anniversary belongs to both partners, one gift can be for multiple people
- Per-person annual budget tracking — see who you've spent too little/too much on
- Import contacts from phone — fast setup, no manual typing
- Fully offline — works in airplane mode, no account, no signup
- **Hybrid backup** — automatic local snapshots + optional one-time cloud folder setup
- Free with ads — banner always, interstitial only when rate limit hit
- 100% private by default — no cloud sync unless explicitly enabled

**Target Platforms:**

| Platform | Minimum               | Notes                                                     |
| -------- | --------------------- | --------------------------------------------------------- |
| iOS      | 15+                   | SafeAreaView, native notifications, iCloud Documents      |
| Android  | API 30+ (Android 11+) | BackHandler, POST_NOTIFICATIONS permission, SAF for backup|

---

## 2. Tech Stack

| Layer            | Technology                         | Version | Purpose                                             |
| ---------------- | ---------------------------------- | ------- | --------------------------------------------------- |
| Framework        | Expo (managed workflow + dev-client)| SDK 54 | Cross-platform React Native                         |
| Navigation       | Expo Router                        | v3      | File-based routing, screen transitions              |
| State Management | Redux Toolkit (RTK)                | v2      | Global state: people, gifts, occasions, settings    |
| Local Storage    | MMKV                               | v2      | All app data — synchronous, fast                    |
| Animations       | React Native Reanimated            | v3      | All spring/entering/interpolation animations        |
| Gestures         | React Native Gesture Handler       | v2      | Swipe to delete, pull to refresh                    |
| Styling          | StyleSheet.create                  | —       | Design tokens from `constants/theme.ts`             |
| Icons            | Lucide React Native                | latest  | Consistent iconography throughout                   |
| Fonts            | Expo Google Fonts                  | latest  | Plus Jakarta Sans (display) + Inter (body) — see UISpec §3
| Notifications    | expo-notifications                 | latest  | Local notifications for upcoming occasions          |
| Contacts         | expo-contacts                      | latest  | Import contacts with permission                     |
| Image Picker     | expo-image-picker                  | latest  | Photo attachments for gifts                         |
| Image Manip      | expo-image-manipulator             | latest  | Compress/resize photos before saving                |
| File System      | expo-file-system                   | latest  | Store gift photos, manage backup files              |
| Haptics          | expo-haptics                       | latest  | Subtle feedback on actions                          |
| Ads              | react-native-google-mobile-ads     | latest  | AdMob banner + interstitial                         |
| Zip archive      | react-native-zip-archive           | latest  | Bundle backup manifest + photos into single file    |
| SAF (Android)    | @react-native-documents/picker     | latest  | Storage Access Framework folder / file picker       |
| Date Handling    | date-fns                           | latest  | Lightweight date math, no Moment bloat              |

> **Deliberately NOT included:** No Supabase, no Firebase, no auth providers, no Google Sign-In / Drive OAuth, no analytics SDK beyond what AdMob requires. The app has no mandatory network dependency. Only AdMob requires network; backup is file-based.

> **Requires dev-client / EAS build, not Expo Go.** Because of AdMob, MMKV, and react-native-zip-archive native modules.

---

## 3. Design System

> **Design Source:** All visual design — colors, typography, spacing, radii, shadows, components, motion, and screen layouts — is specified in detail in `GiftRemembrance_UISpec.md`. That document is the source of truth. This section summarizes the key decisions; the UISpec has exact values.

### 3.1 Typography

Two Google Fonts only:

- **Display / Headings:** Plus Jakarta Sans (600, 700)
- **Body / UI:** Inter (400, 500, 600, 700)

No separate monospace family. Numeric alignment (prices, budgets, countdowns) uses `fontVariant: ['tabular-nums']` on the body font — see UISpec §3.3.

**Type scale summary** (see UISpec §3.2 for exact values):

```
hero        : 56px — Home next-occasion countdown number
display     : 32px — budget totals, person detail name
h1          : 26px — modal titles, celebration moments
h2          : 22px — card titles, gift detail
h3          : 18px — list row primary text
sectionLabel: 12px uppercase — "UPCOMING", "KEY DATES", etc.
body        : 15px — default body text
caption     : 13px — secondary meta info, dates
micro       : 11px — timestamps, badges
```

### 3.2 Spacing & Layout

8pt grid (see UISpec §2.3):

```
xs(4) | sm(8) | md(12) | lg(16) | xl(20) | 2xl(24) | 3xl(32) | 4xl(40) | 5xl(48) | 6xl(64)

Border radius: sm(6) | md(10) | lg(14) | xl(20) | 2xl(28) | full(9999)
```

### 3.3 Motion & Animation

All animations use **React Native Reanimated v3**. No `Animated` from React Native core.

**Screen transitions** (`app/(main)/_layout.tsx`):

- Home → Person Detail: `slide_from_right`, 280ms
- Home → Add Gift: `slide_from_bottom` (modal feel), 340ms
- Any screen → Settings: `slide_from_bottom`, 340ms
- Back to Home: `fade`, 220ms

**Page-level entering animations:**

- `ScreenHeader`: `FadeInDown.springify()` 350ms
- Person list rows: `FadeInDown.delay(index * 40)` staggered
- Gift timeline items: `FadeInDown.delay(index * 50)` staggered
- Occasion cards on Home: `FadeInRight.delay(index * 60)` staggered
- Budget ring on Person Detail: `FadeIn.delay(120)` 400ms
- Settings sections: `FadeInDown.delay(80).springify()` 380ms

**Interactive press animations** (all via `withSpring`):

- Primary buttons: scale 1 → 0.95
- List rows: scale 1 → 0.97
- FAB: scale + rotation 0° → 45° on open + pulse glow when closed
- Chip filters: scale 1 → 0.91
- Back buttons, icon buttons: scale 1 → 0.88

**Swipe to delete** (gift and person rows):

- `PanGestureHandler` tracks horizontal drag
- Row translates with finger, red delete background reveals
- Release past threshold → row slides off, undo toast appears

**Budget ring:**

- Circular SVG progress ring — Reanimated `withTiming` drives `strokeDashoffset`
- Color interpolates: under budget (safe) → on target (neutral) → over budget (warning)
- Center text: amount spent / budget total (see UISpec §6.12)

**Countdown display (next occasion on Home):**

- Large days-until number with subtle pulse at < 7 days remaining
- Soft color shift as date approaches (see UISpec §2.1 `colors.countdown`)

**Photo attachment:**

- Tap photo → zoom modal with `withSpring` scale animation
- Pinch to zoom (Gesture Handler)

### 3.4 Component Style Rules

> Colors, exact spacing values, and full component specifications are in `GiftRemembrance_UISpec.md` §6. The rules below summarize layout structure and behavior — the UISpec has complete dimensions, colors, and states.

**PersonCard (list item):**

- Avatar circle (contact photo or initials) on left
- Name + upcoming occasion in center
- Days-until countdown + budget progress on right
- Swipe left reveals delete action

**GiftCard (timeline item on person detail):**

- Thumbnail photo on left (if attached), placeholder icon if not
- Gift name + occasion + date
- Direction indicator: "Given" (outgoing icon) / "Received" (incoming icon)
- Price if tracked
- **Shared badge** — if the gift links to 2+ people, small badge showing "+N others"
- Tap to open Gift Detail modal

**OccasionCard (home screen upcoming):**

- Person avatar(s) stacked if shared + name(s) joined (e.g. "Mom & Dad")
- Occasion type (Birthday, Anniversary, Christmas, Custom)
- Date + days-until countdown
- Quick "Add Gift Idea" action

**Buttons (Button.tsx):**

- Primary: filled background, inverse text
- Secondary: transparent background, border + primary text
- Destructive: error-color background, white text
- Height: 52px, full border radius (see UISpec §6.1)

**BannerAd:**

- Fixed at bottom of all main screens
- Standard AdMob banner (320x50 / adaptive)
- Respects safe area inset on iOS
- Never obscures primary content (content padding adjusted)

**BudgetRing:**

- SVG circle, `strokeDashoffset` animated by Reanimated
- Center text: currency-formatted amount
- Over-budget state: amount shown in warning color, subtle red pulse

**EmptyState (per screen):**

- Illustrative icon from Lucide
- Heading + subtitle
- Primary action button (e.g., "Add Your First Person")

**MultiPersonPicker:**

- Used in Add Occasion and Add Gift flows
- Searchable list of people with checkboxes
- Defaults to single-select; supports multi-select
- Shows selected count at top, "Done" button to confirm
- Inline "+ Add new person" option at top of list

---

## 4. Project Structure

```
/
├── app/
│   ├── _layout.tsx                  # Root layout: Redux provider, fonts, ErrorBoundary, Toast, AdMob init
│   └── (main)/
│       ├── _layout.tsx              # Stack with screen transitions (slide/fade/bottom)
│       ├── index.tsx                # HomeScreen — upcoming occasions + recent activity
│       ├── people.tsx               # PeopleListScreen — all tracked people
│       ├── person/[id].tsx          # PersonDetailScreen — gift history, budget, occasions
│       ├── add-gift.tsx             # AddGiftScreen — log a new gift (modal)
│       ├── add-person.tsx           # AddPersonScreen — create or import a person
│       ├── add-occasion.tsx         # AddOccasionScreen — create occasion, 1+ people (modal)
│       ├── gift/[id].tsx            # GiftDetailScreen — full gift detail with photo
│       ├── calendar.tsx             # CalendarScreen — all occasions by month
│       ├── contacts-import.tsx      # ContactsImportScreen — pick contacts to add
│       └── settings.tsx             # SettingsScreen — notifications, backup, ad prefs, about
│
├── components/
│   ├── people/
│   │   ├── PersonCard.tsx           # List row with avatar, name, next occasion, swipe-to-delete
│   │   ├── PersonAvatar.tsx         # Circle avatar — photo or initials fallback
│   │   ├── PersonAvatarStack.tsx    # 1–3 overlapping avatars for shared occasions/gifts
│   │   ├── MultiPersonPicker.tsx    # Searchable people picker, single or multi-select
│   │   ├── OccasionList.tsx         # List of occasions for a person
│   │   └── BudgetRing.tsx           # Annual budget progress ring
│   ├── gifts/
│   │   ├── GiftCard.tsx             # Timeline row with photo, name, direction (given/received)
│   │   ├── GiftPhotoPicker.tsx      # Photo attach flow (camera / library / none)
│   │   ├── GiftDirectionToggle.tsx  # Given vs Received toggle
│   │   └── GiftTimeline.tsx         # Chronological list of gifts for a person
│   ├── occasions/
│   │   ├── OccasionCard.tsx         # Upcoming occasion card on Home
│   │   ├── OccasionTypePicker.tsx   # Birthday / Anniversary / Christmas / Custom
│   │   └── CountdownBadge.tsx       # Animated days-until countdown
│   ├── calendar/
│   │   ├── MonthView.tsx            # Month grid showing all occasions
│   │   └── OccasionDot.tsx          # Small colored marker on calendar day
│   ├── ads/
│   │   ├── BannerAdSlot.tsx         # AdMob banner wrapper with safe area awareness
│   │   └── InterstitialManager.tsx  # Rate-limit-triggered interstitial controller
│   └── ui/
│       ├── Button.tsx               # Primary / secondary / destructive variants
│       ├── Input.tsx                # Text input with label + error display
│       ├── DatePicker.tsx           # Platform-native date picker wrapper
│       ├── CurrencyInput.tsx        # Amount input with currency symbol
│       ├── ScreenHeader.tsx         # App wordmark + icon buttons (FadeInDown entry)
│       ├── EmptyState.tsx           # Empty state with icon + action button
│       ├── ErrorBoundary.tsx        # Global crash fallback UI
│       ├── Toast.tsx                # Lightweight toast notification system
│       ├── ConfirmSheet.tsx         # Confirmation bottom sheet
│       ├── Skeleton.tsx             # Skeleton loaders
│       ├── FABMenu.tsx              # Expandable animated FAB
│       └── SwipeableRow.tsx         # Reusable swipe-to-delete row wrapper
│
├── store/
│   ├── index.ts                     # Redux store config
│   ├── hooks.ts                     # useAppDispatch / useAppSelector (typed)
│   └── slices/
│       ├── peopleSlice.ts           # People: id, name, photo, budget, contactId
│       ├── giftsSlice.ts            # Gifts: id, personIds[], name, date, direction, price, photo
│       ├── occasionsSlice.ts        # Occasions: id, personIds[], type, date, recurring
│       ├── settingsSlice.ts         # Notifications, currency, language, backup, ad state
│       └── adsSlice.ts              # Rate-limit tracking: adds in last 5 min, last interstitial shown
│
├── hooks/
│   ├── usePeople.ts                 # CRUD operations + sorted lists
│   ├── useGifts.ts                  # Gift CRUD + timeline per person
│   ├── useOccasions.ts              # Occasion CRUD + upcoming sorted
│   ├── useNotifications.ts          # Schedule/cancel local notifications per occasion
│   ├── useContacts.ts               # Contact permission + import flow
│   ├── usePhotoAttach.ts            # Photo picker + compress + save to FileSystem
│   ├── useBackup.ts                 # Auto local snapshots + optional cloud folder (iCloud/SAF)
│   ├── useAds.ts                    # Banner ready state + interstitial trigger
│   └── useSettings.ts               # Read/write settings from Redux + MMKV
│
├── constants/
│   ├── occasionTypes.ts             # Built-in occasion definitions (birthday, anniversary, etc.)
│   ├── currencies.ts                # Supported currency list + symbols
│   ├── theme.ts                     # Design tokens — see UISpec §2 & §3 for values
│   └── config.ts                    # APP_CONFIG, RATE_LIMIT, AD_UNIT_IDS, NOTIFICATION_CONFIG
│
├── types/
│   ├── person.ts                    # Person, PersonWithStats
│   ├── gift.ts                      # Gift, GiftDirection, GiftPhoto
│   ├── occasion.ts                  # Occasion, OccasionType, RecurrenceRule
│   ├── backup.ts                    # BackupManifest, BackupVersion
│   └── store.ts                     # RootState, AppDispatch
│
├── utils/
│   ├── dateUtils.ts                 # daysUntil, nextOccurrence, formatRelative
│   ├── budgetUtils.ts               # computeYearSpend, budgetStatus
│   ├── photoUtils.ts                # compressImage, saveToAppDir, deleteFromAppDir
│   ├── notificationUtils.ts         # scheduleForOccasion, cancelForOccasion, reschedule (60-day window)
│   ├── backupUtils.ts               # zip/unzip backup, validate manifest, auto-snapshot
│   ├── contactMapper.ts             # Map expo-contacts Contact -> Person
│   ├── rateLimiter.ts               # addEventRecorded, shouldShowInterstitial
│   ├── storage.ts                   # MMKV: saveAll / loadAll wrappers for each slice
│   └── errorHandler.ts              # mapError for crash boundary
│
├── app.json
├── babel.config.js
└── tsconfig.json                    # strict: true, zero any
```

---

## 5. Functional Requirements

### 5.1 Home Screen (`index.tsx`)

- App wordmark + subtitle
- **Upcoming Occasions** section — next 5 occasions sorted by days-until, as horizontal scroll of `OccasionCard`
- **Recent Activity** section — last 10 gifts logged (given or received), as vertical list of `GiftCard`
- Empty state if no people added yet: "Add someone you care about to get started" + Add Person button
- FAB (bottom right) with expandable menu:
  - Add Gift
  - Add Person
  - Add Occasion
- Settings icon in header (top right)
- Bottom banner ad (persistent)
- Zero loading state — instant render, no network check

### 5.2 People List Screen (`people.tsx`)

- Vertical list of all people as `PersonCard` rows
- Search bar at top — filters by name
- Sort chips: By Name / By Next Occasion / By Recent Activity
- Each row:
  - Avatar circle (contact photo or initials)
  - Name (base, Bold)
  - Next occasion label + days-until
  - Annual budget ring (mini, shows progress)
  - Swipe left → delete action with confirm
- Tap row → navigates to `/person/[id]`
- Empty state: "No people yet. Import from contacts or add manually." with two action buttons
- Bottom banner ad

### 5.3 Person Detail Screen (`person/[id].tsx`)

#### Header section

- Large avatar
- Person name (2xl, Bold)
- Tags/relationship chip (e.g., "Spouse", "Mom", "Friend") — optional, user-set
- Edit icon → edit person details

#### Budget section

- `BudgetRing` showing year-to-date spend vs annual budget
- **Shared-gift policy:** a gift linked to this person + other people counts **fully** against this person's budget (not split). A €100 anniversary gift given to "Mom & Dad" shows €100 in Mom's budget AND €100 in Dad's budget.
- Quick budget edit
- Tap ring → shows spend breakdown by occasion

#### Occasions section

- List of occasions (Birthday, Anniversary, Christmas, Custom) that this person is linked to (including shared occasions like a parents' anniversary that also links to a sibling/partner)
- Each with date, days-until, next countdown
- Add/edit/delete occasions inline — deleting a shared occasion removes the link for this person only unless this is the last linked person
- Shared occasions show other linked people (e.g. "Anniversary (with Dad)")

#### Gift Timeline section

- Tabs: **All** / **Given** / **Received**
- Chronological list of `GiftCard` rows (most recent first)
- Each card: thumbnail, name, occasion, date, direction, price
- **Shared gifts appear here** for every person linked — e.g. a gift given to Mom & Dad appears in Mom's timeline AND Dad's timeline, with a "+1 other" badge
- Tap → Gift Detail modal
- Swipe left → delete with confirm + undo toast (deletes the gift entirely; removing only one person's link is done via edit)
- Empty state for each tab: "No gifts given to [name] yet"
- Infinite scroll pagination (batches of 20, lazy loaded)

#### Duplicate warning

- If user logs a gift with the same name as one given to this person in the last 2 years → show warning banner: "You gave [Name] this gift on [Date]" before save confirmation
- For shared gifts: checks each linked person independently; warns if any match

### 5.4 Add Gift Screen (`add-gift.tsx`) — modal

Accessed from: FAB on Home, FAB on Person Detail, or "+" on Gift Timeline.

- **Direction toggle:** Given / Received (segmented control)
- **People:** `MultiPersonPicker` — required, 1 or more
  - Defaults to single-select; user taps the multi-select icon to pick multiple
  - Quick "+ Add new person" inline
  - If opened from Person Detail, that person is pre-selected
- **Gift name:** text input — required
- **Date:** date picker (default: today)
- **Occasion:** dropdown — Birthday / Anniversary / Christmas / Just Because / Custom
  - If any selected person has an upcoming occasion within ±14 days, pre-select it
- **Price:** optional input in the locked global currency
- **Photo attachment:** optional
  - Take Photo (camera)
  - Choose from Library
  - No photo
  - If selected: thumbnail preview, tap X to remove
- **Notes:** multiline text — optional
- **Save** button (primary) → dispatch `gifts/add` → pop modal → toast "Gift saved"
- **Cancel** button → confirm discard if form dirty
- On save: increment rate limit counter → check interstitial trigger

### 5.5 Add Person Screen (`add-person.tsx`) — modal

Two entry modes:

#### Manual entry

- Name (required)
- Relationship tag (optional)
- Avatar photo (optional — camera / library)
- Birthday (optional — triggers auto-occasion create for this person only)
- Annual budget (optional, in the locked global currency)
- Notes

> Anniversary is **not** created from Add Person anymore (since anniversaries are typically shared between two people). Instead, after creating the person, use "Add Occasion" to create a shared anniversary linking both partners.

#### Import from Contacts

- Button: "Import from Contacts" → navigates to `/contacts-import`
- On return with selected contacts → person(s) created pre-filled

### 5.6 Add Occasion Screen (`add-occasion.tsx`) — modal (NEW)

Accessed from: FAB on Home, or inline from Person Detail.

- **Occasion type:** `OccasionTypePicker` — Birthday / Anniversary / Christmas / Valentine's / Mother's Day / Father's Day / Custom (with label input)
- **People:** `MultiPersonPicker` — 1 or more (defaults to single-select for birthday, multi-select for anniversary/christmas/etc.)
  - Inline "+ Add new person"
  - Pre-filled if opened from Person Detail
- **Date:** date picker
  - For recurring occasions, the year matters only for anniversaries (year of wedding etc.); the month/day is what recurs
- **Recurring:** toggle (defaults: on for built-in types, off for custom)
- **Save** → creates ONE occasion with `personIds: string[]`, schedules one notification per occasion (not per person)
- **Cancel** → confirm discard if dirty

### 5.7 Contacts Import Screen (`contacts-import.tsx`)

- Request `expo-contacts` permission on mount (gracefully handle denial)
- List of contacts with name, phone, avatar — checkboxes
- Search bar at top
- Select multiple → "Import [N] contacts" button
- On import: creates one Person per selected contact, mapping: name → name, photo → avatar, birthday field → birthday occasion (single-person occasion)
- Progress indicator during import
- Skip duplicates (match by contactId already imported)

### 5.8 Gift Detail Screen (`gift/[id].tsx`)

- Large photo (if attached) — tap to zoom modal
- Gift name (xl, Bold)
- Given to / Received from **[Person name(s)]** — if 2+ people, shows "Mom, Dad, and 1 other" — tap each to navigate to that person
- Occasion + date
- Price (if set) — displayed in the locked global currency
- Notes (if any)
- Edit button → opens add-gift screen with pre-filled data (people, photo, all fields)
- Delete button → confirm sheet → removes gift + photo file (deletes the gift entirely, including all person links)

### 5.9 Calendar Screen (`calendar.tsx`)

- Month view with navigation (prev/next month arrows)
- Colored dots on days that have occasions
- Tap day → bottom sheet listing all occasions on that day (shared occasions show combined person names)
- "Today" button to return to current month
- Toggle: Show past occasions / hide past
- Bottom banner ad

### 5.10 Settings Screen (`settings.tsx`)

#### Notifications section

- Master toggle: Enable Notifications
- Reminder timing: How many days before occasion (1 / 3 / 7 / 14 default: 7)
- Reminder time of day: default 9:00 AM, user-editable
- Test notification button

#### Backup & Data section

- **Auto local backup:** always on, shows "Last auto-backup: [timestamp]" (runs daily in app-private folder)
- **Cloud backup destination:**
  - iOS: iCloud Documents (auto-enabled if user is signed into iCloud on device; show status + instructions if not)
  - Android: "Set up backup folder" button → launches SAF folder picker. Once chosen, persists permission. Shows folder path + "Change folder" button.
  - "None" option available on both platforms
- "Backup Now" button (manual trigger for both local snapshot AND cloud folder if set up)
- "Restore from Backup" button → picks file → validates → confirm Replace or Merge
- "Export Data" button → creates `.gftrmb.zip` file via share sheet (works even without cloud setup)
- "Import Data" button → picks `.gftrmb.zip` file and restores

#### Preferences section

- **Currency** — **locked after first gift is logged** (grayed out with explainer: "Currency is locked because you've already logged gifts. To change, delete all data and re-import.")
  - Before first gift: picker of 20+ currencies (USD, EUR, GBP, VND, JPY, etc.)
- Language picker (matches device by default)
- Theme: Light / Dark / System

#### Ads section

- "Remove ads" — placeholder for future IAP (not in v1.0)
- Info text: "Ads support the app being free."
- "Reset ad preferences" (for GDPR/UMP consent re-show)

#### About section

- App version
- Privacy policy link (opens in-app web view)
- Open source licenses
- Contact support email link

#### Data section (NEW)

- **"Export My Data"** — produces the same `.gftrmb.zip` as manual backup; share sheet
- **"Delete All Data"** — destructive, two-step confirm:
  1. First confirm: "This will delete all people, gifts, occasions, and photos on this device. Your cloud backups are not affected. This cannot be undone."
  2. Type "DELETE" to confirm
  3. Wipes MMKV, deletes all files in `<DocumentDirectory>/photos/`, `avatars/`, and local `backups/`, cancels all scheduled notifications, resets currency lock
  4. Returns user to empty Home state
- Distinct from **"Restore from Backup"** — delete is irreversible on-device; restore replaces current state with a backup file

### 5.11 Notification Behavior

```typescript
// When an occasion is created or its date changes:
scheduleForOccasion(occasion, settings):
  cancel any existing notifications for this occasion.id
  if (!settings.notificationsEnabled) return
  compute next occurrence date (handle recurring yearly)
  if next occurrence is more than 60 days away → do NOT schedule yet (avoids iOS 64-notification cap)
  schedule local notification at (occurrenceDate - settings.daysBefore) at settings.timeOfDay
  title: for single-person: "[Person name]'s [Occasion Type] is in [N] days"
         for shared:        "[Name1] & [Name2]'s [Occasion Type] is in [N] days"
  body: "Open Gift Remembrance to plan a gift"
```

- All notifications are **local** — no push server required
- **60-day scheduling window** — prevents hitting iOS's 64 scheduled local notifications cap
- On app cold start and daily on foreground (via `AppState` listener): run a "reschedule sweep" to pick up occasions newly entering the 60-day window
- On notification tap: open the person detail screen (for single-person occasions) or home screen (for shared — since there's no single target person)

### 5.12 Ads Behavior

#### Banner ads

- Shown persistently at bottom of: Home, People List, Person Detail, Calendar, Gift Detail
- NOT shown on: Add Gift, Add Person, Add Occasion, Contacts Import, Settings (friction-sensitive screens)
- Uses AdMob adaptive banner size
- Respects safe area bottom inset

#### Interstitial ads — rate limit triggered

```typescript
// utils/rateLimiter.ts
const WINDOW_MS = 5 * 60 * 1000;     // 5 minutes
const THRESHOLD = 5;                  // 5 add events in window
const COOLDOWN_MS = 10 * 60 * 1000;   // min 10 minutes between interstitials

function shouldShowInterstitial(): boolean {
  const now = Date.now();
  const recentAdds = state.ads.addEvents.filter(t => now - t < WINDOW_MS);
  const lastShown = state.ads.lastInterstitialAt;
  return recentAdds.length >= THRESHOLD
      && (now - lastShown) > COOLDOWN_MS;
}
```

- Events counted: Gift added, Person added, Occasion added
- Only triggered after a save action — never interrupts editing
- Interstitial closes → user returns to Home (or previous screen)
- Records `lastInterstitialAt` to prevent spam

#### UMP / Consent

- On first launch: show Google UMP consent form for EEA/UK users (personalized ads enabled)
- iOS 14.5+: App Tracking Transparency prompt before AdMob init
- Settings has "Reset ad preferences" to re-trigger consent form

---

## 6. Technical Specifications

### 6.1 Redux Store Shape

```typescript
interface RootState {
  people: {
    byId: Record<string, Person>;
    allIds: string[];
  };
  gifts: {
    byId: Record<string, Gift>;
    allIds: string[];
    byPersonId: Record<string, string[]>;       // index for fast per-person queries; one gift id may appear under multiple people
  };
  occasions: {
    byId: Record<string, Occasion>;
    allIds: string[];
    byPersonId: Record<string, string[]>;       // one occasion id may appear under multiple people
  };
  settings: {
    notificationsEnabled: boolean;               // default: true
    reminderDaysBefore: 1 | 3 | 7 | 14;           // default: 7
    reminderTimeOfDay: string;                    // 'HH:mm' format, default '09:00'
    currency: CurrencyCode;                       // default: device locale — LOCKED after first gift
    currencyLocked: boolean;                      // true once first gift logged
    language: LanguageCode;                       // default: device locale
    theme: 'light' | 'dark' | 'system';           // default: 'system'
    backupDestination: 'icloud' | 'saf' | 'none'; // iOS uses 'icloud', Android 'saf'
    safFolderUri: string | null;                  // Android only — persisted SAF tree URI
    lastAutoBackupAt: number | null;              // unix ms
    lastCloudBackupAt: number | null;             // unix ms
  };
  ads: {
    bannerReady: boolean;
    interstitialReady: boolean;
    addEvents: number[];                          // array of unix ms timestamps
    lastInterstitialAt: number;
    consentStatus: 'unknown' | 'required' | 'obtained' | 'not_required';
  };
}
```

### 6.2 Key Data Types

```typescript
// types/person.ts
export interface Person {
  id: string;                                   // UUID v4
  name: string;
  relationship: string | null;                  // e.g. 'Spouse', 'Dad'
  avatarUri: string | null;                     // local file:// URI or null
  annualBudget: number | null;                  // in smallest currency unit (cents)
  notes: string | null;
  contactId: string | null;                     // expo-contacts id if imported
  createdAt: number;
  updatedAt: number;
}

// types/gift.ts
export type GiftDirection = 'given' | 'received';

export type OccasionLinkType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'just_because'
  | 'custom';

export interface Gift {
  id: string;
  personIds: string[];                          // 1+ people this gift is linked to
  name: string;
  direction: GiftDirection;
  date: string;                                 // ISO yyyy-MM-dd
  occasionType: OccasionLinkType;
  customOccasionLabel: string | null;
  price: number | null;                         // in smallest currency unit
  photoUri: string | null;                      // local file://... path under AppDir/photos/
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}
// NOTE: `currency` is no longer per-gift — it comes from settings.currency (globally locked)

// types/occasion.ts
export type OccasionType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'custom';

export interface Occasion {
  id: string;
  personIds: string[];                          // 1+ people — anniversary of parents links both
  type: OccasionType;
  customLabel: string | null;
  date: string;                                 // ISO yyyy-MM-dd (anchor date)
  recurring: boolean;                           // if true, recurs annually
  notificationId: string | null;                // scheduled expo-notifications id
  createdAt: number;
  updatedAt: number;
}
// Invariant: type === 'birthday' implies personIds.length === 1

// types/backup.ts
export interface BackupManifest {
  version: 2;                                   // bumped from v1 — multi-person schema
  createdAt: number;
  appVersion: string;
  deviceOs: 'ios' | 'android';
  data: {
    people: Person[];
    gifts: Gift[];
    occasions: Occasion[];
    settings: Partial<SettingsState>;
  };
  // photos NOT inline — stored as separate files inside the .gftrmb.zip archive
}

// Archive contents: backup.gftrmb.zip
//   /manifest.json                 ← BackupManifest
//   /photos/<gift_id>.jpg          ← referenced gift photos
//   /avatars/<person_id>.jpg       ← referenced avatars
```

### 6.3 MMKV Persistence Keys

| Key                  | Type             | Description                                         |
| -------------------- | ---------------- | --------------------------------------------------- |
| `people`             | JSON (normalized)| Full people state slice                             |
| `gifts`              | JSON (normalized)| Full gifts state slice                              |
| `occasions`          | JSON (normalized)| Full occasions state slice                          |
| `settings`           | JSON             | Full settings object (includes currencyLocked)      |
| `ads_state`          | JSON             | Rate limit events, last interstitial ts, consent    |
| `schema_version`     | number           | For future migrations (v1.1 = 2)                    |

Writes are debounced (500ms) per slice to avoid excessive disk I/O.

### 6.4 Photo Storage

Photos are NOT stored in MMKV (too large). They live in:

```
<DocumentDirectory>/photos/<gift_id>.jpg
<DocumentDirectory>/avatars/<person_id>.jpg
```

Pipeline:

1. `expo-image-picker` returns URI (may be temp)
2. `expo-image-manipulator` compresses to max 1200px wide, JPEG quality 0.7
3. `expo-file-system` copies to permanent app directory
4. Store only the permanent path in Redux/MMKV
5. On gift/person deletion: delete the file
6. **For gifts linked to multiple people:** photo stored once, keyed by gift ID (not per person)

### 6.5 Cloud Backup — Hybrid Strategy

The app uses a **three-tier backup strategy** — all file-based, zero OAuth, zero backend:

#### Tier 1 — Automatic local snapshot (always on)

- Runs daily (checked on app foreground, if > 24h since last snapshot)
- Writes to `<DocumentDirectory>/backups/auto-YYYY-MM-DD.gftrmb.zip`
- Keeps last 5 auto-snapshots, deletes older
- Purpose: protects against accidental deletion and app bugs
- **Caveat:** uninstalling the app deletes these. This is NOT cloud backup.

#### Tier 2 — Optional cloud folder (one-time setup)

**iOS — iCloud Documents:**
- If user is signed into iCloud on device, the app's iCloud container is available automatically. No in-app auth.
- Written to `<iCloudContainer>/Documents/Backups/backup-YYYY-MM-DD.gftrmb.zip`
- Visible to user in Files app → iCloud Drive → Gift Remembrance
- Settings shows status: "iCloud backup enabled" / "Sign into iCloud in Settings to enable"

**Android — Storage Access Framework (SAF):**
- Settings → "Set up backup folder" launches the system folder picker
- User picks any folder (e.g., one inside their Drive-synced folder, Dropbox folder, local folder)
- App calls `takePersistableUriPermission` → permission persists across reboots
- `safFolderUri` stored in settings
- Every backup writes to that folder as `backup-YYYY-MM-DD.gftrmb.zip`
- No OAuth, no Google Sign-In, no Play Store sensitive-scope verification needed

#### Tier 3 — Manual export (always available)

- "Export Data" button produces `.gftrmb.zip` → opens native share sheet
- User can send to email, messaging app, save to any location
- Universal fallback — works on both platforms identically

#### Archive format

Backup is a zip archive (`.gftrmb.zip`) containing:

```
manifest.json                   # BackupManifest (see §6.2)
photos/
  <gift_id>.jpg
  ...
avatars/
  <person_id>.jpg
  ...
```

Max expected size: ~50MB for 500 gifts with photos. Zip reduces JSON footprint ~90%, and photos are already compressed JPEGs so zip adds little overhead there — but single-file unit stays intact for cloud sync.

Backup flow:

```typescript
async function createBackup(): Promise<string> {
  const tmpDir = await createTempDir();
  await fs.writeAsStringAsync(`${tmpDir}/manifest.json`, JSON.stringify({
    version: 2,
    createdAt: Date.now(),
    appVersion: Constants.expoConfig?.version,
    deviceOs: Platform.OS,
    data: {
      people: selectAllPeople(state),
      gifts: selectAllGifts(state),
      occasions: selectAllOccasions(state),
      settings: selectSettings(state),
    },
  }));
  // Copy photos and avatars into tmpDir/photos and tmpDir/avatars
  await copyPhotosIntoDir(tmpDir);
  const zipPath = await zip(tmpDir, outputPath);
  return zipPath;
}
```

Restore flow confirms with user: "Replace current data?" or "Merge with current data?"

### 6.6 Occasion Recurrence

All birthday/anniversary/Christmas occasions recur annually. `nextOccurrence(occasion)` computes:

```typescript
function nextOccurrence(occasion: Occasion, from: Date = new Date()): Date {
  const [, month, day] = occasion.date.split('-').map(Number);
  const thisYear = new Date(from.getFullYear(), month - 1, day);
  if (thisYear >= from) return thisYear;
  return new Date(from.getFullYear() + 1, month - 1, day);
}
```

Leap-day birthdays (Feb 29): default to Feb 28 in non-leap years, configurable.

### 6.7 Notification Scheduling — 60-Day Window

```typescript
import * as Notifications from 'expo-notifications';
const NOTIFICATION_WINDOW_DAYS = 60;

async function scheduleForOccasion(occasion: Occasion, people: Person[], settings: SettingsState) {
  if (occasion.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(occasion.notificationId);
  }
  if (!settings.notificationsEnabled) return null;

  const nextDate = nextOccurrence(occasion);
  const now = new Date();
  const daysUntil = differenceInDays(nextDate, now);

  // Skip scheduling if outside window — will be picked up by the reschedule sweep later
  if (daysUntil > NOTIFICATION_WINDOW_DAYS) return null;

  const triggerDate = subDays(nextDate, settings.reminderDaysBefore);
  const [hh, mm] = settings.reminderTimeOfDay.split(':').map(Number);
  triggerDate.setHours(hh, mm, 0, 0);

  if (triggerDate <= now) return null; // don't schedule in the past

  const personNames = occasion.personIds
    .map(pid => people.find(p => p.id === pid)?.name ?? 'Someone');
  const displayNames = personNames.length === 1
    ? personNames[0]
    : personNames.length === 2
      ? `${personNames[0]} & ${personNames[1]}`
      : `${personNames[0]} and ${personNames.length - 1} others`;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${displayNames}'s ${occasionLabel} is in ${settings.reminderDaysBefore} days`,
      body: 'Open Gift Remembrance to plan a gift',
      data: { personIds: occasion.personIds, occasionId: occasion.id },
    },
    trigger: { date: triggerDate },
  });

  return id; // store on occasion.notificationId
}
```

**Reschedule sweep:** on cold start AND daily on foreground (via `AppState`), iterate all occasions and re-run `scheduleForOccasion` — this handles:
- Yearly rollover (Jan 1 issue)
- Occasions newly entering the 60-day window
- Device time changes

### 6.8 Rate Limit & Interstitial Logic

```typescript
// constants/config.ts
export const RATE_LIMIT = {
  WINDOW_MS: 5 * 60 * 1000,
  THRESHOLD: 5,
  INTERSTITIAL_COOLDOWN_MS: 10 * 60 * 1000,
};

// utils/rateLimiter.ts
export function recordAddEvent(state: AdsState): AdsState {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.WINDOW_MS;
  const recentEvents = [...state.addEvents.filter(t => t > cutoff), now];
  return { ...state, addEvents: recentEvents };
}

export function shouldShowInterstitial(state: AdsState): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.WINDOW_MS;
  const recent = state.addEvents.filter(t => t > cutoff).length;
  const cooledDown = (now - state.lastInterstitialAt) > RATE_LIMIT.INTERSTITIAL_COOLDOWN_MS;
  return recent >= RATE_LIMIT.THRESHOLD && cooledDown;
}
```

### 6.9 Duplicate Detection

Before saving a new Gift with direction='given':

```typescript
function findPotentialDuplicates(draft: Gift, gifts: Gift[]): Gift[] {
  const twoYearsAgo = subYears(new Date(), 2);
  // For shared gifts, warn per-linked-person — one match surfaces the warning
  return gifts.filter(g =>
    g.direction === 'given' &&
    g.personIds.some(pid => draft.personIds.includes(pid)) &&
    normalizeName(g.name) === normalizeName(draft.name) &&
    parseISO(g.date) > twoYearsAgo
  );
}
```

If any matches found → show warning banner in AddGift modal with a "Save anyway" / "Cancel" action, listing the overlap (e.g. "You gave Mom this same gift on Jan 2024").

### 6.10 Currency Lock

```typescript
// On gift save:
function saveGift(draft: Gift) {
  const s = getState().settings;
  if (!s.currencyLocked) {
    dispatch(settings/setCurrencyLocked(true));
  }
  dispatch(gifts/add(draft));
}

// In Settings UI:
<CurrencyPicker
  value={settings.currency}
  disabled={settings.currencyLocked}
  disabledHint="Currency is locked because you have gifts logged. To change, use Settings → Delete All Data."
/>
```

Rationale: since `Gift.price` is stored as an integer in the smallest unit of the current currency, changing currency mid-stream would silently corrupt all prior amounts (¥1000 ≠ $1000). Locking avoids the footgun.

### 6.11 Delete All Data

```typescript
async function deleteAllData(): Promise<void> {
  // 1. Cancel all scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Wipe MMKV
  mmkv.clearAll();

  // 3. Delete photo/avatar/backup directories
  await FileSystem.deleteAsync(`${FileSystem.documentDirectory}photos/`, { idempotent: true });
  await FileSystem.deleteAsync(`${FileSystem.documentDirectory}avatars/`, { idempotent: true });
  await FileSystem.deleteAsync(`${FileSystem.documentDirectory}backups/`, { idempotent: true });

  // 4. Recreate empty directories
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos/`, { intermediates: true });
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}avatars/`, { intermediates: true });
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}backups/`, { intermediates: true });

  // 5. Reset Redux store to initial state (including currency unlock)
  dispatch({ type: 'RESET_ALL' });
}
```

Note: does NOT touch iCloud Drive contents or SAF folder contents — those are user-controlled and persist. If the user wants to nuke cloud backups too, they do it in Files / Drive / Dropbox themselves.

---

## 7. Non-Functional Requirements

| Requirement           | Target                  | Implementation                                                                          |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| App cold start        | < 1.5 seconds           | MMKV synchronous load, Redux hydrated before first frame                                |
| List scroll perf      | 60fps                   | FlatList with `getItemLayout`, `keyExtractor`, memoized rows                            |
| Photo save latency    | < 800ms                 | Compress on worklet thread via image-manipulator                                        |
| Notification accuracy | ±1 min                  | Uses native scheduled notifications, no background JS dependency                        |
| Animation performance | 60fps on mid-range      | All animations on UI thread via Reanimated v3                                           |
| TypeScript            | Strict, zero `any`      | `"strict": true` in tsconfig.json                                                       |
| Accessibility         | WCAG 2.1 AA             | `accessibilityLabel` on all interactive elements, 44×44pt minimum touch targets         |
| Offline core          | 100% — no exceptions    | All CRUD works offline. Only ads use network; backup is file-based.                     |
| Bundle size           | < 30MB                  | AdMob SDK is biggest addition; assets optimized                                         |
| Privacy               | Local-first             | No data leaves device unless user explicitly enables cloud backup                       |
| Photo storage         | Efficient               | Max 1200px, JPEG q=0.7; avg ~150KB/photo                                                |
| Data integrity        | No corruption on crash  | MMKV atomic writes, Redux state persisted after each reducer                            |
| Notification capacity | ≤ 60 scheduled at a time| 60-day window + reschedule sweep handles overflow                                       |

---

## 8. Platform Compatibility

### iOS (15+)

- `SafeAreaView` + `edges` prop on all screens
- `KeyboardAvoidingView behavior="padding"` on all form screens
- No `BackHandler` needed — swipe navigation handles back
- Haptics via `expo-haptics`: `impactLight`, `impactMedium`, `notificationSuccess`
- Notifications: request `Notifications.requestPermissionsAsync()` on first schedule
- Contacts: `Contacts.requestPermissionsAsync()` with clear rationale in `Info.plist`
- Photos: `NSPhotoLibraryUsageDescription` + `NSCameraUsageDescription` in `Info.plist`
- **iCloud: entitlement for Documents, container ID configured** in `app.json` iOS plugin config. Works automatically if user is signed into iCloud on device — no in-app auth.
- AdMob: SKAdNetwork IDs and `GADApplicationIdentifier` in `Info.plist`
- App Tracking Transparency: prompt for tracking auth before AdMob init (required for iOS 14.5+)

### Android (API 30+)

- `KeyboardAvoidingView behavior="height"` on form screens
- `BackHandler.addEventListener("hardwareBackPress")` on modals → close modal, don't exit app
- `slide_from_right` animation explicitly set in `_layout.tsx`
- `READ_CONTACTS` + `POST_NOTIFICATIONS` permissions declared in `app.json`
- `READ_MEDIA_IMAGES` permission for photo library (Android 13+)
- **SAF for backup:** no Google Sign-In, no Drive OAuth, no sensitive-scope verification. User picks a folder once (e.g., inside their Drive-synced local folder) via system picker.
- AdMob: `com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml` via `app.json`
- Status bar: translucent false, normal app chrome

### Shared Rules

- All animations via Reanimated on UI thread
- No mandatory network calls — ads fail silently if offline
- AdMob init must complete before showing any ad; never block app usage on ad load
- Backup operations show clear progress UI and handle cancellation

---

## 9. Development Milestones

### Phase 1 — Foundation

- [ ] Expo SDK 54 + TypeScript strict + Expo Router v3 + dev-client (no Expo Go)
- [ ] Install: Reanimated v3, Gesture Handler v2, MMKV v2, Redux Toolkit v2
- [ ] Install: Lucide React Native, react-native-svg
- [ ] Install: expo-notifications, expo-contacts, expo-image-picker, expo-image-manipulator
- [ ] Install: expo-file-system, expo-haptics, expo-document-picker
- [ ] Install: react-native-google-mobile-ads
- [ ] Install: react-native-zip-archive
- [ ] Install: @react-native-documents/picker (Android SAF)
- [ ] Install: date-fns, uuid
- [ ] Install: `@expo-google-fonts/plus-jakarta-sans` and `@expo-google-fonts/inter`
- [ ] `constants/theme.ts` — all design tokens populated per UISpec §2 & §3
- [ ] `constants/occasionTypes.ts`, `constants/currencies.ts`
- [ ] `constants/config.ts` — APP_CONFIG, RATE_LIMIT, AD_UNIT_IDS, NOTIFICATION_WINDOW_DAYS=60
- [ ] ErrorBoundary + Toast system
- [ ] Redux store scaffold: 5 empty slices

### Phase 2 — Data Layer

- [ ] `types/person.ts`, `types/gift.ts`, `types/occasion.ts`, `types/backup.ts`
- [ ] `utils/storage.ts` — MMKV read/write for all slices with debounced persistence
- [ ] `utils/dateUtils.ts` — daysUntil, nextOccurrence, formatRelative
- [ ] `utils/budgetUtils.ts` — computeYearSpend (full-count for shared gifts), budgetStatus
- [ ] `utils/photoUtils.ts` — compressImage, saveToAppDir, deleteFromAppDir
- [ ] `utils/notificationUtils.ts` — scheduleForOccasion (60-day window), cancelForOccasion, rescheduleAll
- [ ] `utils/contactMapper.ts` — map expo-contacts Contact to Person
- [ ] `utils/rateLimiter.ts` — recordAddEvent, shouldShowInterstitial
- [ ] `utils/backupUtils.ts` — zip/unzip manifest + photos; auto-snapshot daily
- [ ] `peopleSlice.ts` — CRUD + normalized state
- [ ] `giftsSlice.ts` — CRUD + by-person multi-index
- [ ] `occasionsSlice.ts` — CRUD + reschedule notifications on changes
- [ ] `settingsSlice.ts` — all fields + currencyLocked + MMKV sync
- [ ] `adsSlice.ts` — rate limit state + interstitial tracking
- [ ] `hooks/usePeople.ts`, `useGifts.ts`, `useOccasions.ts`
- [ ] `hooks/useNotifications.ts`, `useContacts.ts`, `usePhotoAttach.ts`
- [ ] `hooks/useBackup.ts`, `useAds.ts`, `useSettings.ts`

### Phase 3 — UI Components

- [ ] `Button.tsx`, `Input.tsx`, `DatePicker.tsx`, `CurrencyInput.tsx`
- [ ] `ScreenHeader.tsx`, `EmptyState.tsx`, `Toast.tsx`, `ConfirmSheet.tsx`
- [ ] `Skeleton.tsx`, `FABMenu.tsx`, `SwipeableRow.tsx`
- [ ] `PersonCard.tsx`, `PersonAvatar.tsx`, `PersonAvatarStack.tsx`, `MultiPersonPicker.tsx`
- [ ] `OccasionList.tsx`, `BudgetRing.tsx`
- [ ] `GiftCard.tsx`, `GiftPhotoPicker.tsx`, `GiftDirectionToggle.tsx`, `GiftTimeline.tsx`
- [ ] `OccasionCard.tsx`, `OccasionTypePicker.tsx`, `CountdownBadge.tsx`
- [ ] `MonthView.tsx`, `OccasionDot.tsx`
- [ ] `BannerAdSlot.tsx`, `InterstitialManager.tsx`
- [ ] **Baseline animations included during build:** `FadeInDown` on ScreenHeader, press scales on buttons/cards, screen transitions — so components feel right from day one

### Phase 4 — Core Screens

- [ ] `HomeScreen` (`index.tsx`) — upcoming + recent + FAB + banner
- [ ] `PeopleListScreen` (`people.tsx`) — list, search, sort, swipe delete
- [ ] `PersonDetailScreen` (`person/[id].tsx`) — header, budget ring, occasions, timeline (shared gifts appear here too)
- [ ] `AddGiftScreen` (`add-gift.tsx`) — MultiPersonPicker, full form with photo, duplicate warning
- [ ] `AddPersonScreen` (`add-person.tsx`) — manual form (no anniversary here) + import entry point
- [ ] `AddOccasionScreen` (`add-occasion.tsx`) — unified flow: type → people (1+) → date
- [ ] `GiftDetailScreen` (`gift/[id].tsx`) — photo zoom, multi-person display, edit, delete
- [ ] `CalendarScreen` (`calendar.tsx`) — month view with occasion dots

### Phase 5 — Integrations

- [ ] **Contacts import:** `contacts-import.tsx` screen, permission flow, select-and-import
- [ ] **Photo attach:** end-to-end camera/library/compress/save flow working
- [ ] **Notifications:** permission prompt, schedule on occasion create (60-day window), reschedule on edit, cancel on delete, sweep on cold start + daily on foreground
- [ ] **AdMob banner:** adaptive size, safe area, hidden on form screens
- [ ] **AdMob interstitial:** preload, show on rate-limit trigger, cooldown enforced
- [ ] **UMP consent:** first-launch form for EEA/UK, reset option in Settings
- [ ] **iOS ATT:** tracking auth prompt before AdMob init

### Phase 6 — Backup (Hybrid)

- [ ] **Auto local snapshot:** daily job on foreground (if > 24h), writes to `<DocumentDirectory>/backups/auto-YYYY-MM-DD.gftrmb.zip`, prunes old
- [ ] **iCloud Documents (iOS):** entitlements, container config, write/read backup zip directly
- [ ] **SAF folder picker (Android):** `@react-native-documents/picker`, `takePersistableUriPermission`, write backup zip to user-chosen folder
- [ ] **Manual "Backup Now":** writes local snapshot + cloud backup (if destination configured)
- [ ] **Export:** generate `.gftrmb.zip`, share via native share sheet
- [ ] **Import:** document picker, unzip + validate manifest, merge vs replace confirm
- [ ] **Photos in backup:** copied as files inside zip (not base64) — efficient parse + restore
- [ ] **Backup UI in Settings:** last auto-backup + last cloud-backup timestamps, backup now, restore, destination setup

### Phase 7 — Animations (complex)

- [ ] Screen transitions in `_layout.tsx` (baseline done in Phase 3)
- [ ] PersonCard list stagger (FadeInDown delay * 40)
- [ ] GiftCard timeline stagger (FadeInDown delay * 50)
- [ ] OccasionCard horizontal scroll stagger (FadeInRight)
- [ ] BudgetRing withTiming strokeDashoffset + color interpolation
- [ ] CountdownBadge pulse when < 7 days remaining
- [ ] FABMenu rotation + pulse glow + spring child items
- [ ] Swipe-to-delete gesture + undo toast
- [ ] Photo zoom modal spring scale + pinch-to-zoom

### Phase 8 — Polish & QA

- [ ] Accessibility audit: all interactive elements have `accessibilityLabel`
- [ ] Dark mode support — theme-aware tokens
- [ ] iOS QA: permissions, notifications, iCloud, AdMob sandbox, ATT prompt
- [ ] Android QA: permissions, notifications, SAF picker + restore, AdMob sandbox, back button
- [ ] Font scaling QA at 1.5×
- [ ] Unit tests: slices, dateUtils, budgetUtils (shared gift full-count), rateLimiter, notificationUtils (60-day), backupUtils (zip round-trip)
- [ ] Edge case: photo storage full (graceful error)
- [ ] Edge case: contact sync with 5000+ contacts (pagination + search)
- [ ] Edge case: backup restore with photo files missing (skip and log)
- [ ] Edge case: notifications permission denied → explain, offer settings deeplink
- [ ] Edge case: ad fails to load → silent, banner slot collapses
- [ ] Edge case: SAF folder permission revoked → prompt re-pick
- [ ] Edge case: Delete All Data → Redux reset, MMKV wiped, currency unlocked
- [ ] Privacy policy draft
- [ ] App Store + Play Store submission assets (screenshots, description, age rating)

---

## 10. Risk Management

| Risk                                            | Likelihood | Impact   | Mitigation                                                                              |
| ----------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------------------------- |
| User denies notification permission             | High       | Medium   | App still works fully; soft prompt in Settings with deeplink to OS settings             |
| User denies contacts permission                 | Medium     | Low      | Manual entry always available; show friendly explanation                                |
| Photo library fills device storage              | Low        | Medium   | Compress on import, show storage warning at 100MB total photo usage                     |
| Large backup zip fails on restore               | Low        | High     | Stream unzip; validate manifest; show progress; restore is transactional                |
| AdMob SDK crash on init                         | Low        | Medium   | Wrap init in try-catch; app functions fully without ads                                 |
| iCloud not signed in                            | Medium     | Low      | Detect state on backup attempt, prompt to enable in Settings                            |
| SAF folder permission revoked by user/OS        | Low        | Low      | Detect on backup, prompt to re-pick folder; auto local snapshot still runs              |
| iOS 64 scheduled notifications cap hit          | Low        | Medium   | 60-day scheduling window + daily sweep — caps active notifications far below limit      |
| Notification misses yearly rollover             | Medium     | Medium   | Reschedule sweep on every cold start + daily on foreground                              |
| User imports backup from newer app version      | Low        | Medium   | Manifest includes version; show "Update app to restore" message                         |
| Interstitial ads too aggressive — hurt UX       | Medium     | Medium   | 10 min cooldown; only after save actions; never on first session; monitor retention     |
| GDPR / ATT consent not collected properly       | Medium     | High     | Google UMP SDK for EEA/UK; ATT prompt on iOS 14.5+; Settings has reset option           |
| Date handling bugs (leap year, timezones)       | Medium     | Medium   | Use `date-fns`, store dates as ISO `yyyy-MM-dd` (no time/tz), unit tests for edge cases |
| MMKV write failure (disk full, etc.)            | Very Low   | High     | Try-catch all writes; show toast, preserve in-memory state; never crash                 |
| Contacts with no birthday / weird data shapes   | High       | Low      | Map defensively; only import name + photo + birthday if valid                           |
| User changes global currency by mistake         | Low        | High     | Currency locked after first gift; changing requires Delete All Data                     |
| User deletes shared occasion expecting per-person| Medium    | Medium   | Clear UI labeling; confirm dialog distinguishes "remove my link" vs "delete entirely"   |

---

## 11. Appendix

### 11.1 Environment Setup

```bash
# 1. Create project
npx create-expo-app@latest gift-remembrance --template blank-typescript
cd gift-remembrance

# 2. Switch to dev-client (needed for AdMob, MMKV, zip-archive native modules)
npx expo install expo-dev-client

# 3. Core dependencies
npx expo install expo-router react-native-reanimated react-native-gesture-handler
npx expo install react-native-mmkv @reduxjs/toolkit react-redux
npx expo install lucide-react-native react-native-svg

# 4. Feature dependencies
npx expo install expo-notifications expo-contacts expo-image-picker
npx expo install expo-image-manipulator expo-file-system expo-haptics
npx expo install expo-document-picker

# 5. Ads
npx expo install react-native-google-mobile-ads

# 6. Backup
npm install react-native-zip-archive
npm install @react-native-documents/picker

# 7. Utilities
npm install date-fns uuid
npm install --save-dev @types/uuid

# 8. Fonts
npx expo install @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/inter

# 9. Build a dev client (required — won't run in Expo Go)
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 11.2 app.json Key Configuration

Required configuration snippets (fill in values during Phase 1):

- `ios.infoPlist.NSContactsUsageDescription` — reason for contacts access
- `ios.infoPlist.NSPhotoLibraryUsageDescription` — reason for photos access
- `ios.infoPlist.NSCameraUsageDescription` — reason for camera access
- `ios.infoPlist.NSUserTrackingUsageDescription` — reason for ATT (AdMob personalization)
- `ios.infoPlist.GADApplicationIdentifier` — AdMob iOS app ID
- `ios.entitlements` — iCloud container for backups (com.apple.developer.icloud-container-identifiers)
- `android.permissions` — `READ_CONTACTS`, `POST_NOTIFICATIONS`, `READ_MEDIA_IMAGES`
- `android.config.googleMobileAdsAppId` — AdMob Android app ID
- `plugins` — `expo-notifications`, `expo-contacts`, `expo-image-picker`, `react-native-google-mobile-ads`, `expo-dev-client`

### 11.3 AdMob Setup Checklist

Before Phase 5 integration:

- [ ] Create AdMob account (admob.google.com)
- [ ] Create app entry for iOS and Android
- [ ] Create ad units:
  - [ ] Banner (iOS)
  - [ ] Banner (Android)
  - [ ] Interstitial (iOS)
  - [ ] Interstitial (Android)
- [ ] Copy App IDs + Ad Unit IDs into `constants/config.ts`
- [ ] Link AdSense account for payout
- [ ] Set up test devices for sandbox

During development, always use **Google's test ad unit IDs** — never production IDs. Swap to production only for release builds.

### 11.4 Reference Links

| Resource                       | URL                                                            |
| ------------------------------ | -------------------------------------------------------------- |
| Expo Docs                      | https://docs.expo.dev                                          |
| Expo Router v3                 | https://expo.github.io/router                                  |
| React Native Reanimated v3     | https://docs.swmansion.com/react-native-reanimated             |
| Redux Toolkit                  | https://redux-toolkit.js.org                                   |
| react-native-mmkv              | https://github.com/mrousavy/react-native-mmkv                  |
| expo-notifications             | https://docs.expo.dev/versions/latest/sdk/notifications        |
| expo-contacts                  | https://docs.expo.dev/versions/latest/sdk/contacts             |
| expo-image-picker              | https://docs.expo.dev/versions/latest/sdk/imagepicker          |
| expo-file-system               | https://docs.expo.dev/versions/latest/sdk/filesystem           |
| react-native-google-mobile-ads | https://docs.page/invertase/react-native-google-mobile-ads     |
| react-native-zip-archive       | https://github.com/mockingbot/react-native-zip-archive         |
| @react-native-documents/picker | https://github.com/douglasjunior/react-native-documents-picker |
| AdMob Console                  | https://admob.google.com                                       |
| Google UMP SDK                 | https://developers.google.com/admob/ump/android/quick-start    |
| date-fns                       | https://date-fns.org                                           |
