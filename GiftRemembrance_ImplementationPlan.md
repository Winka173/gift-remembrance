# Gift Remembrance — Implementation Plan

**For Claude Code / Cursor** | Read these companion docs first, in this order: `GiftRemembrance_PRD.md` (what and why), `GiftRemembrance_DataSchema.md` (data model), `GiftRemembrance_UISpec.md` (complete visual & interaction design).

**Schema version:** 2 (multi-person occasions & gifts, global locked currency, zip backup)

---

## How to use this file

Work through phases in order. Each phase has:

- **Goal** — what done looks like
- **Tasks** — exact files to create/implement
- **Acceptance criteria** — how to verify before moving on

Start each session by telling Claude Code which phase you're working on.

---

## Phase 0 — Set Up Design Tokens from UISpec

**Goal:** Transcribe the design tokens from `GiftRemembrance_UISpec.md` into `constants/theme.ts` before writing any UI code.

> **Why this comes first:** All visual decisions — colors, fonts, spacing values, border radii, shadows — are specified exactly in the UISpec. The PRD describes structure and behavior. The UISpec describes how it looks. Do not invent any visual styles. Do not deviate from the tokens.

### Tasks

#### 0.1 Read the UISpec

- [ ] Read `GiftRemembrance_UISpec.md` end-to-end at least once before touching any code
- [ ] Pay special attention to §2 (Design Tokens), §3 (Typography), §4 (Iconography), §5 (Motion), and §6 (Components) — these define the vocabulary used throughout implementation

#### 0.2 Create `constants/theme.ts`

Transcribe — verbatim — from UISpec:

- [ ] `colorsLight` object — from UISpec §2.1 (primary, accent, semantic, bg, text, border, occasion, budget, countdown, direction)
- [ ] `colorsDark` object — from UISpec §2.2
- [ ] `spacing` object — from UISpec §2.3
- [ ] `radius` object — from UISpec §2.4
- [ ] `shadow` object — from UISpec §2.5 (with dark mode shadow adjustments noted)
- [ ] Export a theme hook or context that selects light/dark based on `settings.theme` + `useColorScheme()`

```typescript
// Example structure
export const colorsLight = { /* from UISpec §2.1 */ };
export const colorsDark = { /* from UISpec §2.2 */ };
export const spacing = { /* from UISpec §2.3 */ };
export const radius = { /* from UISpec §2.4 */ };
export const shadow = { /* from UISpec §2.5 */ };

export function useTheme() {
  const scheme = useColorScheme();
  const settingTheme = useAppSelector(s => s.settings.theme);
  const effective = settingTheme === 'system' ? scheme : settingTheme;
  return effective === 'dark'
    ? { colors: colorsDark, spacing, radius, shadow }
    : { colors: colorsLight, spacing, radius, shadow };
}
```

Rule: no file other than `theme.ts` and the type export should hold a hex color or a magic spacing number.

#### 0.3 Create `constants/typography.ts`

- [ ] Install the two font packages:

```bash
npx expo install @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/inter
```

- [ ] Load fonts in `app/_layout.tsx` via `useFonts`. Required weights: PlusJakartaSans 600, 700 + Inter 400, 500, 600, 700.
- [ ] Create the `typography` export matching UISpec §3.2 exactly (hero / display / h1 / h2 / h3 / sectionLabel / body / bodyMedium / bodySemi / button / caption / captionMedium / micro).
- [ ] For numeric display (§3.3), ensure places that render prices/budgets/countdowns apply `fontVariant: ['tabular-nums']`. Consider a small `<Num>` helper component.

#### 0.4 Install iconography dependency

- [ ] `npx expo install lucide-react-native react-native-svg`
- [ ] Create an `icons.ts` barrel file that re-exports every Lucide icon referenced in the UISpec §4.4 mapping table (e.g. `Cake`, `HeartHandshake`, `Gift`, `Users`, `Plus`, etc.) — importing from a single file keeps bundle size reviewable and misspellings catchable.

#### 0.5 Motion constants

- [ ] Create `constants/motion.ts` with `duration` constants from UISpec §5.2 and spring config presets from UISpec §5.5.

### ✅ Acceptance criteria

- `constants/theme.ts` exports `colorsLight`, `colorsDark`, `spacing`, `radius`, `shadow`, and a `useTheme()` hook. No placeholder values.
- `constants/typography.ts` exports every role from UISpec §3.2.
- `constants/motion.ts` exports duration + spring presets.
- A throwaway test screen rendering one Heading, one Body text, one Button, and one Chip shows correct colors in both light and dark mode (switch via OS theme toggle).
- No hex colors or magic numbers anywhere outside `theme.ts`.
- `npx tsc --noEmit` passes.

---

## Phase 1 — Foundation

**Goal:** Bare repo, all dependencies installed, fonts loading, design tokens in place, app renders without crashing.

### Tasks

#### 1.1 Project setup

- [ ] `npx create-expo-app@latest gift-remembrance --template blank-typescript`
- [ ] Install `expo-dev-client` — this project will NOT run in Expo Go due to native modules (AdMob, MMKV, zip-archive)
- [ ] Configure `app.json`:
  - `name`, `slug`, `scheme`
  - `plugins`: `expo-router`, `react-native-reanimated/plugin`, `expo-notifications`, `expo-contacts`, `expo-image-picker`, `react-native-google-mobile-ads`, `expo-dev-client`
  - iOS: `NSContactsUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription`, `NSUserTrackingUsageDescription`, `GADApplicationIdentifier`
  - iOS entitlements: **iCloud container** (`com.apple.developer.icloud-container-identifiers`, `com.apple.developer.icloud-services = ["CloudDocuments"]`)
  - Android: `READ_CONTACTS`, `POST_NOTIFICATIONS`, `READ_MEDIA_IMAGES` permissions
  - Android: `com.google.android.gms.ads.APPLICATION_ID`
- [ ] Configure `babel.config.js`: add `react-native-reanimated/plugin` (must be last)
- [ ] Set `"strict": true` in `tsconfig.json`
- [ ] Add path aliases to `tsconfig.json`: `@/` → `./`

#### 1.2 Install all dependencies

```bash
# Core
npx expo install expo-router react-native-reanimated react-native-gesture-handler
npx expo install react-native-mmkv @reduxjs/toolkit react-redux
npx expo install lucide-react-native react-native-svg

# Feature SDKs
npx expo install expo-notifications expo-contacts expo-image-picker
npx expo install expo-image-manipulator expo-file-system expo-haptics
npx expo install expo-document-picker expo-constants

# Ads
npx expo install react-native-google-mobile-ads

# Backup (NEW)
npm install react-native-zip-archive
npm install @react-native-documents/picker

# Utilities
npm install date-fns uuid
npm install --save-dev @types/uuid

# Fonts — per UISpec §3.1
npx expo install @expo-google-fonts/inter @expo-google-fonts/plus-jakarta-sans

# Dev client (required — not Expo Go compatible)
npx expo install expo-dev-client
```

#### 1.3 Design tokens

- [ ] `constants/theme.ts` — must already be fully populated from Phase 0
- [ ] Verify all values are filled in — no empty strings or placeholder zeros
- [ ] Export typed helpers: `type Colors = typeof colors;` etc.

#### 1.4 Constants

- [ ] `constants/occasionTypes.ts`

```typescript
export const OCCASION_TYPES = [
  { id: 'birthday',      label: 'Birthday',       icon: '🎂', defaultRecurring: true,  allowsMulti: false },
  { id: 'anniversary',   label: 'Anniversary',    icon: '💍', defaultRecurring: true,  allowsMulti: true  },
  { id: 'christmas',     label: 'Christmas',      icon: '🎄', defaultRecurring: true,  allowsMulti: true  },
  { id: 'valentines',    label: "Valentine's",    icon: '💝', defaultRecurring: true,  allowsMulti: true  },
  { id: 'mothers_day',   label: "Mother's Day",   icon: '🌷', defaultRecurring: true,  allowsMulti: true  },
  { id: 'fathers_day',   label: "Father's Day",   icon: '👔', defaultRecurring: true,  allowsMulti: true  },
  { id: 'custom',        label: 'Custom',         icon: '📅', defaultRecurring: false, allowsMulti: true  },
] as const;
```

> `allowsMulti: false` for birthday — the MultiPersonPicker locks to single-select when birthday is chosen.

- [ ] `constants/currencies.ts` — 20 common currencies with code, symbol, name
- [ ] `constants/config.ts`

```typescript
export const APP_CONFIG = {
  MAX_PHOTO_WIDTH: 1200,
  PHOTO_QUALITY: 0.7,
  DEFAULT_REMINDER_DAYS: 7,
  DEFAULT_REMINDER_TIME: '09:00',
  AUTO_BACKUP_INTERVAL_MS: 24 * 60 * 60 * 1000,    // 24h
  AUTO_BACKUP_RETAIN_COUNT: 5,                      // keep last 5 auto-snapshots
  NOTIFICATION_WINDOW_DAYS: 60,                     // schedule only occasions within this window
};

export const RATE_LIMIT = {
  WINDOW_MS: 5 * 60 * 1000,
  THRESHOLD: 5,
  INTERSTITIAL_COOLDOWN_MS: 10 * 60 * 1000,
};

// Use Google's test IDs during development, swap to real IDs for production builds
export const AD_UNIT_IDS = {
  banner: {
    ios:     __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'TODO_PROD_IOS_BANNER',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'TODO_PROD_ANDROID_BANNER',
  },
  interstitial: {
    ios:     __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'TODO_PROD_IOS_INTER',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'TODO_PROD_ANDROID_INTER',
  },
};

export const NOTIFICATION_CONFIG = {
  REMINDER_DAY_OPTIONS: [1, 3, 7, 14] as const,
  DEFAULT_HOUR: 9,
};

export const PHOTO_DIRS = {
  avatars: 'avatars',
  photos: 'photos',
  backups: 'backups',
};

export const CURRENT_SCHEMA_VERSION = 2;
export const BACKUP_FORMAT_VERSION = 2;
```

#### 1.5 Root layout scaffold

- [ ] `app/_layout.tsx`
  - Redux Provider
  - Font loading with `useFonts` (all fonts identified in Phase 0)
  - `SplashScreen.preventAutoHideAsync()` until fonts + MMKV ready
  - `ErrorBoundary` wrapper
  - `Toast` provider
  - AdMob initialization (deferred behind UMP consent on first launch)
  - Run `runMigrationsIfNeeded()` on boot
  - Run boot-time reconciliation (verify photo files exist, filter dangling personIds)
  - Request notification permissions lazily (only when user toggles on)
  - Register `AppState` listener for daily reschedule sweep + daily auto-backup check
- [ ] `components/ui/ErrorBoundary.tsx` — class component, crash fallback UI
- [ ] `components/ui/Toast.tsx` — lightweight toast (context + hook)

### ✅ Acceptance criteria

- App launches on iOS simulator and Android emulator without errors (dev-client build, not Expo Go)
- Fonts render correctly (verify with a test screen), using `fontVariant: ['tabular-nums']` where needed
- AdMob init returns a valid state (using test IDs)
- No TypeScript errors (`npx tsc --noEmit`)

---

## Phase 2 — Data Layer

**Goal:** All types defined, MMKV wired up, photos handled, notifications scheduled, Redux slices fully implemented with multi-person support.

### Tasks

#### 2.1 Types

- [ ] `types/person.ts` — `Person`, `PersonWithStats`
- [ ] `types/gift.ts` — `Gift` (with `personIds: string[]`, no per-gift currency), `GiftDirection`, `OccasionLinkType`
- [ ] `types/occasion.ts` — `Occasion` (with `personIds: string[]`), `OccasionType`, `ReminderDays`
- [ ] `types/backup.ts` — `BackupManifest` (version 2), `BackupDestination = 'icloud' | 'saf' | 'none'`
- [ ] `types/store.ts` — `RootState`, `AppDispatch`

Match the schema exactly — see `GiftRemembrance_DataSchema.md` §2.

#### 2.2 Utils

- [ ] `utils/dateUtils.ts`
  - `nextOccurrence(occasion: Occasion, from?: Date): Date`
  - `daysUntil(date: Date): number`
  - `formatRelative(date: Date): string` — "in 3 days" / "tomorrow" / "today"
  - `formatDate(iso: string, locale: string): string`
  - Edge case: leap-day handling for Feb 29 (fallback to Feb 28)

- [ ] `utils/budgetUtils.ts`
  - `computeYearSpend(personId: string, gifts: Gift[], year: number): number` — **full-count for shared gifts**: if a gift's `personIds` includes `personId`, the full `price` counts toward this person's spend (no splitting)
  - `computeBudgetStatus(person: Person, ytdSpend: number): BudgetStatus`
  - `formatCurrency(amount: number, currency: CurrencyCode): string`

- [ ] `utils/photoUtils.ts`
  - `compressImage(uri: string): Promise<string>` — max 1200px, q=0.7, JPEG
  - `saveToAppDir(srcUri: string, subdir: 'avatars' | 'photos', id: string): Promise<string>`
  - `deleteFromAppDir(uri: string): Promise<void>`
  - `ensureDir(subdir: string): Promise<void>`

- [ ] `utils/notificationUtils.ts`
  - `requestPermissionIfNeeded(): Promise<boolean>`
  - `scheduleForOccasion(occasion, people, settings): Promise<string | null>` — returns notification ID, or null if outside 60-day window
  - `cancelForOccasion(notificationId): Promise<void>`
  - `rescheduleAll(occasions, people, settings): Promise<Map<occasionId, notificationId>>`
  - Title formatting: single person → "[Name]'s [Occasion]"; 2 people → "[A] & [B]'s [Occasion]"; 3+ → "[A] and N others' [Occasion]"

- [ ] `utils/rateLimiter.ts`
  - `recordAddEvent(state: AdsState): AdsState`
  - `shouldShowInterstitial(state: AdsState): boolean`
  - `pruneOldEvents(events: number[]): number[]`

- [ ] `utils/contactMapper.ts`
  - `mapContactToPerson(contact: Contacts.Contact): { person: Partial<Person>, birthday?: string }`

- [ ] `utils/storage.ts` — MMKV wrapper
  - `saveSlice(key: string, value: unknown, debounceMs?: number): void`
  - `loadSlice<T>(key: string, fallback: T): T`
  - Debounced write queue implementation

- [ ] `utils/backupUtils.ts`
  - `createBackupZip(state): Promise<string>` — writes manifest.json + photos/avatars to temp dir, zips it, returns zip path
  - `unzipAndValidate(zipPath): Promise<{ manifest, tempDir }>`
  - `validateManifest(manifest: unknown): manifest is BackupManifest`
  - `applyManifest(manifest, tempDir, mode: 'replace' | 'merge'): Promise<void>`
  - `runAutoBackupIfDue(settings): Promise<void>` — checks `lastAutoBackupAt`, runs if > 24h, prunes to last 5
  - `writeToDestination(zipPath, settings): Promise<void>` — iCloud (iOS) or SAF folder (Android)

- [ ] `utils/safUtils.ts` (Android only)
  - `pickBackupFolder(): Promise<string | null>` — launches SAF folder picker, calls `takePersistableUriPermission`
  - `writeFileToSafFolder(folderUri, fileName, content): Promise<void>`
  - `listFilesInSafFolder(folderUri): Promise<string[]>`

- [ ] `utils/migrations.ts`
  - `MIGRATIONS: Record<number, (mmkv) => void>` — includes migration 2 per DataSchema §8
  - `runMigrationsIfNeeded(): void`

- [ ] `utils/errorHandler.ts` — `mapError(err): string`

- [ ] `utils/reconcile.ts` — boot-time file reconciliation + reference integrity check (see DataSchema §5.3)

- [ ] `utils/indexUtils.ts` (NEW, helper for multi-person indexes)
  - `addToMultiIndex(index, ids, recordId): newIndex`
  - `removeFromMultiIndex(index, ids, recordId): newIndex`
  - `updateMultiIndex(index, oldIds, newIds, recordId): newIndex` — diff + apply

#### 2.3 Redux slices

- [ ] `store/slices/peopleSlice.ts`

```typescript
interface PeopleState {
  byId: Record<string, Person>;
  allIds: string[];
}

// Actions to implement
addPerson(person: Person)
updatePerson({ id, changes })
deletePerson(id)                  // cascade handled in thunk, not reducer
setPeople(people: Person[])       // bulk load on boot + on backup restore
```

- [ ] `store/slices/giftsSlice.ts`

```typescript
interface GiftsState {
  byId: Record<string, Gift>;
  allIds: string[];
  byPersonId: Record<string, string[]>;   // ONE gift ID may appear under MULTIPLE person entries
}

// Actions
addGift(gift: Gift)                       // updates byPersonId for ALL personIds
updateGift({ id, changes })               // if personIds changed, rebuild index entry
deleteGift(id)                            // remove from ALL person entries
setGifts(gifts: Gift[])                   // rebuild indexes from scratch
deleteGiftsForPerson(personId)            // cascade helper — for each gift where this is sole person, delete it; otherwise remove from personIds
removePersonFromGifts(personId)           // cascade helper — strip personId from all gifts; if any end up empty, delete those
```

Maintain `byPersonId` atomically in every relevant reducer — use the `utils/indexUtils.ts` helpers.

- [ ] `store/slices/occasionsSlice.ts`

```typescript
interface OccasionsState {
  byId: Record<string, Occasion>;
  allIds: string[];
  byPersonId: Record<string, string[]>;   // ONE occasion ID may appear under MULTIPLE person entries
}

// Actions
addOccasion(occasion)
updateOccasion({ id, changes })           // if personIds changed, rebuild index entry
deleteOccasion(id)                        // remove from all person entries
setOccasions(occasions)
removePersonFromOccasions(personId)       // cascade: strip from personIds, delete if empty
setNotificationId({ occasionId, notificationId })   // after scheduling
```

- [ ] `store/slices/settingsSlice.ts`
  - All fields from `SettingsState` including `currencyLocked`, `safFolderUri`, `lastAutoBackupAt`, `lastCloudBackupAt`
  - `setCurrency` reducer REJECTS the change if `currencyLocked === true` (throws, caught upstream)
  - Each mutation writes to MMKV via debounced `saveSlice`
  - On init: `loadSlice('settings', defaults)`

- [ ] `store/slices/adsSlice.ts`
  - `setBannerReady`, `setInterstitialReady` (transient — not persisted)
  - `recordAddEvent()`, `recordInterstitialShown()`, `setConsentStatus()` (persisted)

- [ ] `store/index.ts` — configure store with all 5 slices, `RESET_ALL` action for Delete All Data
- [ ] `store/hooks.ts` — typed `useAppDispatch` and `useAppSelector`

#### 2.4 Thunks (complex flows that touch multiple slices + side effects)

- [ ] `store/thunks/createPersonThunk.ts` — creates Person, optionally creates single-person birthday Occasion (NOT anniversary — anniversaries are created via Add Occasion), schedules notification
- [ ] `store/thunks/deletePersonThunk.ts` — cascades:
  - For each Gift linked to this person: if sole person, delete + remove photo; if shared, strip from personIds
  - Same for Occasions (if emptied, cancel notification + delete)
  - Delete avatar file
- [ ] `store/thunks/saveGiftThunk.ts` — handles photo compression + file save, sets `currencyLocked = true` on first save, rate-limit event, triggers interstitial check
- [ ] `store/thunks/saveOccasionThunk.ts` — schedules/reschedules notification (within 60-day window), writes notificationId back to state, updates all affected person indexes
- [ ] `store/thunks/importContactsThunk.ts` — batch creates People from selected contacts
- [ ] `store/thunks/backupThunk.ts` — creates zip + writes to `<DocumentDirectory>/backups/` AND destination (iCloud/SAF) if configured
- [ ] `store/thunks/autoBackupThunk.ts` — runs auto local snapshot if > 24h since last, prunes to 5 newest
- [ ] `store/thunks/restoreThunk.ts` — unzips, validates manifest, applies (replace or merge), regenerates photo paths, rebuilds indexes, reschedules notifications
- [ ] `store/thunks/deleteAllDataThunk.ts` — cancels notifications, wipes MMKV, deletes photo/avatar/backup dirs, resets Redux (including `currencyLocked = false`)
- [ ] `store/thunks/rescheduleAllOccasionsThunk.ts` — on cold start + daily foreground + on settings change — respects 60-day window

#### 2.5 Hooks

- [ ] `hooks/usePeople.ts` — CRUD operations, sorted list selectors, `getPersonWithStats(id)`
- [ ] `hooks/useGifts.ts` — CRUD, `getTimelineForPerson(personId)` (includes shared gifts), recent activity selector, duplicate detector (cross-person)
- [ ] `hooks/useOccasions.ts` — CRUD, `getUpcomingOccasions(limit)`, per-person occasions (includes shared)
- [ ] `hooks/useNotifications.ts` — permission check, test notification trigger, reschedule trigger
- [ ] `hooks/useContacts.ts` — permission request + contact listing + selection + import
- [ ] `hooks/usePhotoAttach.ts` — camera / library / remove flow, returns final saved URI
- [ ] `hooks/useBackup.ts` — backup now (local + cloud if configured), restore, export-to-file, import-from-file, setup SAF folder (Android)
- [ ] `hooks/useAds.ts` — banner ready state, interstitial trigger after saves
- [ ] `hooks/useSettings.ts` — typed getters/setters for each settings field; currency setter throws if locked

### ✅ Acceptance criteria

- Adding a Person with birthday auto-creates a single-person Occasion + schedules a notification (if within 60-day window)
- Adding a shared Occasion (e.g. anniversary with 2 people) creates ONE occasion record, shows up in both people's `byPersonId` indexes, schedules ONE notification with both names in the title
- Adding a shared Gift (e.g. joint gift to 2 people) creates ONE gift record, shows up in both people's timelines, full-counts against both budgets
- Deleting a Person cascades correctly: shared gifts/occasions get this person stripped; sole-person gifts/occasions get deleted; all photo files cleaned
- Deleting a shared gift removes it from both people's timelines
- Photo compression reduces a 5MB photo to ~150KB and saves to `<DocumentDirectory>/photos/<giftId>.jpg`
- MMKV round-trip works for all slices including multi-person indexes
- `shouldShowInterstitial` returns true after 5 save events in 5 min, false after one more within cooldown
- Backup zip export produces valid archive; import validates and restores including multi-person relationships and indexes
- Currency can be changed freely before first gift save; after first save, setter rejects; after Delete All Data, unlocked again
- No TypeScript errors

---

## Phase 3 — UI Components

**Goal:** All reusable components built with **baseline animations included**. Each renders correctly in isolation.

### Tasks

#### 3.1 Base UI components

- [ ] `components/ui/Button.tsx`
  - variants: `primary`, `secondary`, `destructive`
  - height: 52px, full border radius (see UISpec §6.1)
  - spring press scale 1 → 0.95 **(included now, not deferred)**
  - `accessibilityLabel` prop required

- [ ] `components/ui/Input.tsx`
  - props: `label`, `error`, `maxLength`, `showCount`, `multiline`

- [ ] `components/ui/DatePicker.tsx`
  - Wraps platform-native picker (iOS wheel, Android dialog)
  - Handles ISO `yyyy-MM-dd` in/out
  - Optional `minDate` / `maxDate`

- [ ] `components/ui/CurrencyInput.tsx`
  - Currency symbol prefix — reads from `settings.currency` (global)
  - Numeric keyboard
  - Formats on blur (e.g. "12.50")
  - Stores as integer cents
  - Uses `fontVariant: ['tabular-nums']` for aligned digits

- [ ] `components/ui/ScreenHeader.tsx`
  - App wordmark + optional title + optional left/right icon buttons
  - `FadeInDown.springify()` 350ms entering **(baseline, included now)**

- [ ] `components/ui/EmptyState.tsx` — icon + title + subtitle + optional action button
- [ ] `components/ui/ConfirmSheet.tsx` — bottom sheet, title + message + confirm/cancel, supports "type to confirm" mode for Delete All Data
- [ ] `components/ui/Skeleton.tsx` — pulsing placeholder
- [ ] `components/ui/FABMenu.tsx`
  - Main FAB with 3 child actions: Add Gift / Add Person / Add Occasion
  - Basic layout in Phase 3; complex rotation + pulse glow in Phase 7
- [ ] `components/ui/SwipeableRow.tsx`
  - `PanGestureHandler` for horizontal drag
  - Reveals delete background
  - Release past threshold → callback, row animates off
  - Generic — used for People and Gift rows

#### 3.2 People components

- [ ] `components/people/PersonAvatar.tsx`
  - Circular, shows photo if available, otherwise initials (up to 2 chars) on color-hashed background
  - Size prop: `sm | md | lg | xl`

- [ ] `components/people/PersonAvatarStack.tsx` (NEW)
  - Shows 1–3 overlapping avatars with a "+N" badge if more
  - Used for shared Occasions and shared Gifts in list views
  - Respects size prop

- [ ] `components/people/MultiPersonPicker.tsx` (NEW)
  - Searchable modal list of all people
  - Two modes: `single` (radio-style) and `multi` (checkbox)
  - `allowMulti` prop controls whether the user can toggle between modes
  - Selected count shown at top when multi
  - Inline "+ Add new person" row at top of list
  - Respects `initialSelection: string[]` for edit flows
  - Returns `string[]` on confirm

- [ ] `components/people/PersonCard.tsx`
  - Avatar + name + next occasion summary + days-until + mini budget indicator
  - Tap → navigate to `/person/[id]`
  - Wrapped in `SwipeableRow` for delete
  - Press scale 0.97

- [ ] `components/people/OccasionList.tsx`
  - List of occasions for a person (inline on detail screen)
  - Shared occasions show "with [other names]" label
  - Add occasion button at bottom
  - Each row: icon + label + date + days-until, tap to edit

- [ ] `components/people/BudgetRing.tsx`
  - SVG Circle with `strokeDasharray` / `strokeDashoffset`
  - Basic static display in Phase 3 — Reanimated `withTiming` animation + `interpolateColor` deferred to Phase 7
  - Center: spent / total (formatted currency, tabular-nums)
  - Optional: percentage below amount

#### 3.3 Gift components

- [ ] `components/gifts/GiftCard.tsx`
  - Thumbnail left (or icon placeholder), name, occasion label, date, direction badge, price
  - **If gift is shared (personIds.length > 1): shows "+N others" badge next to current person's name** (on person detail view) or stacked avatars (on home recent activity)
  - Swipe-to-delete wrapper
  - Tap → Gift Detail
  - Press scale 0.97

- [ ] `components/gifts/GiftPhotoPicker.tsx`
  - Shows current photo thumbnail if set, with X remove button
  - If unset: three buttons — "Take Photo", "Choose from Library", "No Photo"
  - On selection: calls `usePhotoAttach`, shows new thumbnail

- [ ] `components/gifts/GiftDirectionToggle.tsx`
  - Segmented control: Given | Received
  - Simple indicator (animated slide deferred to Phase 7)

- [ ] `components/gifts/GiftTimeline.tsx`
  - FlatList of `GiftCard` rows
  - Infinite scroll (pagination 20 per batch)
  - Section headers by month/year (optional)
  - Stagger animation deferred to Phase 7

#### 3.4 Occasion components

- [ ] `components/occasions/OccasionCard.tsx`
  - `PersonAvatarStack` + joined names (e.g. "Mom & Dad") + occasion icon/label + date + countdown badge
  - Tap → navigates to a relevant person detail (first person if shared) OR opens occasion edit sheet
  - Used on Home upcoming section

- [ ] `components/occasions/OccasionTypePicker.tsx`
  - Grid of occasion types with icon + label
  - "Custom" option reveals text input for `customLabel`

- [ ] `components/occasions/CountdownBadge.tsx`
  - Days-until number + "days" label (or "today" / "tomorrow")
  - Static color based on proximity threshold in Phase 3 — smooth `interpolateColor` + pulse deferred to Phase 7
  - Uses tabular-nums

#### 3.5 Calendar components

- [ ] `components/calendar/MonthView.tsx`
  - 7-column grid, current month days
  - Navigation arrows + "Today" button
  - Tappable day cells

- [ ] `components/calendar/OccasionDot.tsx`
  - Small colored circle or pill under day number, colored per occasion type

#### 3.6 Ad components

- [ ] `components/ads/BannerAdSlot.tsx`
  - Wraps `BannerAd` from `react-native-google-mobile-ads`
  - Adaptive banner size
  - Respects `useSafeAreaInsets().bottom`
  - Collapses (height 0) if banner fails to load after timeout

- [ ] `components/ads/InterstitialManager.tsx`
  - Mounted once at root (inside `(main)/_layout.tsx`)
  - Preloads an interstitial on mount + after each show
  - Exposes imperative `show()` via context/hook
  - Used by `saveGiftThunk`, `saveOccasionThunk`, etc. after successful save

### ✅ Acceptance criteria

- All components render without errors in a sandbox screen
- Swipe-to-delete works on both iOS and Android — no touch clipping
- `MultiPersonPicker` can be used in both single and multi modes; returns correct arrays
- `PersonAvatarStack` displays 1, 2, 3 avatars and "+N" badge correctly for 4+
- `GiftCard` shows "+N others" for shared gifts
- Baseline animations (press scales, ScreenHeader FadeInDown) work on both platforms
- BannerAdSlot shows test banner; collapses if load fails
- InterstitialManager shows test interstitial on imperative call

---

## Phase 4 — Core Screens

**Goal:** Full app usable end-to-end: add people, gifts, occasions (including shared); view timelines; edit and delete.

### Tasks

#### 4.1 Stack navigation

- [ ] `app/(main)/_layout.tsx`
  - Expo Router Stack
  - `Stack.Screen` configs with transitions:
    - Default: `slide_from_right`, 280ms
    - Modal screens (add-gift, add-person, add-occasion, contacts-import, settings): `slide_from_bottom`, 340ms
    - Back/Home: `fade`, 220ms
  - Mount `InterstitialManager` here

#### 4.2 Home Screen — `app/(main)/index.tsx`

- [ ] ScreenHeader: wordmark + settings icon (top-right)
- [ ] **Upcoming Occasions** horizontal scroll (5 cards) — shared occasions show avatar stack + joined names
- [ ] **Recent Activity** vertical list (up to 10 gifts) — shared gifts show avatar stack
- [ ] Empty state if no people: "Add someone to get started" + two buttons: Add Person / Import Contacts
- [ ] FABMenu (bottom-right):
  - Add Gift → opens `/add-gift` modal
  - Add Person → opens `/add-person` modal
  - Add Occasion → opens `/add-occasion` modal
- [ ] BannerAdSlot at bottom

#### 4.3 People List Screen — `app/(main)/people.tsx`

- [ ] ScreenHeader: "People" title + search icon
- [ ] Search bar (collapsible) filters by name (case-insensitive substring)
- [ ] Sort chips at top: Name / Next Occasion / Recent Activity
- [ ] FlatList of `PersonCard` rows
- [ ] Swipe-to-delete → `ConfirmSheet` "Delete [Name]? Their gifts and occasions will be removed (shared items will be kept for other people)." → cascade delete
- [ ] Empty state: "No people yet." + Add Person / Import Contacts buttons
- [ ] BannerAdSlot at bottom

#### 4.4 Person Detail Screen — `app/(main)/person/[id].tsx`

- [ ] Collapsing header with large avatar, name (2xl Bold), relationship chip
- [ ] Edit icon top-right → opens person edit modal
- [ ] **Budget section:** `BudgetRing` with ytd spend (full-count shared) vs annual budget; tap ring → breakdown
- [ ] **Occasions section:** `OccasionList` — add / edit / delete inline
  - Shared occasions labeled (e.g. "Anniversary — with Dad")
  - Deleting a shared occasion from here prompts: "Remove this occasion for [name] only, or delete it entirely?"
- [ ] **Gift Timeline section:**
  - Tabs: All / Given / Received
  - `GiftTimeline` filtered by selected tab — INCLUDES shared gifts (with "+N others" badge)
  - Pagination for long histories
- [ ] Delete Person button in header menu → confirm → cascade
- [ ] BannerAdSlot at bottom

#### 4.5 Add Gift Screen — `app/(main)/add-gift.tsx` (modal)

- [ ] `GiftDirectionToggle` at top (Given / Received)
- [ ] **`MultiPersonPicker`** — required, 1+ people
  - Defaults to single-select; user can tap multi-select icon to enable multi
  - If opened from Person Detail, that person is pre-selected
  - Inline "+ Add new person" row → opens add-person modal, returns with new person added to selection
- [ ] Gift name text input (required)
- [ ] Date picker (default: today)
- [ ] Occasion picker — uses `OccasionTypePicker`; if any selected person has an occasion within ±14 days of the selected date, pre-select that occasion type
- [ ] Currency input — displays locked global currency symbol (no currency picker per gift)
- [ ] `GiftPhotoPicker`
- [ ] Multiline notes input
- [ ] **Duplicate warning banner** — checks all selected personIds; if any match found, displays: "You gave [Name] '[same gift]' on [Date]. Save anyway?" with overlapping-person names listed
- [ ] Save button (primary) at bottom
  - Validates all fields
  - Dispatches `saveGiftThunk` (handles photo save, locks currency on first save, rate limit event, interstitial check)
  - Pops modal with success toast
- [ ] Cancel button → confirms discard if form dirty
- [ ] **NO BannerAdSlot** on this screen (friction-sensitive form)

#### 4.6 Add Person Screen — `app/(main)/add-person.tsx` (modal)

- [ ] Two tabs at top: "Manual" / "Import Contacts"
- [ ] **Manual tab:**
  - Name (required)
  - Relationship chips (common) + "Other" free-text
  - Avatar photo picker
  - Birthday date picker (optional) — creates single-person birthday occasion
  - ~~Anniversary~~ — REMOVED from Add Person. Anniversaries are shared events created via Add Occasion, picking both partners.
  - Annual budget (optional currency, uses locked global currency)
  - Notes
- [ ] **Import tab:** button navigates to `/contacts-import`
- [ ] Save → dispatches `createPersonThunk` (auto-creates single-person birthday occasion + schedules notification if within 60-day window)

#### 4.7 Add Occasion Screen — `app/(main)/add-occasion.tsx` (modal, NEW)

Unified flow — one entry point for all occasion types, shared or not.

- [ ] **Step 1 — Occasion type:** `OccasionTypePicker` grid
  - If "Custom" selected, show required `customLabel` input
- [ ] **Step 2 — People:** `MultiPersonPicker`
  - Default mode: `single` if type is birthday, else `multi` (but user can deselect)
  - Locked to single-select when type is birthday (enforced by `allowsMulti: false`)
  - Pre-filled if opened from Person Detail
  - Inline "+ Add new person"
  - Prevents selecting a person who already has a birthday (if type is birthday)
- [ ] **Step 3 — Date:** date picker
- [ ] **Step 4 — Recurring toggle:** defaults based on type (true for birthday/anniversary/christmas/etc., false for custom)
- [ ] Save button → dispatches `saveOccasionThunk`:
  - Creates ONE occasion record with `personIds: [...selected]`
  - Adds ID to each selected person's `byPersonId` entry
  - Schedules ONE notification (if within 60-day window) with joined names in title
  - Records add event for rate limit
- [ ] Cancel → confirm discard if dirty
- [ ] NO BannerAdSlot

#### 4.8 Contacts Import Screen — `app/(main)/contacts-import.tsx` (modal)

- [ ] On mount: `Contacts.requestPermissionsAsync()`
  - Denied → show friendly screen with deeplink to OS settings
  - Granted → fetch contacts
- [ ] Search bar
- [ ] FlatList of contacts with checkboxes (name + phone + avatar)
- [ ] "Select All" / "Deselect All" toggle
- [ ] Bottom action: "Import [N] contact(s)"
- [ ] On import:
  - Dispatch `importContactsThunk` — creates Person per selected contact
  - Maps: `name → name`, `imageAvailable → avatarUri`, `birthday → single-person birthday Occasion`
  - Skips contacts already imported (match by `contactId`)
  - Shows progress indicator for large imports
- [ ] Return to previous screen with success toast

#### 4.9 Gift Detail Screen — `app/(main)/gift/[id].tsx`

- [ ] Hero photo (if attached) — tap to open zoom modal with pinch (Phase 7)
- [ ] Gift name (xl Bold)
- [ ] **Direction label + people:**
  - Single-person: "Given to [Person]" / "Received from [Person]" — tappable → person detail
  - Shared: "Given to [A] & [B]" or "Given to [A], [B], and 1 other" — each name tappable
- [ ] Occasion + date
- [ ] Price (formatted in locked global currency)
- [ ] Notes section (if any)
- [ ] Edit button → opens add-gift modal with pre-filled data (people, fields, photo)
- [ ] Delete button → confirm → dispatch `deleteGift` + clean up photo file (removes from ALL linked people's timelines)
- [ ] BannerAdSlot at bottom

#### 4.10 Calendar Screen — `app/(main)/calendar.tsx`

- [ ] `MonthView` with prev/next + Today
- [ ] `OccasionDot` markers under days that have occasions
- [ ] Tap day → bottom sheet listing all occasions that day with joined-name display + quick actions
- [ ] Toggle at top: "Show past occasions"
- [ ] BannerAdSlot at bottom

#### 4.11 Settings Screen — `app/(main)/settings.tsx`

- [ ] **Notifications section**
  - Master toggle: Enable Notifications (requests permission on turn-on)
  - Reminder days before: picker [1, 3, 7, 14]
  - Reminder time of day: time picker
  - Test notification button

- [ ] **Backup & Data section**
  - **Auto local backup:** always on, shows "Last auto-backup: [timestamp]"
  - **Cloud backup destination:**
    - iOS: "iCloud Documents" toggle. Shows status: "iCloud signed in" or "Sign into iCloud in device Settings". No in-app auth.
    - Android: "Backup folder" — if not set, "Set up backup folder" button → SAF folder picker. If set, shows folder path + "Change folder" + "Disable" buttons.
  - Last cloud-backup timestamp display
  - "Backup Now" button → calls `useBackup.backupNow()` (writes local + cloud if configured)
  - "Restore from Backup" → picks zip file → confirm Replace vs Merge
  - "Export Data" → native share sheet with .gftrmb.zip
  - "Import Data" → document picker for .gftrmb.zip

- [ ] **Preferences section**
  - **Currency picker**
    - If `currencyLocked === false`: enabled picker of 20+ options
    - If `currencyLocked === true`: grayed out with explainer: "Currency is locked because you have gifts logged. To change, use Delete All Data below."
  - Language picker (future i18n)
  - Theme: Light / Dark / System

- [ ] **Ads section**
  - Info text: "Ads support the app being free."
  - "Reset ad preferences" button → triggers UMP consent form

- [ ] **Data section (NEW)**
  - "Export My Data" → same as "Export Data" above — produces .gftrmb.zip via share sheet
  - **"Delete All Data"** button (destructive red)
    - First confirm sheet: "This will delete all people, gifts, occasions, and photos on this device. Your cloud backups are not affected. This cannot be undone."
    - Second confirm: text input requiring user to type "DELETE" to enable the confirm button
    - On confirm: dispatches `deleteAllDataThunk` → notifications canceled, MMKV wiped, photo/avatar/backup dirs cleared, Redux reset (currency unlocked), user returned to empty Home

- [ ] **About section**
  - App version + build number
  - Privacy policy link (opens in-app web view)
  - Open source licenses
  - Contact support email link

- [ ] **NO BannerAdSlot** on Settings

### ✅ Acceptance criteria

- Full loop works: Add Person → Add Gift → view in People List → view in Person Detail → edit → delete with cascade
- **Shared occasion loop:** create two people (Mom, Dad) → Add Occasion → anniversary → select both → save → occasion appears on both Mom's and Dad's detail screens → one notification scheduled with "Mom & Dad's Anniversary" title
- **Shared gift loop:** Add Gift → multi-select both parents → save → gift appears on both timelines → deleting it removes from both
- Contacts import with 2+ selected contacts creates correct Persons with birthday Occasions
- Duplicate warning appears when adding same gift name twice to same person within 2 years (single OR via any overlapping person in a shared gift)
- Rate limit: after rapidly adding 5 gifts in < 5 minutes, interstitial shows on the 5th save
- Currency picker: enabled before first gift save, disabled after, unlocked again after Delete All Data
- "Delete All Data" flow requires typing "DELETE", wipes everything, returns to empty Home state
- Android hardware back on modal closes modal (not app)
- Settings persists across app restarts

---

## Phase 5 — Integrations

**Goal:** All platform integrations working end-to-end.

### Tasks

#### 5.1 Notifications integration — 60-day window

- [ ] On Settings toggle ON: request permission, reschedule all occasions within 60-day window
- [ ] On Settings toggle OFF: cancel all scheduled notifications
- [ ] On `reminderDaysBefore` change: reschedule all
- [ ] On `reminderTimeOfDay` change: reschedule all
- [ ] On Occasion add/edit: schedule only if within 60-day window
- [ ] On Occasion delete: cancel this one notification
- [ ] On app cold start AND on `AppState` change to active (throttled to once per 24h):
  - Run `rescheduleAllOccasionsThunk` — handles yearly rollover + newly-in-window occasions
- [ ] Tap notification → deep link to `/person/[id]` (first person for shared occasions, or Home if ambiguous)
- [ ] Handle permission denied gracefully — Settings shows "Notifications are disabled in your OS settings" with deeplink

#### 5.2 AdMob integration

- [ ] On first launch (before any ad): show **Google UMP** consent form (required for EEA/UK)
- [ ] On iOS 14.5+: show **App Tracking Transparency** prompt before AdMob init
- [ ] Initialize AdMob after consent obtained (or not required)
- [ ] `BannerAdSlot`:
  - Adaptive banner sized to device width
  - Preload, display when ready, collapse on failure
  - Hidden on: Add Gift, Add Person, Add Occasion, Contacts Import, Settings
- [ ] `InterstitialManager`:
  - Preload on mount
  - After each save action (Gift / Person / Occasion), check `shouldShowInterstitial`
  - If yes: show it, update `lastInterstitialAt`, preload next
  - Failure to load → skip silently, preload again

#### 5.3 Photo integration

- [ ] `expo-image-picker` requests correct iOS/Android permission strings
- [ ] Camera path: `launchCameraAsync` → compress → save
- [ ] Library path: `launchImageLibraryAsync` → compress → save
- [ ] On delete (gift or person): file deleted from FileSystem
- [ ] On photo replacement: old file deleted before new one saved
- [ ] **For shared gifts:** photo file stored once keyed by gift ID; not duplicated per person
- [ ] Boot reconciliation: sweep for orphan files and missing URIs

### ✅ Acceptance criteria

- Scheduling a notification 7 days before a birthday within the 60-day window fires at the correct date/time
- Scheduling an anniversary more than 60 days away → no notification scheduled yet; next daily sweep (or simulated time jump) picks it up once within window
- AdMob test banner visible on all intended screens, hidden on excluded screens (including Add Occasion)
- Test interstitial shows after 5 rapid saves, not again within 10 min
- UMP consent form appears on first launch in simulated EEA region
- iOS ATT prompt appears before AdMob init
- Photo taken with camera shows up in gift detail, persists across app restart; for shared gifts shown identically in all linked person timelines

---

## Phase 6 — Backup (Hybrid Local + Cloud)

**Goal:** All three tiers working: auto local snapshots, optional iCloud/SAF cloud, and manual export/share.

### Tasks

#### 6.1 Auto local snapshot

- [ ] `utils/backupUtils.ts` → `runAutoBackupIfDue(settings)`
  - On `AppState` active transition, check `lastAutoBackupAt`
  - If > 24h: call `createBackupZip` → write to `<DocumentDirectory>/backups/auto-YYYY-MM-DD.gftrmb.zip`
  - Prune old auto-snapshots: list files matching `auto-*.gftrmb.zip`, keep newest 5
  - Update `settings.lastAutoBackupAt`
  - Failures are silent (log only) — this is a safety net, not a user feature

#### 6.2 iOS — iCloud Documents

- [ ] Configure iCloud container in `app.json` iOS entitlements
- [ ] On manual "Backup Now" with destination = `'icloud'`:
  - Detect iCloud availability (`FileSystem.documentDirectory` under iCloud container, or check `UbiquityContainer`)
  - If not available: show toast "Sign into iCloud in device Settings to enable"
  - If available: write zip to iCloud container path → visible in user's Files app under iCloud Drive → Gift Remembrance
- [ ] No in-app auth — works purely via OS-level iCloud sign-in

#### 6.3 Android — Storage Access Framework (SAF)

- [ ] On Settings "Set up backup folder" → call `safUtils.pickBackupFolder()`:
  - Launches SAF folder picker via `@react-native-documents/picker`
  - User picks any folder (local, Drive-synced, Dropbox-synced, etc.)
  - App calls `takePersistableUriPermission` → permission persists across reboots
  - Stores returned `content://` URI in `settings.safFolderUri`
- [ ] On manual "Backup Now" with destination = `'saf'`:
  - Resolve `safFolderUri` — if permission no longer valid, prompt to re-pick
  - Write zip into that folder with filename `backup-YYYY-MM-DD.gftrmb.zip`
  - No Google Sign-In, no OAuth, no Play Store sensitive-scope verification

#### 6.4 Manual Export / Import (platform-agnostic)

- [ ] Export: `createBackupZip` → share via `Sharing.shareAsync(zipPath)` → native share sheet (email, messages, save to Files, etc.)
- [ ] Import:
  - Use `DocumentPicker.getDocumentAsync({ type: 'application/zip' })` (or `.gftrmb.zip` custom)
  - Call `unzipAndValidate(path)` → parse manifest, validate version (v1 → migrate, v2 → apply, >v2 → reject)
  - Prompt user: Replace vs Merge
  - Dispatch `restoreThunk` with chosen mode

#### 6.5 Backup UI in Settings

- [ ] Show `lastAutoBackupAt` and `lastCloudBackupAt` separately
- [ ] "Backup Now" triggers BOTH local snapshot AND cloud write (if destination configured)
- [ ] "Restore from Backup" button available regardless of destination (restores from any .gftrmb.zip)

### ✅ Acceptance criteria

- Auto-snapshot runs on first foreground after 24h, produces valid zip in `backups/`, prunes 6th+ snapshot
- iCloud backup (simulator or device with iCloud signed in): zip appears in Files → iCloud Drive → app folder
- SAF folder setup works: user picks folder via system picker, path persists, backup writes correctly
- SAF permission revocation (simulated): app detects, re-prompts folder picker
- Export → share sheet → save to Files → re-import the zip → all data restored including:
  - Shared occasions with multi-person indexes intact
  - Shared gifts with photos visible in all linked timelines
  - Notifications rescheduled for occasions within 60-day window
  - `currencyLocked` restored from manifest

---

## Phase 7 — Animations (complex / polish)

**Goal:** Every animation from PRD §3.3 implemented. 60fps confirmed on mid-range Android.

> **Note:** Baseline animations (screen transitions, ScreenHeader entering, press scales) are already in place from Phase 3. This phase layers in the complex orchestrated animations.

### Tasks

- [ ] **PersonCard stagger** — `FadeInDown.delay(index * 40)` on People List
- [ ] **GiftCard timeline stagger** — `FadeInDown.delay(index * 50)` on Person Detail timeline
- [ ] **OccasionCard horizontal stagger** — `FadeInRight.delay(index * 60)` on Home
- [ ] **BudgetRing animation** — `withTiming` stroke-dashoffset + `interpolateColor` (budget.under → on_track → over)
- [ ] **CountdownBadge color interp** — days until → countdown.far → near → soon → imminent
- [ ] **CountdownBadge pulse** — subtle scale pulse when < 7 days remaining
- [ ] **FABMenu complex** — rotation 45° on open + pulse glow ring when closed + spring child items + overlay fade
- [ ] **GiftDirectionToggle slide** — animated indicator slides between Given/Received
- [ ] **Swipe-to-delete** — refine gesture, red reveal, undo toast animation
- [ ] **Photo zoom modal** — `withSpring` scale on open, pinch-to-zoom via Gesture Handler
- [ ] **Settings section stagger** — `FadeInDown.delay(index * 80).springify()`
- [ ] **Duplicate warning banner** — `FadeInDown` on appearance
- [ ] **PersonAvatarStack** — subtle spring entrance when stacked avatars reveal

### Performance check

```bash
# On Android emulator or physical device:
# Open Flipper or React Native DevTools
# Scroll through People List with 50+ people — check JS thread stays < 16ms
# All animations should show "UI thread" in profiler
```

### ✅ Acceptance criteria

- All animations from PRD §3.3 present and working
- No janky transitions on Android emulator (API 30)
- Budget ring color transition is smooth across all three states
- Countdown badge pulse is subtle, not distracting
- Swipe-to-delete has clear affordance and forgiving threshold

---

## Phase 8 — Polish & QA

**Goal:** Production-ready. Accessible, edge cases handled, tested.

### Tasks

#### 8.1 Accessibility

- [ ] Audit: every `Pressable`, `TouchableOpacity`, button → add `accessibilityLabel`
- [ ] All icons → `accessibilityLabel` or `accessibilityRole="image"` + `accessibilityHidden`
- [ ] `BudgetRing` → `accessibilityLabel="Spent $X of $Y annual budget"`
- [ ] `CountdownBadge` → `accessibilityLabel="In 7 days"` or "Today" etc.
- [ ] `PersonCard` → compound label including name + next occasion
- [ ] `PersonAvatarStack` → label indicating all people represented (e.g. "Mom and Dad")
- [ ] `MultiPersonPicker` → clear single vs multi mode indicator for screen readers
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

#### 8.2 Dark mode

- [ ] `useColorScheme()` detection in theme hook
- [ ] All screens use theme-aware tokens (per UISpec §2.2 dark mode palette)
- [ ] Test all screens in dark mode
- [ ] Photo thumbnails don't look washed out

#### 8.3 Font scaling

- [ ] Test app at `Text Size: Larger Accessibility Sizes` (iOS)
- [ ] Ensure no text truncation on gift cards, person cards
- [ ] `maxFontSizeMultiplier={1.3}` on small labels, countdown badges

#### 8.4 Edge cases

- [ ] **Empty people list** — Home shows welcoming empty state + Add Person CTA
- [ ] **Person with zero gifts** — Person Detail shows "No gifts yet" empty state with Add Gift CTA
- [ ] **Notification permission denied** — Settings explains + provides OS settings deeplink
- [ ] **Contacts permission denied** — Import screen shows friendly message, manual entry still works
- [ ] **Photos permission denied** — Photo picker shows error, gift save still works (without photo)
- [ ] **Camera unavailable** (e.g. simulator) — graceful fallback to library
- [ ] **Device storage near full** — photo save fails → error toast "Free up storage and try again"
- [ ] **Backup restore with missing photo files in zip** — skip missing photos (leave `photoUri` null), restore the rest, show summary toast
- [ ] **Backup file from newer app version (v>2)** — reject with "Update app to restore"
- [ ] **Backup file v1** — auto-migrate personId → personIds[] during import
- [ ] **Device time changed** (user jumps forward) — reschedule-all on next foreground catches it
- [ ] **MMKV corruption** — try-catch all reads, fall back to defaults, log error
- [ ] **Leap-day birthday** in non-leap year — fallback to Feb 28 notification
- [ ] **AdMob ad fails to load** — banner slot collapses, interstitial skipped silently
- [ ] **UMP consent declined** — ads still show (non-personalized)
- [ ] **First-launch cold start performance** — under 1.5s on mid-range Android
- [ ] **Shared occasion — last person removed via edit** — occasion deleted, notification canceled
- [ ] **Shared gift — one linked person deleted** — person stripped from personIds, gift stays; if last person, gift + photo deleted
- [ ] **Currency change attempt while locked** — picker grayed out, attempted mutation no-ops
- [ ] **Delete All Data** — verify MMKV fully wiped, photos dir empty, notifications canceled, currency unlocked, Redux at initial state
- [ ] **SAF folder permission revoked by user (uninstall/reinstall cloud app)** — app detects on backup attempt, prompts re-pick

#### 8.5 Platform QA

**iOS**

- [ ] Safe area insets correct on all screen sizes
- [ ] Keyboard avoidance works in all forms (Add Gift, Add Person, Add Occasion)
- [ ] iCloud backup works when signed in, fails gracefully when not
- [ ] AdMob sandbox purchase flow clean
- [ ] ATT prompt shows once, respects user choice
- [ ] Notification permission prompt appears at correct time (on user toggle)

**Android**

- [ ] Hardware back closes modals, doesn't exit app mid-flow
- [ ] Hardware back from main screens: prompt "Exit app?" or standard behavior
- [ ] SAF folder picker works, permission persists across app restart
- [ ] POST_NOTIFICATIONS permission (Android 13+) requested correctly
- [ ] Keyboard avoidance with `behavior="height"`
- [ ] Status bar: normal on all main screens

#### 8.6 Unit tests

```bash
npx jest --init
```

- [ ] `utils/dateUtils.ts` — leap year, year rollover, `nextOccurrence`
- [ ] `utils/budgetUtils.ts` — under / on_track / over thresholds, zero budget, **full-count for shared gifts**
- [ ] `utils/rateLimiter.ts` — window pruning, threshold, cooldown
- [ ] `utils/backupUtils.ts` — zip round-trip, v1 → v2 migration during import
- [ ] `utils/storage.ts` — MMKV mock, save/load round-trips
- [ ] `utils/indexUtils.ts` — multi-person index add/remove/update correctness
- [ ] `store/slices/peopleSlice.ts` — CRUD
- [ ] `store/slices/giftsSlice.ts` — `byPersonId` multi-index maintenance on add/update/delete with shared personIds
- [ ] `store/slices/occasionsSlice.ts` — multi-index, notificationId updates, birthday single-person invariant
- [ ] `store/slices/settingsSlice.ts` — currency lock rejection, SAF URI persistence
- [ ] `store/slices/adsSlice.ts` — add event recording, interstitial gating
- [ ] `store/thunks/deletePersonThunk` — cascade correctness (shared gift preservation)
- [ ] `store/thunks/deleteAllDataThunk` — full wipe + currency unlock

#### 8.7 Privacy policy draft

- [ ] Write privacy policy covering:
  - What data is stored locally (names, gifts, dates, photos)
  - What data leaves the device (only AdMob personalization if consented, optional iCloud/SAF backup if user enables)
  - **No Google Drive OAuth, no Google Sign-In, no Google servers touched** (SAF is a local file operation)
  - No analytics, no user tracking beyond AdMob
  - User's right to export and delete all data
- [ ] Host on GitHub Pages or similar — link in Settings and app store listings

#### 8.8 App Store preparation

- [ ] Screenshots for all required device sizes (iOS: 6.9", 6.5", 12.9" iPad)
- [ ] Screenshots for Android (phone + tablet)
- [ ] App description, keywords
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Privacy labels:
  - iOS: Contact Info (Name — linked to user), Photos (linked to user), Identifiers (AdMob — linked)
  - Android: Data Safety form — **no Drive OAuth means no sensitive-scope verification path needed**
- [ ] AdMob production Ad Unit IDs swapped in
- [ ] Remove `__DEV__` test ad IDs
- [ ] Build signed release bundles

### ✅ Acceptance criteria

- All screens pass VoiceOver / TalkBack navigation
- Every edge case above handled without crash
- All unit tests pass, especially multi-person index and shared-gift budget tests
- No TypeScript errors: `npx tsc --noEmit`
- Privacy policy published and linked
- App submitted to TestFlight / Internal Testing
- Test interstitial frequency feels reasonable, not hostile (dogfood for a week)

---

## Quick Reference

### File creation order (within each phase)

1. Types first — needed by everything else
2. Utils — pure functions, no dependencies
3. Redux slices → thunks — depend on types
4. Hooks — depend on slices
5. Components — depend on hooks + utils
6. Screens — depend on all of the above

### Key rules for Claude Code

- **Never** invent colors, spacing, or visual styles. All visual tokens come from `GiftRemembrance_UISpec.md` §2 and live in `constants/theme.ts`.
- **Never** use real AdMob production IDs during development — always use Google's test IDs unless building for release.
- **Never** store photos in MMKV. Always file system.
- **Never** duplicate a photo file for shared gifts — one file per `gift.id`.
- **Never** mutate `byId` or `byPersonId` indexes without keeping them in sync — use `utils/indexUtils.ts` helpers.
- **Never** include a per-gift `currency` field — currency is global (`settings.currency`, locked on first save).
- **Never** schedule notifications more than 60 days in advance (iOS notification cap).
- **Always** handle permission denials gracefully — never block app usage.
- **Always** reschedule notifications after settings change, app cold start, and daily on foreground (throttled).
- **Always** compress photos before save — never store raw camera output.
- **Always** use `useAppSelector` and `useAppDispatch` typed hooks.
- **Always** add `accessibilityLabel` to every interactive element.
- **Always** debounce MMKV writes to avoid thrash (500ms per slice).
- **Always** update `byPersonId` index for every `personId` in a gift/occasion's `personIds` array.
- Photos go in `<DocumentDirectory>/photos/<gift_id>.jpg` or `<DocumentDirectory>/avatars/<person_id>.jpg` — no exceptions.
- Rate limit: count only saves (not edits, not reads). Respect cooldown. Respect first-session grace period (don't show interstitial in the first 10 minutes of first session).

### Asking Claude Code to implement a specific task

Example prompts:

```
"Implement Phase 2, task 2.2 — utils/dateUtils.ts.
Handle leap year edge case per DataSchema.md §2.3."

"Implement the saveGiftThunk from Phase 2.4. It must:
1. Validate the gift per DataSchema §9.2 — personIds must be length ≥ 1
2. Compress + save photo if attached (one file per gift id, not per person)
3. Dispatch addGift — ensure byPersonId index updated for ALL personIds
4. Set currencyLocked = true if this is the first gift
5. Record ad event via recordAddEvent action
6. Call InterstitialManager.show() if shouldShowInterstitial returns true"

"Implement the MultiPersonPicker component from Phase 3.2.
It takes `mode: 'single' | 'multi'`, `allowModeSwitch: boolean`,
`initialSelection: string[]`, and onConfirm(string[]).
Supports inline + Add Person with refresh on return."

"Implement the Add Occasion screen from Phase 4.7.
One unified flow: occasion type picker → MultiPersonPicker (locked to single
if birthday) → date → recurring toggle → save.
Dispatches saveOccasionThunk with personIds array."

"Implement the deletePersonThunk from Phase 2.4. Cascade rules:
- For each Gift where person is sole linked: delete gift + photo
- For each Gift where person is one of many: remove from personIds
- Same for Occasions (plus cancel notification if Occasion gets deleted)
- Delete avatar file
- Update all indexes atomically"
```
