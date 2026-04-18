# Gift Remembrance

An offline-first gift tracking app for iOS and Android. Remember birthdays, anniversaries, and the gifts you've given and received — all without an account, server, or tracking.

## Features

- People, gifts, and occasions — supports shared gifts and shared occasions
- Annual budget per person with year-over-year tracking
- Local notifications for upcoming occasions
- Contacts import (optional)
- iCloud / SAF cloud backups + manual export as `.gftrmb.zip`
- Dark mode, haptics, biometric lock
- Zero analytics, zero backend, local MMKV storage

## Stack

Expo SDK 54 · React Native · TypeScript · Redux Toolkit · Reanimated v3 · MMKV · date-fns · Jest

## Getting started

```bash
npm install
npx expo prebuild     # first time only
npx expo run:ios      # or run:android
```

## Development

```bash
npm test              # run Jest suite
npx tsc --noEmit      # typecheck
```

## Project structure

- `app/` — Expo Router file-based routes (main tabs + modals)
- `components/` — reusable UI (ui, people, gifts, occasions, calendar, ads)
- `store/` — Redux slices, thunks, typed hooks
- `hooks/` — app-level feature hooks (useBackup, usePeople, ...)
- `utils/` — pure business logic (budgetUtils, dateUtils, backupUtils, ...)
- `types/` — TypeScript domain types
- `constants/` — design tokens (theme, typography, motion, icons, currencies)
- `__tests__/` — Jest unit tests

## Privacy

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md). All data lives on-device unless the user explicitly enables iCloud or SAF backup, which write to the user's own cloud account — never to a developer server.

## License

MIT (or pick your own — update this line).
