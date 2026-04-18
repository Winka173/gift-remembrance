# Gift Remembrance — Data Schema

**Version:** 2 (bumped from v1 for multi-person support)
**Companion to:** `GiftRemembrance_PRD.md` and `GiftRemembrance_ImplementationPlan.md`

This document defines the complete local data model. All data lives in MMKV (primitive values + normalized state) and in the app's document directory (photos). There is no server-side schema — this is the source of truth.

---

## Table of Contents

1. [Storage Layout](#1-storage-layout)
2. [Core Entities](#2-core-entities)
3. [Redux Normalized State Shape](#3-redux-normalized-state-shape)
4. [MMKV Keys](#4-mmkv-keys)
5. [File System Layout](#5-file-system-layout)
6. [Derived / Computed Data](#6-derived--computed-data)
7. [Backup Manifest Format](#7-backup-manifest-format)
8. [Schema Versioning & Migrations](#8-schema-versioning--migrations)
9. [Validation Rules](#9-validation-rules)

---

## 1. Storage Layout

Data is split across two storage systems:

| Storage       | What lives there                                     | Why                                  |
| ------------- | ---------------------------------------------------- | ------------------------------------ |
| **MMKV**      | People, gifts, occasions, settings, ad state         | Fast sync reads; small-to-medium size|
| **FileSystem**| Gift photos, person avatars, exported backup files   | Too large for MMKV; OS-managed files |

MMKV is the primary source of truth. File paths stored in MMKV must point to files that exist in FileSystem — any mismatch is reconciled on app boot.

---

## 2. Core Entities

### 2.1 Person

A person you give gifts to or receive gifts from.

```typescript
interface Person {
  id: string;                   // UUID v4 — immutable once created
  name: string;                 // Required. 1–80 chars, trimmed
  relationship: string | null;  // Free-text tag: 'Spouse', 'Mom', 'Best Friend', etc.
  avatarUri: string | null;     // file:// URI inside <DocumentDirectory>/avatars/
  annualBudget: number | null;  // In smallest currency unit (cents). null = no budget set
  notes: string | null;         // Free-text, 0–500 chars
  contactId: string | null;     // expo-contacts id if this person was imported from contacts
  createdAt: number;            // unix ms
  updatedAt: number;            // unix ms, updated on any field change
}
```

**Uniqueness:** `id` is the primary key. `contactId`, if present, is a secondary unique index — prevents importing the same contact twice.

**Deletion behavior (cascade):**
- Deleting a Person removes their ID from every Gift's `personIds` and every Occasion's `personIds`.
- If removing this person from a Gift or Occasion leaves `personIds` empty, that Gift or Occasion is deleted entirely (and its associated photo and notification cleaned up).
- All files in `avatars/<person.id>.jpg` are deleted.

**Budget policy:** A Gift linked to this person via `personIds` contributes its **full** `price` to this person's YTD spend — regardless of whether the gift is shared with other people. A €100 joint anniversary gift to "Mom & Dad" shows €100 in Mom's budget AND €100 in Dad's budget. This matches how people naturally think ("how much have I spent on Mom this year?") and avoids fractional-cent rounding.

---

### 2.2 Gift

A single gift either given or received. May be linked to one or more people.

```typescript
type GiftDirection = 'given' | 'received';

type OccasionLinkType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'just_because'
  | 'custom';

interface Gift {
  id: string;                              // UUID v4
  personIds: string[];                     // 1+ FKs → Person.id (required, no duplicates)
  name: string;                            // 1–120 chars, trimmed
  direction: GiftDirection;                // 'given' or 'received'
  date: string;                            // ISO 'yyyy-MM-dd' — local date, no time/tz
  occasionType: OccasionLinkType;          // Which kind of occasion it was for
  customOccasionLabel: string | null;      // Required if occasionType === 'custom'; null otherwise
  price: number | null;                    // In smallest unit of settings.currency. null = unknown
  photoUri: string | null;                 // file:// URI inside <DocumentDirectory>/photos/
  notes: string | null;                    // Free-text, 0–500 chars
  createdAt: number;
  updatedAt: number;
}
```

**Note on currency:** There is no per-gift `currency` field. All prices are denominated in the single global `settings.currency`, which is locked once the first gift is logged. See §2.4.

**Invariants:**
- `personIds.length >= 1` — a gift must link to at least one person
- `personIds` contains no duplicates and every ID exists in `people.byId`
- `occasionType === 'custom'` implies `customOccasionLabel !== null` (non-empty string)
- `photoUri`, if set, must point to an existing file at boot (otherwise nulled out during reconciliation)
- Only one Gift record per physical gift regardless of recipients — shared gifts are NOT duplicated

**Shared gift representation in UI:**
- A gift with `personIds: ['mom_id', 'dad_id']` appears in both Mom's and Dad's timelines
- The gift's photo is stored once at `photos/<gift.id>.jpg` — not duplicated per person
- Counts fully in each linked person's budget (see §2.1)

**Duplicate detection** (for warning only, not enforcement):
A gift is considered a potential duplicate of an existing gift if all of:
- `direction === 'given'` (only warns on outgoing gifts)
- Any overlap between `draft.personIds` and `existing.personIds` (at least one shared person)
- `normalizeName(name) === normalizeName(existing.name)` where `normalizeName` lowercases and strips punctuation/whitespace
- The existing gift's `date` is within the last 2 years

Warning surfaces the first match and lists the overlapping person(s).

---

### 2.3 Occasion

A recurring (or one-off) date associated with one or more people that triggers reminders.

```typescript
type OccasionType =
  | 'birthday'
  | 'anniversary'
  | 'christmas'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'custom';

interface Occasion {
  id: string;                     // UUID v4
  personIds: string[];            // 1+ FKs → Person.id (required, no duplicates)
  type: OccasionType;
  customLabel: string | null;     // Required when type === 'custom', else null
  date: string;                   // ISO 'yyyy-MM-dd' — the anchor date (original year stored)
  recurring: boolean;             // If true, recurs annually on same month/day
  notificationId: string | null;  // The expo-notifications scheduled ID, or null if none
  createdAt: number;
  updatedAt: number;
}
```

**Invariants:**
- `personIds.length >= 1`
- `personIds` contains no duplicates and every ID exists in `people.byId`
- `type === 'custom'` implies `customLabel !== null` (non-empty string)
- `recurring === true` by default for built-in types (birthday, anniversary, christmas, etc.)
- **`type === 'birthday'` implies `personIds.length === 1`** — birthdays are inherently individual
- At most one `type: 'birthday'` Occasion per Person (enforced at app logic layer)
- Anniversary, christmas, and other shared occasions may link multiple people (no uniqueness constraint)

**Default occasions on person creation:**
- If user entered a birthday when creating the person → auto-create `type: 'birthday'`, `personIds: [newPerson.id]`, `recurring: true`
- Anniversary is NOT auto-created on person creation — anniversaries are typically shared, so the user creates them explicitly via Add Occasion and picks the people involved.

**Deletion scenarios:**
- User deletes a person entirely → cascading remove from every Occasion's `personIds`. If emptied, the Occasion is deleted and its notification canceled.
- User removes one person from a shared Occasion but keeps the Occasion (via edit) → `personIds` shrinks; if > 0 remaining, occasion survives; if emptied, occasion deleted. Notification is rescheduled with updated title.
- User deletes the Occasion outright → notification canceled, occasion removed from all associated people's `byPersonId` indexes.

**On date change, delete, or app restart:** the associated notification must be canceled and (if applicable) rescheduled. `notificationId` is updated accordingly.

---

### 2.4 Settings

Application-wide preferences. Single object, no collection.

```typescript
type LanguageCode = 'en' | 'es' | 'zh' | 'ja' | 'vi' | 'id' | 'fr' | 'de' | 'pt' | 'ar' | 'hi';
type ReminderDays = 1 | 3 | 7 | 14;
type BackupDestination = 'icloud' | 'saf' | 'none';

interface SettingsState {
  notificationsEnabled: boolean;                       // default: true (subject to OS permission)
  reminderDaysBefore: ReminderDays;                    // default: 7
  reminderTimeOfDay: string;                           // 'HH:mm' (24h), default: '09:00'
  currency: CurrencyCode;                              // default: derived from device locale
  currencyLocked: boolean;                             // default: false — becomes true on first gift save
  language: LanguageCode;                              // default: device locale
  theme: 'light' | 'dark' | 'system';                  // default: 'system'
  backupDestination: BackupDestination;                // default: 'none'
  safFolderUri: string | null;                         // Android only — persisted SAF tree URI. iOS always null.
  lastAutoBackupAt: number | null;                     // unix ms of last auto local snapshot
  lastCloudBackupAt: number | null;                    // unix ms of last cloud backup (iCloud or SAF)
  hasSeenOnboarding: boolean;                          // default: false, set true after first-run
  hasRequestedNotificationPermission: boolean;         // default: false
  hasRequestedContactsPermission: boolean;             // default: false
  hasRequestedTrackingAuth: boolean;                   // default: false (iOS only)
}
```

**Currency lock rationale:** `Gift.price` is stored as an integer in the smallest unit of `settings.currency`. Changing currency mid-stream would silently corrupt all prior amounts (¥1000 ≠ $1000). The lock prevents this footgun. To change currency, the user must Delete All Data (Settings → Data → Delete All Data), which resets `currencyLocked` to false.

**Write behavior:** Every mutation of settings triggers an immediate MMKV write of the full object (debounced 500ms to coalesce rapid changes).

---

### 2.5 Ads State

Runtime state used for AdMob rate limiting and consent tracking.

```typescript
type ConsentStatus = 'unknown' | 'required' | 'obtained' | 'not_required';

interface AdsState {
  bannerReady: boolean;             // transient — not persisted
  interstitialReady: boolean;       // transient — not persisted
  addEvents: number[];              // unix ms timestamps of recent "add" actions. PERSISTED.
  lastInterstitialAt: number;       // unix ms; 0 means never. PERSISTED.
  consentStatus: ConsentStatus;     // PERSISTED.
}
```

**What counts as an "add" event:**
- User saves a new Gift (any direction) — counts once, regardless of how many people it links to
- User saves a new Person
- User saves a new Occasion (counts once, regardless of how many people)

**What does NOT count:**
- Edits to existing records
- Deletions
- Navigation, viewing, etc.

**Retention:** `addEvents` is pruned on every write — entries older than `RATE_LIMIT.WINDOW_MS` (5 minutes) are dropped. Max length ~20.

**Interstitial trigger:** When on save, `addEvents.length >= THRESHOLD (5)` AND `(now - lastInterstitialAt) > COOLDOWN_MS (10 min)` → show interstitial, then update `lastInterstitialAt = now`.

---

## 3. Redux Normalized State Shape

All collections use a **normalized** (byId + allIds) pattern for O(1) lookups and efficient updates.

```typescript
interface RootState {
  people: {
    byId: Record<string, Person>;
    allIds: string[];                     // insertion order
  };

  gifts: {
    byId: Record<string, Gift>;
    allIds: string[];                     // insertion order
    byPersonId: Record<string, string[]>; // personId -> gift IDs, sorted by date DESC
                                          // NOTE: one gift id may appear under MULTIPLE personIds (shared gifts)
  };

  occasions: {
    byId: Record<string, Occasion>;
    allIds: string[];
    byPersonId: Record<string, string[]>; // one occasion id may appear under MULTIPLE personIds
  };

  settings: SettingsState;                // single object, not normalized

  ads: AdsState;                          // single object, not normalized
}
```

**Index maintenance (critical for multi-person):**
When a Gift or Occasion is added with `personIds: [a, b, c]`:
- Insert the record's ID under `byPersonId[a]`, `byPersonId[b]`, AND `byPersonId[c]`

When a Gift or Occasion is removed:
- Remove from `byPersonId[x]` for every `x` in the record's `personIds`

When a Gift's or Occasion's `personIds` is changed (edit):
- Remove from `byPersonId[x]` for every removed person
- Add to `byPersonId[y]` for every newly added person
- Record insertion in correct sorted position in each affected list

A helper function `updateByPersonIdIndex(oldPersonIds, newPersonIds, recordId)` should centralize this logic.

**Sort order convention:**
- `people.allIds`: insertion order (stable, user can sort UI-side)
- `gifts.byPersonId[personId]`: sorted by `date` descending, then `createdAt` descending (most recent first)
- `occasions.byPersonId[personId]`: sorted by next occurrence date ascending (next up first)

---

## 4. MMKV Keys

All keys use a flat namespace. Values are JSON.stringify'd.

| Key              | Value Type            | Size Estimate       | Notes                                          |
| ---------------- | --------------------- | ------------------- | ---------------------------------------------- |
| `people`         | `people` slice (JSON) | ~500 bytes/person   | Normalized state                               |
| `gifts`          | `gifts` slice (JSON)  | ~400 bytes/gift     | Normalized state, NO photo bytes (just paths). Includes multi-index `byPersonId`. |
| `occasions`      | `occasions` slice     | ~200 bytes/occasion | Normalized state, includes multi-index         |
| `settings`       | `SettingsState`       | < 1 KB              | Single object, includes `currencyLocked`, `safFolderUri` |
| `ads_state`      | `AdsState` (partial)  | < 1 KB              | Only persists: addEvents, lastInterstitialAt, consentStatus |
| `schema_version` | `number`              | 4 bytes             | Current schema version (starts at 2 for v1.1) |

**Expected total MMKV size** for a typical user (50 people, 300 gifts, 80 occasions):
- people: 50 × 500B = 25 KB
- gifts: 300 × 400B = 120 KB (plus ~20% overhead for multi-index)
- occasions: 80 × 200B = 16 KB
- settings + ads + version: ~2 KB
- **Total: ~180 KB** — well within MMKV comfort zone (< 10 MB)

---

## 5. File System Layout

```
<DocumentDirectory>/
├── avatars/
│   ├── <person_id>.jpg           # Person avatar
│   └── ...
├── photos/
│   ├── <gift_id>.jpg             # Gift photo (one per gift — shared gifts store once)
│   └── ...
└── backups/                      # Auto-snapshots + manual exports live here
    ├── auto-2026-04-16.gftrmb.zip
    ├── auto-2026-04-17.gftrmb.zip
    └── backup-2026-04-17-0930.gftrmb.zip   # manual
```

### 5.1 Photo Specifications

All photos (avatars + gift photos) are processed identically before save:

| Property      | Value                                |
| ------------- | ------------------------------------ |
| Format        | JPEG                                 |
| Max width     | 1200 px                              |
| Aspect ratio  | Preserved (height scales proportionally) |
| Quality       | 0.7                                  |
| Avg file size | ~150 KB                              |
| Pipeline      | expo-image-picker → expo-image-manipulator → expo-file-system.copyAsync |

### 5.2 File Lifecycle

| Event                   | File action                                       |
| ----------------------- | ------------------------------------------------- |
| Photo added to gift     | Compressed + saved to `photos/<gift_id>.jpg` (one file even for shared gifts) |
| Gift photo replaced     | Old file deleted, new file written to same path   |
| Gift photo removed      | File deleted, `photoUri` set to null              |
| Gift deleted            | File deleted (if exists); all person-index links removed |
| Person removed from shared gift | Person's ID removed from `personIds`; photo untouched |
| Person deleted          | For each gift they were linked to: if sole person → gift deleted + photo deleted; if shared → just remove from personIds. Avatar deleted. |
| Avatar added/replaced   | Same as gift photo logic                          |
| Auto local snapshot     | New zip in `backups/`, prune to keep last 5 auto-snapshots |
| Manual backup exported  | New zip in `backups/` (not pruned), also written to iCloud / SAF folder if destination set |

### 5.3 Boot-Time Reconciliation

On app cold start, after MMKV state is loaded:

1. For each Person with non-null `avatarUri`, check if the file exists. If not → set `avatarUri = null` (silent fix).
2. For each Gift with non-null `photoUri`, check if the file exists. If not → set `photoUri = null`.
3. Orphan check (optional, background): list files in `avatars/` and `photos/`; delete any whose filename doesn't correspond to an existing Person / Gift ID.
4. Reference integrity check: for each Gift and Occasion, filter `personIds` to drop any IDs that no longer exist in `people.byId`. If that leaves `personIds` empty, delete the Gift/Occasion. (This guards against a crash mid-cascade-delete leaving dangling records.)

---

## 6. Derived / Computed Data

These are NOT persisted — they are computed from the canonical state. Keep them as memoized selectors, not slices.

### 6.1 Upcoming Occasions (sorted)

```typescript
function selectUpcomingOccasions(state: RootState, limit: number = 5): OccasionWithCountdown[] {
  const today = new Date();
  return state.occasions.allIds
    .map(id => state.occasions.byId[id])
    .map(o => ({
      ...o,
      next: nextOccurrence(o, today),
      daysUntil: differenceInDays(nextOccurrence(o, today), today),
      // Display helper: "Mom" | "Mom & Dad" | "Mom, Dad, and 1 other"
      displayName: formatOccasionPeople(o.personIds, state.people.byId),
    }))
    .filter(o => o.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}
```

### 6.2 Person With Stats

```typescript
interface PersonWithStats extends Person {
  giftCount: number;              // includes shared gifts (counted once per person link)
  giftsGivenCount: number;
  giftsReceivedCount: number;
  totalGivenYTD: number;          // in smallest currency unit — shared gifts counted FULLY
  nextOccasion: Occasion | null;
  daysUntilNextOccasion: number | null;
}

function selectPersonWithStats(state: RootState, personId: string): PersonWithStats {
  const person = state.people.byId[personId];
  const giftIds = state.gifts.byPersonId[personId] ?? [];
  const gifts = giftIds.map(id => state.gifts.byId[id]);

  const given = gifts.filter(g => g.direction === 'given');
  const thisYear = new Date().getFullYear();
  const totalGivenYTD = given
    .filter(g => parseISO(g.date).getFullYear() === thisYear)
    .reduce((sum, g) => sum + (g.price ?? 0), 0);   // FULL COUNT per person

  // ...
}
```

### 6.3 Budget Status

```typescript
type BudgetStatus = 'under' | 'on_track' | 'over' | 'no_budget';

function computeBudgetStatus(person: Person, ytdSpend: number): BudgetStatus {
  if (person.annualBudget === null) return 'no_budget';
  const ratio = ytdSpend / person.annualBudget;
  const yearProgress = dayOfYear(new Date()) / daysInYear(new Date());
  if (ratio > 1) return 'over';
  if (ratio > yearProgress + 0.15) return 'over';    // pacing ahead of year
  if (ratio < yearProgress - 0.15) return 'under';
  return 'on_track';
}
```

### 6.4 Recent Activity

Most recent N gifts (any person, any direction), sorted by `date` desc then `createdAt` desc. Each gift appears once even if linked to multiple people.

```typescript
function selectRecentActivity(state: RootState, limit: number = 10): Gift[] {
  return state.gifts.allIds
    .map(id => state.gifts.byId[id])
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt - a.createdAt;
    })
    .slice(0, limit);
}
```

### 6.5 Occasion People Display

```typescript
function formatOccasionPeople(personIds: string[], peopleById: Record<string, Person>): string {
  const names = personIds.map(id => peopleById[id]?.name ?? 'Someone');
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]}, and ${names.length - 2} ${names.length === 3 ? 'other' : 'others'}`;
}
```

---

## 7. Backup Manifest Format

Exported as a single `.gftrmb.zip` file containing a JSON manifest and photo files.

### 7.1 Archive Structure

```
backup.gftrmb.zip
├── manifest.json                     ← BackupManifest (see below)
├── photos/
│   ├── <gift_id>.jpg                 ← one per gift that has a photo
│   └── ...
└── avatars/
    ├── <person_id>.jpg               ← one per person that has an avatar
    └── ...
```

**Why zip, not base64-inline JSON:** With ~500 gifts × ~150KB photos each, base64-inline would produce a ~100MB JSON file requiring full parse into memory on restore. Zip with separate photo files means the JSON manifest stays small (~200KB) and parses instantly; photos are decompressed lazily by path.

### 7.2 Manifest Format

```typescript
interface BackupManifest {
  version: 2;                         // schema version of the BACKUP format (bumped from v1 for multi-person)
  createdAt: number;                  // unix ms
  appVersion: string;                 // e.g. '1.1.0'
  deviceOs: 'ios' | 'android';
  data: {
    people: Person[];                 // flat arrays, not normalized
    gifts: Gift[];                    // with personIds: string[]
    occasions: Occasion[];            // with personIds: string[]
    settings: Partial<SettingsState>; // includes currencyLocked so import preserves the lock
  };
  // photos are NOT inline — they live as separate files in photos/ and avatars/ inside the zip
}
```

### 7.3 Export Logic

1. Pull all entities as flat arrays (denormalize from `byId`).
2. Build manifest JSON with current timestamp, app version, platform.
3. Create a temp directory. Write `manifest.json` to it.
4. For each Gift with `photoUri`, copy the file → `<tmp>/photos/<gift.id>.jpg`.
5. For each Person with `avatarUri`, copy the file → `<tmp>/avatars/<person.id>.jpg`.
6. Scrub `photoUri` / `avatarUri` in the manifest entities → null (paths are reconstructed on import based on IDs).
7. Zip the temp directory into `backup-<timestamp>.gftrmb.zip`.
8. Write zip to `<DocumentDirectory>/backups/` and also to destination (iCloud or SAF) if configured.
9. For manual export: open share sheet with the zip path.
10. Delete temp directory.

### 7.4 Import Logic (user-confirmed)

1. Unzip to a temp directory.
2. Read and parse `manifest.json`. Validate `version === 2`. If newer → reject with "Update app to restore." If older (v1) → run import migration (see §8).
3. Prompt user: **Replace** all current data, or **Merge** (keep current + add imported)?
4. **Replace path:**
   - Wipe all MMKV keys, cancel all scheduled notifications, delete all files in `photos/` and `avatars/`.
   - For each photo/avatar in the zip, copy to `<DocumentDirectory>/photos/<id>.jpg` or `avatars/<id>.jpg`.
   - Reinstate entities with correct `photoUri` / `avatarUri` regenerated from their IDs.
   - Rebuild `byPersonId` indexes for gifts and occasions (walk every entity's `personIds`).
   - Restore settings, including `currencyLocked`.
   - Run reschedule-all sweep for notifications.
5. **Merge path:**
   - For each imported Person:
     - Match by `contactId` (non-null) OR identical `name` + `createdAt` → skip import for this person
     - Otherwise import with new UUID if ID collision, else keep original ID
   - For imported Gifts and Occasions: remap any `personIds` entries that pointed to a skipped person → replace with the existing local person's ID. Then import.
   - Copy photos/avatars for imported records only.
   - Rebuild indexes for affected persons. Reschedule notifications for new occasions.
6. Validation errors → roll back partial import, show error toast.
7. Delete temp directory.

### 7.5 Auto Local Snapshot

Every 24 hours of app foreground activity (checked on `AppState` active):
1. Run export logic above with output path `<DocumentDirectory>/backups/auto-<YYYY-MM-DD>.gftrmb.zip`.
2. Do NOT write to iCloud / SAF — this is purely local.
3. After write, list all files in `backups/` matching `auto-*.gftrmb.zip`, sort by date, delete all but the 5 newest.
4. Update `settings.lastAutoBackupAt = Date.now()`.
5. Failures are silent (log, don't toast) — auto-snapshots are a safety net, not a user feature.

---

## 8. Schema Versioning & Migrations

MMKV key `schema_version` tracks the current data format. On boot, if stored version < code version, run migrations in sequence.

```typescript
// utils/migrations.ts
export const CURRENT_SCHEMA_VERSION = 2;

export const MIGRATIONS: Record<number, (mmkv: MMKV) => void> = {
  // 1 → 2: convert single personId to personIds array on gifts and occasions
  2: (mmkv) => {
    // Gifts: { ..., personId: "abc" } → { ..., personIds: ["abc"] }
    const giftsRaw = mmkv.getString('gifts');
    if (giftsRaw) {
      const giftsState = JSON.parse(giftsRaw);
      for (const id of giftsState.allIds) {
        const g = giftsState.byId[id];
        if ('personId' in g && !('personIds' in g)) {
          g.personIds = [g.personId];
          delete g.personId;
        }
        // Drop per-gift currency (now global)
        if ('currency' in g) delete g.currency;
      }
      mmkv.set('gifts', JSON.stringify(giftsState));
    }

    // Occasions: same transform
    const occasionsRaw = mmkv.getString('occasions');
    if (occasionsRaw) {
      const occState = JSON.parse(occasionsRaw);
      for (const id of occState.allIds) {
        const o = occState.byId[id];
        if ('personId' in o && !('personIds' in o)) {
          o.personIds = [o.personId];
          delete o.personId;
        }
      }
      mmkv.set('occasions', JSON.stringify(occState));
    }

    // Settings: add currencyLocked = true (existing users had gifts, currency already implicitly locked)
    const settingsRaw = mmkv.getString('settings');
    if (settingsRaw) {
      const s = JSON.parse(settingsRaw);
      if (!('currencyLocked' in s)) s.currencyLocked = true;
      if (!('safFolderUri' in s)) s.safFolderUri = null;
      if (!('lastAutoBackupAt' in s)) s.lastAutoBackupAt = null;
      if (!('lastCloudBackupAt' in s)) s.lastCloudBackupAt = s.lastBackupAt ?? null;
      // Drop legacy field
      delete s.lastBackupAt;
      // Rename 'google_drive' destination (no longer supported) to 'saf'
      if (s.backupDestination === 'google_drive') s.backupDestination = 'saf';
      mmkv.set('settings', JSON.stringify(s));
    }
  },
};

export function runMigrationsIfNeeded() {
  const current = mmkv.getNumber('schema_version') ?? 0;
  const target = CURRENT_SCHEMA_VERSION;
  for (let v = current + 1; v <= target; v++) {
    MIGRATIONS[v]?.(mmkv);
    mmkv.set('schema_version', v);
  }
}
```

**v1.1 release:** `CURRENT_SCHEMA_VERSION = 2`. Fresh installs get version = 2 immediately. Upgrades from v1.0 (if any beta testers) run migration 2.

**Backup compatibility:** When importing a v1 backup (old single-`personId` format), the import path applies the same field transforms before inserting into state.

---

## 9. Validation Rules

Applied at the reducer / thunk level before any write. Malformed data rejected with a `Toast` error.

### 9.1 Person
- `name`: non-empty after trim, max 80 chars.
- `relationship`: if set, max 40 chars.
- `notes`: if set, max 500 chars.
- `annualBudget`: if set, must be integer ≥ 0, max 99_999_999 (999,999.99 in currency).
- `avatarUri`: if set, must start with `file://`.

### 9.2 Gift
- `personIds`: array with length ≥ 1, no duplicate IDs, every ID must match an existing Person.
- `name`: non-empty after trim, max 120 chars.
- `direction`: exactly `'given'` or `'received'`.
- `date`: match `/^\d{4}-\d{2}-\d{2}$/`, must be a valid calendar date, not more than 1 year in the future.
- `occasionType`: one of the allowed `OccasionLinkType` values.
- `customOccasionLabel`: required and non-empty if `occasionType === 'custom'`, otherwise must be null.
- `price`: if set, must be integer ≥ 0, max 99_999_999. (Currency is implicitly `settings.currency`.)
- `photoUri`: if set, must start with `file://` and lie under `<DocumentDirectory>/photos/`.
- `notes`: if set, max 500 chars.

### 9.3 Occasion
- `personIds`: array with length ≥ 1, no duplicate IDs, every ID must match an existing Person.
- `type`: one of the allowed `OccasionType` values.
- `customLabel`: required and non-empty if `type === 'custom'`, otherwise must be null.
- `date`: match `/^\d{4}-\d{2}-\d{2}$/`, must be a valid calendar date.
- If `type === 'birthday'`: `personIds.length` MUST equal 1.
- At most one Occasion per Person with `type === 'birthday'` (enforce at save time; the new-occasion thunk rejects if one already exists for that person).

### 9.4 Settings
- `reminderDaysBefore`: one of `[1, 3, 7, 14]`.
- `reminderTimeOfDay`: match `/^([01]\d|2[0-3]):[0-5]\d$/` (valid `HH:mm`).
- `currency`: valid `CurrencyCode`. **Cannot be changed if `currencyLocked === true`** — reducer rejects the mutation.
- `currencyLocked`: boolean. Only set to `true` by the gift-save thunk on the first gift save. Only reset to `false` by the Delete All Data flow.
- `language`: valid `LanguageCode`.
- `theme`: one of `['light', 'dark', 'system']`.
- `backupDestination`: one of `['icloud', 'saf', 'none']`. On iOS, `'saf'` is invalid. On Android, `'icloud'` is invalid.
- `safFolderUri`: string starting with `content://` (Android SAF tree URI) or null. Must be null on iOS.

### 9.5 Backup Import
- `version === 2` → direct apply. `version === 1` → run field migration then apply. `version > 2` → reject.
- Every referenced photo in `photos/` inside the zip has matching entity in `data.gifts`.
- Every referenced avatar in `avatars/` inside the zip has matching entity in `data.people`.
- Every entity with `photoUri`/`avatarUri` set has a corresponding file in the zip (after import, paths are regenerated from IDs).
- All entity-level validation rules above apply post-import.
- `data.gifts[].personIds` and `data.occasions[].personIds` — every ID references a Person in `data.people`.

---

**End of data schema.** This document is the contract for how data is structured, stored, validated, and migrated. Any future feature must either conform to or extend this schema with a versioned migration.
