# Gift Remembrance — UI/UX Design Specification

**Companion to:** `GiftRemembrance_PRD.md`, `GiftRemembrance_DataSchema.md`, `GiftRemembrance_ImplementationPlan.md`
**For:** Cursor / Claude Code / any agent building the UI
**Version:** 1.0

This document is the single source of truth for all visual and interaction design decisions. It replaces the Stitch design source referenced in the PRD. Everything below is implementation-ready — no more prose, no more "from Stitch" placeholders.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Typography System](#3-typography-system)
4. [Iconography](#4-iconography)
5. [Motion & Animation](#5-motion--animation)
6. [Component Library](#6-component-library)
7. [Screen-by-Screen Specifications](#7-screen-by-screen-specifications)
8. [States Catalog](#8-states-catalog)
9. [Platform Differences](#9-platform-differences)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Sample Content Library](#11-sample-content-library)

---

## 1. Design Principles

The five principles every design decision must satisfy. If a proposed UI breaks any one of these, reject it.

**1. Warm, not clinical.** This app is about people you care about. Copy reads human ("Gift saved", "No people yet", "Start tracking your gifts"), not engineered ("Record created", "Empty state", "Initialize data"). Visuals favor soft corners, gentle gradients, and color over stark neutrals.

**2. Offline-first confidence.** Nothing in the UI implies "syncing", "connecting", or "loading from server" unless the user is explicitly using an optional cloud feature. No network spinners on screens that should be instant. No "Last synced" language anywhere except optional cloud backup rows.

**3. Shared relationships are first-class.** Any UI pattern that shows a single person (avatar, name, timeline entry) must also render gracefully for 2 or 3+ people. Never truncate to "Mom" when the gift was "Mom & Dad".

**4. Respect attention.** Forms never show banner ads. Interstitials only fire after real rate-limit conditions. Destructive actions always have friction. Countdowns and budget indicators are informative, not anxiety-inducing.

**5. One thing per screen.** Each screen has one job. Home is for the next occasion. Person Detail is for one person's context. Add Gift is for logging one gift. Resist the urge to add "while you're here..." features.

---

## 2. Design Tokens

All colors, spacing, radii, and shadows below go into `constants/theme.ts`. Do not hardcode values anywhere else.

### 2.1 Color Palette — Light Mode

```typescript
export const colorsLight = {
  // Primary — a warm violet/indigo, used for primary actions, active states, FAB
  primary: {
    50:  '#F3F1FF',
    100: '#E6E1FF',
    200: '#CEC4FF',
    300: '#B0A0FF',
    400: '#8D74FF',
    500: '#6F52EE',   // base primary
    600: '#5A3FD4',
    700: '#4930AD',
    800: '#392685',
    900: '#2B1D65',
  },

  // Accent — a warm coral/peach, used sparingly for celebration moments (hero countdown, highlights)
  accent: {
    50:  '#FFF4EE',
    100: '#FFE4D4',
    200: '#FFC7A3',
    300: '#FFA573',
    400: '#FF8445',
    500: '#F26A2E',   // base accent
    600: '#D1521D',
    700: '#A63F14',
  },

  // Semantic
  semantic: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    error: '#DC2626',
    errorBg: '#FEE2E2',
    info: '#2563EB',
    infoBg: '#DBEAFE',
  },

  // Surfaces
  bg: {
    screen: '#FAFAF7',       // main background — very slight warm off-white
    card: '#FFFFFF',
    surface: '#F5F5F2',      // elevated rows, chips, input fields
    input: '#F5F5F2',
    modal: '#FFFFFF',
    overlay: 'rgba(15, 14, 23, 0.5)',  // FAB expanded dim, modal backdrop
  },

  // Text
  text: {
    primary: '#1A1725',
    secondary: '#55516A',
    muted: '#8B879D',
    placeholder: '#B4B1C2',
    inverse: '#FFFFFF',
    link: '#6F52EE',
  },

  // Borders
  border: {
    light: '#ECEAE3',
    medium: '#D8D5CC',
    strong: '#B4B1C2',
  },

  // Occasion type color coding — used for calendar dots, occasion icons, tiles
  occasion: {
    birthday:    '#F26A2E',  // coral — celebration
    anniversary: '#E11D9E',  // magenta — romance
    christmas:   '#16A34A',  // green — tradition
    valentines:  '#DC2626',  // red — love
    mothers_day: '#EC4899',  // pink
    fathers_day: '#2563EB',  // blue
    custom:      '#8B879D',  // neutral gray
  },

  // Budget ring states
  budget: {
    under:    '#16A34A',  // spending pacing behind the year
    onTrack:  '#6F52EE',  // primary — on pace
    over:     '#D97706',  // ahead of pace (amber, not red — red reserved for destructive)
  },

  // Countdown proximity (days until occasion)
  countdown: {
    far:      '#8B879D',  // > 14 days — muted gray
    near:     '#6F52EE',  // 7-14 days — primary
    soon:     '#F26A2E',  // 3-7 days — accent
    imminent: '#DC2626',  // < 3 days — semantic error (urgency, not negativity)
  },

  // Direction indicators
  direction: {
    given:        '#6F52EE',   // primary
    givenBg:      '#F3F1FF',
    received:     '#16A34A',
    receivedBg:   '#DCFCE7',
  },
};
```

### 2.2 Color Palette — Dark Mode

```typescript
export const colorsDark = {
  primary: {
    50:  '#1E1A3D',
    100: '#272252',
    200: '#332D6E',
    300: '#4A3F95',
    400: '#6B54C7',
    500: '#8D74FF',   // lifted for dark mode contrast
    600: '#A090FF',
    700: '#B8ADFF',
    800: '#D0C9FF',
    900: '#E6E1FF',
  },

  accent: {
    50:  '#3D1F0F',
    100: '#5C2E14',
    200: '#7A3C1A',
    300: '#A66035',
    400: '#D18458',
    500: '#FF9D6F',
    600: '#FFB890',
    700: '#FFD1B5',
  },

  semantic: {
    success: '#4ADE80',
    successBg: '#14532D',
    warning: '#FBBF24',
    warningBg: '#78350F',
    error: '#F87171',
    errorBg: '#7F1D1D',
    info: '#60A5FA',
    infoBg: '#1E3A8A',
  },

  bg: {
    screen: '#0F0E17',      // near-black with slight violet undertone
    card: '#1A1825',
    surface: '#252234',
    input: '#252234',
    modal: '#1A1825',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: '#F4F3F8',
    secondary: '#B4B1C2',
    muted: '#8B879D',
    placeholder: '#5D5972',
    inverse: '#1A1725',
    link: '#8D74FF',
  },

  border: {
    light: '#2A2738',
    medium: '#3D3A52',
    strong: '#5D5972',
  },

  occasion: {
    birthday:    '#FF9D6F',
    anniversary: '#F472B6',
    christmas:   '#4ADE80',
    valentines:  '#F87171',
    mothers_day: '#F9A8D4',
    fathers_day: '#60A5FA',
    custom:      '#B4B1C2',
  },

  budget: {
    under:    '#4ADE80',
    onTrack:  '#8D74FF',
    over:     '#FBBF24',
  },

  countdown: {
    far:      '#8B879D',
    near:     '#8D74FF',
    soon:     '#FF9D6F',
    imminent: '#F87171',
  },

  direction: {
    given:        '#8D74FF',
    givenBg:      '#272252',
    received:     '#4ADE80',
    receivedBg:   '#14532D',
  },
};
```

### 2.3 Spacing (8pt grid)

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};
```

### 2.4 Border Radius

```typescript
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
};
```

### 2.5 Shadows / Elevation

```typescript
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fab: {
    shadowColor: '#6F52EE',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
};
```

Dark mode shadows are generally less pronounced (opacity 0.3 max) or use subtle lighter borders instead of shadows. Adjust when implementing.

---

## 3. Typography System

### 3.1 Font Families

Two Google Fonts, nothing else:

- **Display / Headings:** `Plus Jakarta Sans` — weights 600 (SemiBold), 700 (Bold)
- **Body / UI:** `Inter` — weights 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

No monospace family. For numeric alignment (prices, budgets, countdowns), use `style={{ fontVariant: ['tabular-nums'] }}` on a regular `Text` component with the Inter family.

Install via:
```bash
npx expo install @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/inter
```

### 3.2 Type Scale

```typescript
export const typography = {
  // Hero countdown number on Home "Next Big Occasion" card
  hero: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  // Screen titles, celebration moments (budget total on Person Detail)
  display: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  // Person name on Person Detail, large section headings
  h1: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  // Modal titles, Gift Detail gift name
  h2: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  // Card titles, list row primary text
  h3: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  // Section labels ("UPCOMING", "KEY DATES")
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // Default body text
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySemi: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
  },
  // Buttons, tabs
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
  // Secondary meta info (dates, relationship chips, card subtitles)
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  captionMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  // Timestamps, tiny labels
  micro: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};
```

### 3.3 Numeric text rule

Every price, budget amount, countdown number, and percentage must use:

```tsx
<Text style={[typography.body, { fontVariant: ['tabular-nums'] }]}>
  $299.00
</Text>
```

Apply this especially on: `BudgetRing` center text, `CountdownBadge`, gift price in `GiftCard` and `GiftDetail`, and any stats line.

### 3.4 Font scaling

Set `maxFontSizeMultiplier={1.3}` on:
- All text inside `CountdownBadge`, `BudgetRing` (fixed-space contexts)
- Navigation bar titles
- Chip text

Let body text, headings, and section labels scale freely — the layout must accommodate up to 1.5× OS accessibility sizing without truncation or clipping.

---

## 4. Iconography

### 4.1 Library

Use `lucide-react-native` exclusively. No emoji-as-icon. No Ionicons. No mixing.

```bash
npx expo install lucide-react-native react-native-svg
```

### 4.2 Standard sizes

- Tab bar icons: 24×24
- Navigation bar buttons (back, settings, edit): 22×22
- Card inline icons: 18×18
- Chip icons: 14×14
- Hero illustration icons (empty states): 48×48
- Countdown / badge icons: 14×14

### 4.3 Icon weight

All icons rendered with `strokeWidth={2}` except FAB plus icon which uses `strokeWidth={2.5}` for presence.

### 4.4 Icon-to-concept mapping

| Concept | Lucide name |
|---|---|
| Birthday | `Cake` |
| Anniversary | `HeartHandshake` |
| Christmas | `Gift` (with occasion color tint) or `TreePine` |
| Valentine's | `Heart` |
| Mother's Day | `Flower2` |
| Father's Day | `Award` (no "tie" icon — Award reads universal) |
| Custom occasion | `CalendarPlus` |
| Gift (generic) | `Gift` |
| Add | `Plus` |
| Close / X | `X` |
| Back | `ChevronLeft` |
| Forward / chevron | `ChevronRight` |
| Settings | `Settings` |
| Home | `Home` |
| People | `Users` |
| Calendar | `Calendar` |
| Search | `Search` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Photo placeholder | `Image` |
| Camera | `Camera` |
| Library (photos) | `Images` |
| Given direction | `ArrowUpRight` |
| Received direction | `ArrowDownLeft` |
| Warning | `AlertTriangle` |
| Info | `Info` |
| Success | `CheckCircle2` |
| Error | `XCircle` |
| Notification | `Bell` |
| Cloud backup | `Cloud` |
| Folder | `Folder` |
| Download / export | `Download` |
| Upload / restore | `Upload` |
| Currency lock | `Lock` |
| Person | `User` |
| Add person | `UserPlus` |
| Shared (multi-person) | `Users` |

---

## 5. Motion & Animation

### 5.1 Library

All animations use `react-native-reanimated` v3. No `Animated` from React Native core.

### 5.2 Duration constants

```typescript
export const duration = {
  instant: 120,    // subtle feedback (chip selection)
  fast: 200,       // button press, small state changes
  medium: 280,     // screen transitions, stagger delays
  slow: 340,       // modals, complex transitions
  celebration: 480, // budget ring, countdown first render
};
```

### 5.3 Screen transitions

Configured in `app/(main)/_layout.tsx`:

| From → To | Animation | Duration |
|---|---|---|
| Home → Person Detail | `slide_from_right` | 280 |
| Home → Gift Detail | `slide_from_right` | 280 |
| Any screen → Add Gift / Add Person / Add Occasion | `slide_from_bottom` | 340 |
| Any screen → Settings | `slide_from_bottom` | 340 |
| Any screen → Contacts Import | `slide_from_bottom` | 340 |
| Modal → Back | Default reverse | 280 |
| Tab switch | `fade` | 220 |

### 5.4 Entering animations (page-level)

- `ScreenHeader`: `FadeInDown.springify().damping(18)` immediate on mount
- Person list rows: `FadeInDown.delay(index * 40).duration(350)` — cap delay at `index * 40` max 400ms
- Gift timeline items: `FadeInDown.delay(index * 50).duration(350)`
- Home upcoming occasions (horizontal scroll): `FadeInRight.delay(index * 60).duration(350)`
- Budget ring: `FadeIn.delay(120).duration(400)`
- Settings sections: `FadeInDown.delay(sectionIndex * 80).springify()`
- Empty state illustrations: `FadeIn.duration(500)` + slight `ZoomIn` on the icon

### 5.5 Interactive press animations

All interactive elements use `useSharedValue` + `withSpring` for press feedback:

| Element | Pressed scale | Spring config |
|---|---|---|
| Primary button | 0.95 | `{ damping: 15, stiffness: 400 }` |
| List row | 0.97 | `{ damping: 15, stiffness: 300 }` |
| Chip | 0.91 | `{ damping: 12, stiffness: 500 }` |
| FAB | 0.92 | `{ damping: 14, stiffness: 350 }` |
| Icon button | 0.88 | `{ damping: 12, stiffness: 500 }` |
| Card | 0.98 | `{ damping: 18, stiffness: 300 }` |

### 5.6 Signature animations

**Budget Ring.** SVG circle with `strokeDasharray={circumference}` and animated `strokeDashoffset`. On mount, animates from `circumference` (empty) to current progress using `withTiming(offset, { duration: 800, easing: Easing.out(Easing.cubic) })`. Color interpolates via `interpolateColor` across three stops as `spent/budget` ratio crosses 0.85 and 1.0.

**Countdown Badge pulse.** When days-until < 7, the badge container scales 1.0 → 1.06 → 1.0 in a 2-second loop using `withRepeat(withSequence(...))`. Stops if user navigates away. Opacity stays constant.

**FAB expand.** Tapping the FAB:
1. Main FAB rotates 0° → 45° (`withSpring damping: 12`) turning plus into X
2. Background overlay opacity 0 → 0.5 over 200ms
3. Three child buttons enter with `FadeInUp.delay(index * 40).springify()`, each with a trailing pill label
4. Pulse glow ring around collapsed FAB (animated `scale 1 → 1.4` + `opacity 0.3 → 0`, infinite loop) disappears on expand
5. Tap outside or tap FAB again → everything reverses

**Swipe to delete.** `PanGestureHandler` tracks horizontal drag:
1. Row translates left with finger, capped at -120px
2. Red destructive background fades in behind (opacity interpolated 0 → 1 over 0 → -60px drag)
3. Trash icon + "Delete" label visible in revealed area
4. Release past -80px threshold: animate to -screenWidth, remove row, show Undo toast
5. Release before threshold: spring back to 0

**Photo zoom.** Tap gift photo in Gift Detail:
1. Modal overlay fades in (opacity 0 → 1 over 200ms)
2. Photo scales from card position to center with `withSpring` (shared element feel — not actual shared element transition, visual approximation)
3. `PinchGestureHandler` for zoom, capped at 4×
4. `PanGestureHandler` tracks drag-to-dismiss: if vertical drag > 100px and released, modal dismisses with fade + scale down

**Duplicate warning banner.** `FadeInDown.springify()` when it appears inline above the Save button in Add Gift. Dismissing uses `FadeOut.duration(200)` + layout shift.

**Toast / Snackbar.** Enters with `SlideInDown.springify()` from below, auto-dismiss after 2.5s with `SlideOutDown.duration(250)`. Tapping dismisses early.

---

## 6. Component Library

Each component is a file in `components/`. Build them in the order listed — later components depend on earlier ones.

### 6.1 Button

`components/ui/Button.tsx`

```typescript
type Variant = 'primary' | 'secondary' | 'destructive' | 'text';
type Size = 'default' | 'small';

interface ButtonProps {
  variant?: Variant;          // default: 'primary'
  size?: Size;                // default: 'default'
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string; // falls back to label
}
```

| Variant | BG (light) | Text | Border |
|---|---|---|---|
| primary | `primary.500` | `text.inverse` | none |
| secondary | `bg.card` | `text.primary` | `border.medium` 1px |
| destructive | `semantic.error` | `text.inverse` | none |
| text | transparent | `primary.500` | none |

Dimensions:
- default size: height 52, horizontal padding 24, `radius.full`
- small: height 36, horizontal padding 16, `radius.full`

States:
- Default: full opacity
- Pressed: scale 0.95 via spring + opacity 0.95
- Disabled: opacity 0.4, not pressable
- Loading: show `ActivityIndicator` centered, label hidden, not pressable

Icon support: icon left or right with 8px gap from label, icon color matches text color.

### 6.2 Input

`components/ui/Input.tsx`

```typescript
interface InputProps {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  multiline?: boolean;
  maxLength?: number;
  showCount?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  leftIcon?: LucideIcon;
  rightElement?: ReactNode;  // for currency symbol, clear button, etc.
  disabled?: boolean;
}
```

Visual:
- Label above input: `typography.captionMedium`, `text.secondary`
- Input: `bg.input`, `radius.lg`, 14px vertical padding, 16px horizontal, `typography.body`
- Focus: `border.strong` 1.5px ring animated in, plus subtle `primary.100` glow (`shadow` with `primary.500` color, opacity 0.15, radius 8)
- Error: border `semantic.error` 1.5px, error text below in `semantic.error` `typography.caption`
- Helper: below input in `text.muted` `typography.caption`
- Counter: right-aligned below input in `text.muted` `typography.micro`, format `{length}/{max}`

Multiline: minimum height 96, max 160 before scroll.

### 6.3 Chip

`components/ui/Chip.tsx`

```typescript
type ChipVariant = 'filter' | 'tag' | 'removable';

interface ChipProps {
  variant?: ChipVariant;
  label: string;
  selected?: boolean;
  icon?: LucideIcon;
  onPress?: () => void;
  onRemove?: () => void;
  color?: string;  // override for occasion-type chips etc.
}
```

- filter: unselected uses `bg.surface` + `text.primary`. Selected uses `primary.500` + `text.inverse`.
- tag: static informational, uses `bg.surface` + `text.secondary`.
- removable: tag + X icon on right.

Dimensions: height 32, horizontal padding 12 (14 with icon), `radius.full`, `typography.captionMedium`.

Press: scale 0.91.

### 6.4 SegmentedControl

`components/ui/SegmentedControl.tsx`

For Given/Received toggle, Gift Timeline tabs (All/Given/Received), Single/Multi picker mode.

```typescript
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (v: T) => void;
  fullWidth?: boolean;
}
```

Visual:
- Container: `bg.surface`, `radius.full`, height 44, padding 4
- Active indicator: `bg.card` (light mode) or `primary.500` (when inside primary context), `radius.full`, `shadow.card`
- Indicator slides with `withSpring(damping: 20, stiffness: 300)` on change
- Inactive labels: `text.secondary`, active: `text.primary`

### 6.5 Toggle (Switch)

`components/ui/Toggle.tsx`

Native `Switch` from React Native, styled to match platform:
- iOS: `trackColor={{ false: '#E5E7EB', true: colors.primary[500] }}` `thumbColor='#FFF'`
- Android: same tokens, Material thumb style

Wrap with label on left, Toggle on right, whole row pressable.

### 6.6 Avatar

`components/people/Avatar.tsx`

```typescript
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
// xs=24, sm=32, md=40, lg=56, xl=96

interface AvatarProps {
  size?: AvatarSize;
  photoUri?: string | null;
  name: string;         // for initials fallback
  backgroundColor?: string;  // override; else color-hash from name
}
```

When `photoUri` is set and file exists: render `<Image>` with circular clip.

When `photoUri` is null: render initials (up to 2 chars, uppercase) on color-hashed background. Hash function:
```typescript
function hashColor(name: string): string {
  const palette = ['#F26A2E','#E11D9E','#16A34A','#DC2626','#EC4899','#2563EB','#6F52EE','#D97706'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
```

Initials text uses `typography.bodySemi` scaled: xs→10px, sm→12px, md→14px, lg→20px, xl→36px, `text.inverse`.

### 6.7 AvatarStack

`components/people/AvatarStack.tsx`

```typescript
interface AvatarStackProps {
  people: Person[];
  size?: AvatarSize;    // default 'md'
  max?: number;         // default 3 — stack shows first N, then "+N" badge
}
```

Layout: overlapping circles, each offset by `size * 0.4` to the right of the previous. Border on each avatar: 2px solid `bg.screen` (light) or `bg.card` depending on context — this creates visual separation between overlapping avatars.

If `people.length > max`:
- Show first `max - 1` avatars
- Final circle is a `bg.surface` filled circle showing `+N` in `typography.micro`, `text.secondary`

### 6.8 PersonCard

`components/people/PersonCard.tsx`

```typescript
interface PersonCardProps {
  person: Person;
  nextOccasion?: Occasion | null;
  daysUntil?: number | null;
  budgetStatus?: BudgetStatus;
  budgetRatio?: number;  // 0-1+
  onPress: () => void;
  onDelete: () => void;
}
```

Layout (wrapped in `SwipeableRow`):
- Container: `bg.card`, `radius.xl`, padding `lg`, `shadow.card`, marginBottom `sm`, height ~80
- Left: `Avatar size="lg"`
- Middle (flex 1, marginLeft `lg`):
  - Row 1: name in `typography.h3`, `text.primary`
  - Row 2: if `nextOccasion`: small occasion icon + "{type} in {daysUntil} days" in `typography.caption` `text.secondary`. Else: "No upcoming occasions" muted.
- Right:
  - Mini budget ring (24×24) if budget set, with percentage below in `typography.micro`
  - Chevron right `18×18` in `text.muted`

Swipe-to-delete revealed background: `semantic.error` with `Trash2` icon + "Delete" label, centered in revealed 100px area.

### 6.9 GiftCard

`components/gifts/GiftCard.tsx`

```typescript
interface GiftCardProps {
  gift: Gift;
  currentPersonId?: string;  // when viewed on a Person Detail, this one is "current"
  peopleById: Record<string, Person>;
  onPress: () => void;
  onDelete?: () => void;      // enables swipe-to-delete if provided
  showPersonName?: boolean;   // true on Home recent activity, false on Person Detail
}
```

Layout:
- Container: `bg.card`, `radius.lg`, padding `md`, `shadow.card` subtle
- Left: 56×56 photo thumbnail with `radius.md`, or placeholder (`bg.surface` with `Gift` icon in `text.muted`)
- Middle (flex 1, marginLeft `md`):
  - Row 1: gift name in `typography.bodySemi`, numberOfLines={1}
  - Row 2: meta — direction badge pill + occasion chip + date, all small, gap `sm`, `typography.caption`
  - Row 3 (conditional): if `showPersonName` or gift is shared:
    - Single person: "{personName}" in `typography.caption` `text.muted`
    - Shared gift: `<AvatarStack size="xs">` + "{joinedNames}" or "+N others" badge
- Right: price in `typography.bodySemi` with `tabular-nums`, `text.primary`. If no price: hidden.

Direction badge:
- Given: `direction.givenBg` background, `direction.given` text, 4px vertical / 8px horizontal padding, `radius.sm`, `typography.micro` "GIVEN" uppercase
- Received: `direction.receivedBg` + `direction.received`, "RECEIVED"

### 6.10 OccasionCard

`components/occasions/OccasionCard.tsx`

Horizontal card for Home upcoming section.

```typescript
interface OccasionCardProps {
  occasion: Occasion;
  people: Person[];       // filtered from personIds
  daysUntil: number;
  onPress: () => void;
}
```

Layout:
- Container: `bg.card`, `radius.xl`, padding `lg`, `shadow.card`, width 200, height 160
- Top row: `AvatarStack size="md" max={3}` (single avatar if one person)
- Middle: joined names in `typography.bodySemi` numberOfLines={2}
- Below names: occasion type label in `typography.caption` `text.secondary`, prefixed with colored dot in `occasion[type]`
- Bottom: `CountdownBadge`

### 6.11 CountdownBadge

`components/occasions/CountdownBadge.tsx`

```typescript
interface CountdownBadgeProps {
  daysUntil: number;
  size?: 'sm' | 'md';
}
```

Color per proximity:
- `> 14`: `countdown.far` background (with 0.15 opacity), `countdown.far` text
- `7-14`: `countdown.near`
- `3-7`: `countdown.soon`
- `< 3`: `countdown.imminent` — and pulse animation activates

Format:
- `daysUntil === 0` → "TODAY"
- `daysUntil === 1` → "TOMORROW"
- `daysUntil < 30` → "IN {N} DAYS"
- `daysUntil < 60` → "IN {N} DAYS" (still specific; we trust users handle up to 60)
- `daysUntil >= 60` → "IN {months} MONTHS" (months = Math.round(daysUntil / 30))

Dimensions:
- sm: height 22, horizontal padding 8, `typography.micro`
- md: height 28, horizontal padding 12, `typography.captionMedium`

Always `radius.full`, `tabular-nums` on the number.

### 6.12 BudgetRing

`components/people/BudgetRing.tsx`

```typescript
interface BudgetRingProps {
  spent: number;           // in minor units (cents)
  budget: number | null;   // in minor units, null = no budget set
  currency: CurrencyCode;
  size?: number;           // default 160
  showCenterText?: boolean; // default true
}
```

SVG circle:
- Outer circle: radius `(size - strokeWidth) / 2`, `strokeWidth: size * 0.06`
- Background track: `border.light`
- Progress track: color per status, animated `strokeDashoffset`
- Color interpolation:
  - `ratio < (yearProgress - 0.15)` → `budget.under`
  - `ratio > (yearProgress + 0.15) || ratio > 1` → `budget.over`
  - Else → `budget.onTrack`
- `ratio = spent / budget`, capped at 1 for visual ring (but center text shows actual overage)

Center text (only if `showCenterText && budget !== null`):
- Large: formatted spent amount, `typography.display`-sized for size=160 (scales with size), `tabular-nums`
- Small line 1: `of ${formattedBudget}` in `typography.caption` `text.secondary`
- Small line 2: status label
  - under: "On track"
  - onTrack: "On pace"
  - over: "Over budget"

If `budget === null`:
- Ring is empty (background track only)
- Center text: "No budget" in `typography.bodyMedium` `text.muted` + small "Set budget" link below

### 6.13 MultiPersonPicker

`components/people/MultiPersonPicker.tsx`

Opens as a bottom sheet modal (85% screen height). Uses `@gorhom/bottom-sheet` or `react-native-modal`.

```typescript
interface MultiPersonPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (personIds: string[]) => void;
  initialSelection?: string[];
  mode?: 'single' | 'multi';    // default 'single'
  allowModeSwitch?: boolean;    // default true
  excludeIds?: string[];        // hide these people
  disabledIds?: string[];       // show but disabled
  disabledHint?: string;        // appears next to disabled rows, e.g. "Already has a birthday"
  title?: string;               // default "Select people"
}
```

Layout:
- Backdrop: `bg.overlay`, tap to dismiss
- Sheet: `bg.modal`, top corners `radius.2xl`, `shadow.modal`, sliding up with `SlideInDown.springify()`
- Header: 56px tall, border-bottom `border.light`:
  - Left: "Cancel" text button
  - Center: title `typography.h3`
  - Right: "Done (N)" text button, disabled when `N === 0`, primary when `N >= 1`
- Below header (only if `allowModeSwitch` and `mode` can be either):
  - Small row: "Selection mode" label left + `SegmentedControl` with Single / Multi options
- Search bar (sticky): `bg.surface`, `radius.full`, 40px tall, `Search` icon left
- List:
  - First row: "+ Add new person" with `UserPlus` icon in `primary.500`, pressable — opens `AddPersonScreen` modal; on save, new person ID added to selection
  - Remaining rows: Avatar + name + relationship chip + right indicator
    - Single mode: radio (empty or filled circle)
    - Multi mode: checkbox (empty or filled with checkmark)
    - Disabled row: opacity 0.4, right side shows disabledHint in `typography.micro`

Selected row: subtle `primary.50` background tint.

Empty state (no people at all): illustration + "No people yet" + "+ Add new person" pressed directly. Hide search bar in this state.

### 6.14 OccasionTypePicker

`components/occasions/OccasionTypePicker.tsx`

Grid of 7 tiles used in Add Occasion. Layout: 2 rows of 4 with one empty cell (or centered 4+3 if you prefer symmetry — pick and commit).

```typescript
interface OccasionTypePickerProps {
  value: OccasionType;
  onChange: (v: OccasionType) => void;
  customLabel?: string;
  onCustomLabelChange?: (v: string) => void;
}
```

Tile:
- Container: `bg.surface` (unselected) or `primary.500` (selected), `radius.lg`, aspect-ratio 1 or height 88
- Icon centered top: color is `occasion[type]` (unselected) or `text.inverse` (selected)
- Label below: `typography.captionMedium`

When `value === 'custom'`, reveal below the grid an `Input` labeled "What are you celebrating?" with placeholder "e.g. Housewarming, Retirement", required.

### 6.15 PhotoPicker

`components/gifts/PhotoPicker.tsx`

Two states:

**Empty state:**
- 160×160 area with `bg.surface`, `radius.lg`, dashed border `border.medium`
- Three buttons below in a row:
  - "Take Photo" (`Camera` icon)
  - "Choose" (`Images` icon)
  - "Skip" (text button, secondary)

**Filled state:**
- 160×160 photo thumbnail with `radius.lg`
- Small X button top-right (in a white circle with shadow, 28×28)
- Single "Replace" text button below

Compression pipeline happens in `usePhotoAttach` hook — PhotoPicker only displays state.

### 6.16 DuplicateWarningBanner

`components/gifts/DuplicateWarningBanner.tsx`

```typescript
interface DuplicateWarningBannerProps {
  matches: Gift[];  // shown in order, first match is the hero
  people: Person[]; // overlapping people
  onSaveAnyway: () => void;
  onDismiss: () => void;
}
```

Layout:
- `semantic.warningBg` background, `radius.lg`, padding `md`, left border 4px `semantic.warning`
- `AlertTriangle` icon top-left in `semantic.warning`
- Title: "You gave {firstPersonName} this before" in `typography.bodySemi`
- Subtext: "{giftName} · {formattedDate}" in `typography.caption` `text.secondary`
- Right side: "Save anyway" text button in `semantic.warning` color, small "X" dismiss below

Animated: `FadeInDown.springify()` on mount.

### 6.17 Toast / Snackbar

`components/ui/Toast.tsx`

```typescript
type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  action?: { label: string; onPress: () => void };
  duration?: number;  // default 2500
}
```

Managed via React Context — `ToastProvider` at root, `useToast()` hook exposes `show(toast)` and `dismiss(id)`.

Layout:
- Positioned 16px above the bottom tab bar (or safe area bottom if no tab bar)
- Pill shape: `bg.card`, `shadow.elevated`, `radius.full`, padding 12 horizontal 16 / vertical 12
- Icon left (per variant):
  - success: `CheckCircle2` in `semantic.success`
  - info: `Info` in `semantic.info`
  - warning: `AlertTriangle` in `semantic.warning`
  - error: `XCircle` in `semantic.error`
- Message in `typography.bodyMedium`
- Action (if any): text button right in variant color

Enters: `SlideInDown.springify()`. Auto-dismiss after `duration` ms. Tap to dismiss early.

### 6.18 EmptyState

`components/ui/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  illustration?: ReactNode;  // or use named illustrations registry
  icon?: LucideIcon;         // fallback if no illustration
  title: string;
  subtitle?: string;
  primaryAction?: { label: string; onPress: () => void; icon?: LucideIcon };
  secondaryAction?: { label: string; onPress: () => void };
}
```

Layout: center-aligned column, vertical padding `4xl`:
- Illustration or icon (48-64px) in `primary.500` with subtle `primary.50` circle background (96×96 `radius.full`)
- Title in `typography.h2`, `text.primary`, marginTop `xl`
- Subtitle in `typography.body`, `text.secondary`, marginTop `sm`, max width 280, center-aligned
- Primary button marginTop `2xl`
- Secondary text button marginTop `md`

### 6.19 Skeleton

`components/ui/Skeleton.tsx`

```typescript
interface SkeletonProps {
  width: number | string;
  height: number;
  radius?: number;  // default `radius.md`
}
```

A single `View` with `bg.surface`. Animated opacity `0.5 → 1 → 0.5` in a 1.2-second loop via Reanimated `withRepeat(withSequence(...))`.

Composed skeletons:

- `SkeletonPersonCard` — row layout matching PersonCard: circle 56×56 + two stacked rectangles (140×14, 100×12) + right circle 32×32
- `SkeletonGiftCard` — matching GiftCard: square 56×56 + two rectangles + right 60×16
- `SkeletonOccasionCard` — 200×160 card with circle + text blocks inside

Render 4-6 skeleton items per list.

### 6.20 ConfirmSheet

`components/ui/ConfirmSheet.tsx`

```typescript
type ConfirmVariant = 'default' | 'destructive' | 'type-to-confirm';

interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  variant?: ConfirmVariant;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;  // default "Cancel"
  onConfirm: () => void;
  confirmText?: string;  // required when variant='type-to-confirm'
  icon?: LucideIcon;
}
```

Bottom sheet modal:
- Icon (if any) centered at top, 48×48, in appropriate variant color background circle
- Title in `typography.h2` center
- Body in `typography.body` `text.secondary` center, max width 320
- If `type-to-confirm`: Input with placeholder `Type {confirmText} to confirm`, confirm button disabled until user input exactly matches `confirmText`
- Buttons stacked:
  - Confirm (variant=destructive → destructive button, else → primary)
  - Cancel (text button)

### 6.21 SwipeableRow

`components/ui/SwipeableRow.tsx`

```typescript
interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;  // default "Delete"
  threshold?: number;    // default 80
}
```

- Uses `PanGestureHandler` from `react-native-gesture-handler`
- Renders children in an Animated.View with `transform: [{ translateX }]`
- Behind children: `semantic.error` background with `Trash2` icon + label centered in revealed area
- Gesture horizontal only, capped at -120px drag
- Release past threshold → animate to `-screenWidth`, call `onDelete`
- Release before threshold → spring back to 0

### 6.22 FABMenu

`components/ui/FABMenu.tsx`

```typescript
interface FABMenuProps {
  actions: Array<{
    label: string;
    icon: LucideIcon;
    onPress: () => void;
  }>;
}
```

Fixed position: bottom-right, 24px margin from screen edge and bottom tab bar.

Collapsed state:
- 56×56 circle, `primary.500`, `Plus` icon 24×24 in `text.inverse`
- `shadow.fab`
- Pulse glow ring: infinite loop, scale 1 → 1.4, opacity 0.3 → 0

Expanded state:
- Main FAB rotates 45°, `Plus` now an X visually
- Semi-transparent overlay behind, tap outside to close
- Child actions stack above, each 48×48 with white pill label to its left
- Children enter with `FadeInUp.delay(index * 40).springify()`

### 6.23 BannerAdSlot

`components/ads/BannerAdSlot.tsx`

Wraps `BannerAd` from `react-native-google-mobile-ads`.

- Adaptive banner size: `useForegroundPermission` + `BannerAdSize.ADAPTIVE_BANNER`
- Container: `bg.screen` with `border.light` top border 1px
- Respects `useSafeAreaInsets().bottom`
- On load failure after 5s timeout: collapses height to 0
- Never visible on form screens (Add Gift, Add Person, Add Occasion, Contacts Import, Settings)

### 6.24 ScreenHeader

`components/ui/ScreenHeader.tsx`

```typescript
interface ScreenHeaderProps {
  title?: string;         // if not wordmark
  showWordmark?: boolean; // default false
  leftIcon?: LucideIcon;
  leftOnPress?: () => void;
  rightIcon?: LucideIcon;
  rightOnPress?: () => void;
  rightLabel?: string;    // text button alternative
  scrollProgress?: SharedValue<number>;  // for collapse on scroll
}
```

Height 56px. Horizontal padding 16. Center-aligned title.

Wordmark: "Gift Remembrance" in `typography.h3` with `Gift` icon 20×20 in `primary.500` to the left.

Enters with `FadeInDown.springify()` on mount.

---

## 7. Screen-by-Screen Specifications

Each screen below is a route in `app/(main)/`. Layout described top-to-bottom.

### 7.1 Onboarding

**Route:** `app/onboarding.tsx` (first-run only, skipped on subsequent launches via `settings.hasSeenOnboarding`)

Carousel of 3 slides, swipeable + dot indicator. Skip button top-right on every slide except last.

**Slide 1:** "Never forget a gift again"
- Illustration: wrapped gift box with sparkles
- Subtext: "Track every thoughtful gesture and meaningful memory in one elegantly curated place."

**Slide 2:** "Track birthdays, anniversaries, even shared ones"
- Illustration: family group with two small avatars overlapping
- Subtext: "Perfect for joint gifts like parents' anniversaries or group celebrations."

**Slide 3:** "Everything stays on your device"
- Illustration: phone with a shield and lock
- Subtext: "Your memories and data are private, offline-first, and never leave your phone."

Bottom: single primary button "Continue" for slides 1 & 2, "Get Started" for slide 3. Dot indicator above button — active dot is pill-shaped and `primary.500`, inactive dots are 6×6 circles `border.medium`.

On "Get Started": set `hasSeenOnboarding = true`, navigate to Home.

### 7.2 Home / Dashboard

**Route:** `app/(main)/index.tsx`

Scroll view top to bottom:

1. `ScreenHeader` — wordmark + Settings icon right
2. **Hero card (Next Big Occasion)**:
   - Container: `bg.card`, `radius.2xl`, padding `2xl`, `shadow.card`, marginHorizontal `lg`
   - If no upcoming occasion: skip hero entirely, show only Upcoming Occasions label with "No upcoming occasions yet" empty inline
   - Top-left: small uppercase label "NEXT MAJOR EVENT" in `typography.sectionLabel` `accent.500`
   - Person avatar(s) via `AvatarStack size="lg"` floating top-right (slightly offset)
   - Big number: days-until in `typography.hero`, `tabular-nums`, `accent.500`
   - Below: "DAYS" in `typography.sectionLabel`
   - Row below: occasion type + joined name(s) (e.g. "Mom & Dad's 35th Anniversary") in `typography.h2` `text.primary`
   - Bottom button: "Plan a Gift" secondary button — opens Add Gift with occasion + people pre-selected
3. **Upcoming Occasions** section (horizontal scroll):
   - Section header: "UPCOMING" label left, "View All" text button right (navigates to Calendar)
   - Horizontal ScrollView with `OccasionCard` × next 5 occasions (excluding the hero one)
   - Gap 12px between cards
4. **Recent Activity** section (vertical):
   - Section header: "RECENT HISTORY"
   - Vertical list of `GiftCard` × last 6 gifts, `showPersonName={true}`
5. `FABMenu` — fixed bottom-right with 3 actions: Add Gift / Add Person / Add Occasion
6. `BannerAdSlot` fixed at bottom
7. Bottom tab bar: Home / People / Calendar / Settings

**Empty state** (no people yet):
- Hide hero, upcoming, recent sections
- Show `EmptyState`:
  - Illustration: gift + sparkle
  - Title: "Start tracking your gifts"
  - Subtitle: "Add someone you care about to never forget a thoughtful gift again."
  - Primary action: "Add Person" with `UserPlus` icon
  - Secondary action: "Import from Contacts"
- FAB hidden
- Banner ad still visible

**Loading state:** Hero becomes `SkeletonOccasionCard` (sized to hero). Upcoming becomes 3× horizontal skeletons. Recent becomes 4× `SkeletonGiftCard`.

### 7.3 People Directory

**Route:** `app/(main)/people.tsx`

1. `ScreenHeader` — "People" title + Search icon right
2. Search bar (reveals when search icon tapped, animates height)
3. Sort chips row: "Name" / "Next Occasion" / "Budget Status" — horizontal scroll if overflow
4. FlatList of `PersonCard` × all people
5. FAB (same 3 actions as Home)
6. `BannerAdSlot`
7. Bottom tab bar

**Empty state:**
- Illustration + "No people yet"
- Subtitle: "Import from your contacts or add someone manually."
- Primary action: "Add Person"
- Secondary action: "Import from Contacts"

**Search no matches:**
- EmptyState variant with `Search` icon
- Title: "No people match '{query}'"
- Subtitle: "Try a different spelling or add a new person."
- Primary action: "Clear search" (resets query)

**Loading state:** 6× `SkeletonPersonCard`.

### 7.4 Person Detail

**Route:** `app/(main)/person/[id].tsx`

1. Header bar: back `ChevronLeft`, no title, edit `Pencil` right + more menu `⋯` right
2. Large avatar (xl 96px) centered
3. Name in `typography.h1`, centered
4. Relationship chip (tag variant, centered) if set
5. **Budget card** (centered below, `bg.card` + `radius.2xl` + padding `2xl`):
   - Small uppercase label "ANNUAL BUDGET" in `typography.sectionLabel` `text.secondary`
   - `BudgetRing size={180}`
   - "Edit budget" text button below ring
6. **Key Dates section**:
   - Section header: "KEY DATES" + small "+ Add" icon button right (opens Add Occasion pre-filled with this person)
   - List of occasions for this person, each row:
     - Circle icon in `occasion[type]` color with type icon
     - Column: type label + optional "with {otherName}" subtext if shared + date
     - Right: `CountdownBadge size="sm"`
7. **Gift History section**:
   - Section header: "GIFT HISTORY"
   - `SegmentedControl` tabs: All / Given / Received
   - `GiftTimeline` FlatList of `GiftCard`, sorted by date desc, `showPersonName={false}` (current person is implicit). Shared gifts display "+N others" badge inline on the card.
8. `BannerAdSlot`
9. More menu (`⋯`): Edit / Delete Person

**Empty gift history** (per tab):
- Small `EmptyState` inline (not full screen):
  - Icon: `Gift`
  - Title: "No gifts {tab==='given' ? 'given to' : tab==='received' ? 'received from' : 'logged with'} {name} yet"
  - Primary action: "Add Gift" inline button

**Delete Person flow:**
- ConfirmSheet with icon `Trash2` in `semantic.error` bg
- Title: "Delete {name}?"
- Body: "Their gifts and occasions will be removed. Shared items will be kept for other people linked to them."
- Confirm: destructive "Delete"
- On confirm: dispatch `deletePersonThunk`, navigate back, show toast "{name} deleted" with Undo action

### 7.5 Add Gift (modal)

**Route:** `app/(main)/add-gift.tsx`

Modal, slides from bottom, full screen.

Header: "Cancel" left, "Add Gift" center, "Save" right (disabled until valid).

Form (ScrollView):
1. `SegmentedControl` Given / Received (fullWidth)
2. **"For" field**: tap to open `MultiPersonPicker` (mode=single, allowModeSwitch=true). Display state:
   - Empty: placeholder "Who is this gift for?"
   - 1 person: Avatar xs + name
   - 2+: `AvatarStack` + joined names + "+ others" affordance that opens picker in multi mode
3. **Gift name** `Input`, required, max 120, `autoCapitalize="sentences"`
4. **Date** field — opens native date picker, default today
5. **Occasion** field — opens small sheet with `OccasionTypePicker`. If any selected person has an occasion within ±14 days of chosen date, pre-select that type.
6. **Price** `Input` with currency symbol prefix (from `settings.currency`), `keyboardType="number-pad"`, formats on blur
7. **Photo** section: `PhotoPicker`
8. **Notes** `Input` multiline, max 500, showCount
9. **Duplicate warning banner** (conditional, appears above Save when matches found) — see `DuplicateWarningBanner` spec
10. `Button variant="primary" fullWidth` labeled "Save Gift" at bottom, 24px margin from bottom

On save: `saveGiftThunk` → compress photo → persist → lock currency → rate-limit event → close modal → show toast "Gift saved".

NO banner ad.

### 7.6 Add Person (modal)

**Route:** `app/(main)/add-person.tsx`

Header: "Cancel" left, "Add Person" center, "Save" right (disabled until name filled).

1. Large avatar picker at top centered (xl size). Tap → action sheet: Take Photo / Choose / Use Initials
2. Tabs: "Manual" / "Import Contacts" (tapping Import Contacts navigates to `/contacts-import`)
3. **Manual tab form**:
   - **Full Name** `Input` required, placeholder "e.g. Sarah Jenkins"
   - **Relationship** — chip row (Family / Friend / Colleague / Partner / Other). Selecting Other reveals Input below for custom label.
   - **Birthday** (optional) date field
   - Info note below birthday in `typography.caption` `text.muted`:
     > "To track an anniversary (even a shared one like your parents'), use Add Occasion after saving this person."
   - **Annual Gift Budget** (optional) Input with currency prefix
   - **Notes** multiline Input, max 500, showCount
4. `Button` "Save Person" primary at bottom

**Intentionally no Anniversary field.** Do not add it even if it seems like a convenience.

On save: `createPersonThunk` → creates Person, auto-creates single-person birthday Occasion if birthday filled → navigate back → toast "{name} added".

NO banner ad.

### 7.7 Add Occasion (modal)

**Route:** `app/(main)/add-occasion.tsx`

Header: "Cancel" left, "Add Occasion" center, "Save" right (disabled until type + ≥1 person + date valid).

Form:
1. **Occasion Type** — `OccasionTypePicker` grid. If Custom selected: customLabel Input appears below.
2. **For** field — opens `MultiPersonPicker`:
   - If type === 'birthday': mode=single, allowModeSwitch=false, disabledIds populated with people who already have a birthday (disabledHint: "Already has a birthday")
   - Else: mode=multi, allowModeSwitch=true
3. **Date** field (native date picker). Helper text: "For recurring occasions, only the month and day matter."
4. **Repeats Yearly** Toggle. Default: true for built-in types, false for custom.
5. `Button` "Save Occasion" primary at bottom

On save: `saveOccasionThunk` → creates Occasion with `personIds[]` → schedules single notification (if within 60-day window) with joined-names title → navigate back → toast "Occasion added".

NO banner ad.

### 7.8 Gift Detail

**Route:** `app/(main)/gift/[id].tsx`

Header: back `ChevronLeft`, "Gift" title, more menu `⋯` right (Edit / Delete).

1. Hero photo (square, full width minus 32px margin) — tap to open photo zoom modal. If no photo: 240×240 area with `bg.surface` + large `Gift` icon in `text.muted` + `radius.2xl`
2. Direction badge pill + occasion chip + date — horizontal row, gap `sm`
3. Gift name in `typography.h1` (left-aligned)
4. **Given to / Received from** card:
   - `bg.card` `radius.xl` padding `lg`
   - Uppercase label "GIVEN TO" or "RECEIVED FROM" in `typography.sectionLabel`
   - Row: `AvatarStack` + joined names in `typography.bodySemi`
   - If 2+ people: names are individually tappable, navigate to each person's detail
5. **Amount** card (if price set):
   - Uppercase label "AMOUNT"
   - Big price in `typography.display`, `tabular-nums`, `text.primary`
6. **Notes** card (if notes exist):
   - Uppercase label "NOTES"
   - Note text in `typography.body` `text.secondary`
7. `BannerAdSlot` at bottom

**Delete flow:** ConfirmSheet destructive variant → "Delete this gift? It will be removed from every linked person's timeline." → toast "Gift deleted" with Undo.

### 7.9 Calendar

**Route:** `app/(main)/calendar.tsx`

1. `ScreenHeader` — wordmark + search icon
2. Month navigation: `< Month YYYY >` with arrow buttons, centered
3. "Today" text button (only visible when not on current month)
4. 7-column weekday header: SUN MON TUE WED THU FRI SAT
5. 6×7 day grid:
   - Cell size: ~44×44, with day number centered
   - Today's cell: filled `primary.500` circle around the number, `text.inverse`
   - Other days with occasions: small colored dots below number (up to 3 dots, each colored by `occasion[type]`; if 4+ show "+N")
6. "Occasions this month" section below calendar:
   - Section header
   - Scrollable list of occasion rows: icon circle + joined names + type/date + `CountdownBadge`
7. Toggle at top: "Show past occasions" (off by default)
8. Day tap opens bottom sheet listing all occasions that day with quick actions ("View Person" / "Add Gift")
9. `BannerAdSlot`
10. Bottom tab bar

**Empty state** (no occasions this month):
- Centered `EmptyState` below calendar grid
- Title: "No occasions in {Month}"
- Subtitle: "Nothing to plan for this month."
- Primary action: "Add Occasion"

### 7.10 Contacts Import (modal)

**Route:** `app/(main)/contacts-import.tsx`

States:

**State A — Permission not requested:**
- Full-screen `EmptyState`:
  - Icon: `Users`
  - Title: "Import from your contacts"
  - Subtitle: "Gift Remembrance needs access to your contacts to help you add people quickly. Your contacts stay on your device."
  - Primary: "Allow Access" → triggers `Contacts.requestPermissionsAsync()`
  - Secondary: "Maybe Later" → closes modal

**State B — Permission granted, contacts loading:** 6× `SkeletonPersonCard`

**State C — Permission granted, list loaded:**
- Header: back arrow + "Import from Contacts"
- Search bar
- Select All toggle row (left) + "{N} selected" count (right)
- FlatList of contact rows: Avatar + name + phone number + checkbox
- Sticky bottom button "Import {N} contacts" (disabled when N=0)

**State D — Permission denied:**
- `EmptyState`:
  - Icon: `UserX` or `AlertCircle`
  - Title: "Contacts access denied"
  - Subtitle: "Enable contacts access in your device Settings to import, or add people manually."
  - Primary: "Open Settings" (deep link)
  - Secondary: "Add Manually" (navigates to Add Person manual tab)

**State E — No contacts on device:**
- `EmptyState`:
  - Icon: `Users`
  - Title: "No contacts found"
  - Subtitle: "Your contacts list appears empty. Add people manually instead."
  - Primary: "Add Manually"

On import: creates one Person per checked contact, auto-creates single-person birthday Occasion if birthday field present, skips duplicates (matched by `contactId`), shows progress toast, navigates back with "{N} people added" toast.

### 7.11 Settings

**Route:** `app/(main)/settings.tsx`

Header: back arrow + "Settings" title.

ScrollView with sections:

**NOTIFICATIONS**
- Toggle row: "Enable Reminders" + subtext "{reminderDaysBefore} days before"
- Stepper row: "Days before" with `-` and `+` buttons, value between 1/3/7/14 (use small segmented control or picker)
- Time row: "Reminder time" → opens native time picker
- "Send test notification" button (secondary variant)

**BACKUP & DATA** (platform-specific)

iOS:
- Info row: "Auto Backup" + subtext "Daily at 2:00 AM" + always-on indicator (not toggleable — always happens)
- Info row: "Last auto-backup" + timestamp
- Row: "iCloud Backup" + status right:
  - If iCloud signed in: green dot + "Enabled" chip
  - If not: amber dot + "Sign into iCloud" link (deep-links to iOS Settings)
- Button: "Backup Now" (primary, inside section) — writes local snapshot + iCloud
- Row: "Restore from Backup" (chevron right) → document picker
- Row: "Export Data" (chevron right) → share sheet with `.gftrmb.zip`

Android:
- Info row: "Auto Backup" + subtext (same as iOS)
- Row: "Backup Folder":
  - If not set: "Set up" CTA right in primary color with chevron
  - If set: folder name on right + chevron → opens menu with "Change folder" / "Disable"
- Button: "Backup Now" (same)
- Row: "Restore from Backup" (same)
- Row: "Export Data" (same)

**PREFERENCES**
- Currency row:
  - Unlocked (before first gift): current code (e.g. "USD") + chevron, tappable → currency picker sheet
  - Locked: muted code + `Lock` icon, no chevron. Tap shows toast: "Currency is locked after your first gift. To change, use Delete All Data."
- Theme row: current setting (Light/Dark/System) + chevron → opens small picker sheet
- Language row: current language + chevron → picker sheet

**ADS**
- Info text: "Ads keep Gift Remembrance free."
- Row: "Reset ad preferences" → resets UMP consent, next ad load re-prompts

**DATA**
- Row: "Export My Data" with `Download` icon → same as Export Data above
- Row: "Delete All Data" in `semantic.error` with `Trash2` icon → opens Delete All Data confirm

**ABOUT**
- Info row: "Version" + "{version} ({buildNumber})"
- Row: "Privacy Policy" (external link icon) → opens in-app web view
- Row: "Open Source Licenses" → opens license list screen
- Row: "Contact Support" → opens mailto

NO banner ad on Settings.

### 7.12 Delete All Data Confirm

Rendered as a `ConfirmSheet` with variant `type-to-confirm`:

- Icon: `AlertTriangle` in `semantic.error` on red background circle (large, 64×64)
- Title: "Delete all data?"
- Body: "This will remove all people, gifts, occasions, and photos from this device. Your cloud backups are not affected. **This cannot be undone.**"
- Input: placeholder "Type DELETE to confirm"
- Confirm button: destructive, labeled "Delete Everything", disabled until input exactly matches "DELETE"
- Cancel button below

On confirm: `deleteAllDataThunk` → wipes MMKV, deletes all photos/avatars/backups dirs, cancels all notifications, resets Redux including `currencyLocked=false` → navigate to Home → toast "All data cleared".

---

## 8. States Catalog

Every screen must handle these states. For each, show:

| Screen | Empty | Loading | Error | Success feedback |
|---|---|---|---|---|
| Home | "Start tracking your gifts" + Add CTAs | Skeleton hero + horizontals + rows | "Couldn't load" + Retry | Toasts for actions |
| People Directory | "No people yet" + Add CTAs | 6 skeleton rows | Inline error row | Toast after delete with Undo |
| Person Detail | Per-tab empty states in Gift History | Skeleton header + ring + rows | "Person not found" + back | Toast on edits |
| Calendar | "No occasions in {Month}" | Grid skeleton | "Couldn't load" + Retry | — |
| Contacts Import | 4 states (not req'd, loading, denied, no contacts) | Skeletons | Permission denied state | Toast "{N} people added" |
| Add Gift | — | Inline save spinner on button | Inline errors below fields | Toast "Gift saved" |
| Add Person | — | Inline save spinner | Inline errors | Toast "{name} added" |
| Add Occasion | — | Inline save spinner | Inline errors | Toast "Occasion added" |
| Settings | — | Skeleton rows for first render | Inline per-action | Toast for each action |

### Error states — reusable patterns

**Screen-level error:**
- Centered `EmptyState`-like layout with `CloudOff` or `AlertCircle` icon (neutral, not alarming)
- Title: "Couldn't load"
- Subtitle: brief explanation
- Primary action: "Retry"

**Backup failed:**
- Inline banner at top of Settings section with `AlertTriangle` in `semantic.warning`
- Title: "Backup couldn't complete"
- Reason (from caught error): "Not enough storage space" / "Couldn't reach iCloud" / etc.
- Actions inline: "Try again" (primary small) / "Dismiss" (text)

**Photo upload failed:**
- Inline below PhotoPicker, `semantic.errorBg` background, `radius.md`, padding `sm`
- "Couldn't save photo. Tap to retry." in `semantic.error`

**Restore validation failed:**
- ConfirmSheet style modal with error variant
- Title: "Couldn't restore"
- Body: "This backup file isn't valid or is from a newer version of Gift Remembrance — please update the app."
- Single Dismiss button

**Notification permission denied inline (Settings):**
- `bg.warningBg` card with `BellOff` icon
- "Notifications are disabled in your device settings."
- "Open Settings" button

---

## 9. Platform Differences

### 9.1 iOS conventions

- `SafeAreaView` with `edges={['top','bottom']}` on all screens
- `KeyboardAvoidingView behavior="padding"` on form screens
- Modals: `presentation="modal"` sliding up from bottom
- Date picker: iOS wheel inline
- Time picker: iOS wheel inline
- Native bottom sheets use iOS style (rounded top corners, overlay, grab handle optional)
- Status bar: `barStyle="dark-content"` on light, `"light-content"` on dark
- Haptics: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on button press, `.Medium` on FAB expand, `notificationAsync(Success)` on save toast

### 9.2 Android conventions

- `KeyboardAvoidingView behavior="height"` on form screens
- `BackHandler.addEventListener('hardwareBackPress')` on every modal to close modal instead of exiting app
- Date picker: Material calendar dialog
- Time picker: Material clock dialog
- Bottom sheets use Material 3 style (slightly less rounded, subtle elevation instead of heavy shadow)
- Status bar: `StatusBar translucent={false} backgroundColor={bg.screen} barStyle` matching theme
- Ripple effect on pressable rows via `android_ripple={{ color: border.light }}`
- Tab bar icons: Material-style filled icons on active, outlined on inactive (Lucide icons used with different strokeWidth or color opacity)

### 9.3 Cross-platform rule

Never branch component internals based on Platform.OS beyond what's specified here. If a design decision seems platform-specific, use the platform-appropriate default from the tables above rather than forking the UI.

---

## 10. Accessibility Requirements

### 10.1 Minimums

- Every `Pressable`, `TouchableOpacity`, or interactive element has `accessibilityLabel`
- Every icon-only button has `accessibilityLabel` describing the action
- Every image has `accessibilityLabel` or `accessibilityRole="image" accessibilityElementsHidden={true}` for decorative images
- Minimum touch target: 44×44pt. Small icons expand hit area via `hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}`
- Contrast: WCAG AA for normal text (4.5:1), AAA for critical text (7:1)

### 10.2 Compound labels

- `PersonCard`: `accessibilityLabel="{name}, {relationship}, next occasion {type} in {days} days, budget {status}"`
- `GiftCard`: `accessibilityLabel="{giftName}, {direction} {people}, {occasion}, {date}, {price}"` for shared: "{giftName}, given to {names joined}"
- `BudgetRing`: `accessibilityLabel="Spent {amount} of {budget}, {status}"`
- `CountdownBadge`: `accessibilityLabel="In {N} days"` or "Today" / "Tomorrow"
- `AvatarStack`: `accessibilityLabel="{names joined with and}"`

### 10.3 VoiceOver / TalkBack testing

Run both screen readers at least once before release. Common fails:
- `OccasionCard` missing semantic grouping → wrap in `accessibilityRole="button"` with compound label
- Modal dismiss: ensure swipe-down gesture has equivalent button (cancel in header)
- Toast auto-dismiss: include `accessibilityLiveRegion="polite"` on Android, `accessibilityRole="alert"` on iOS

### 10.4 Dynamic type

- Max scale 1.5× must not break layouts
- Cap critical fixed-size labels (countdown number, budget ring center) at 1.3× via `maxFontSizeMultiplier={1.3}`
- Test the entire app at iOS "Larger Accessibility Sizes" setting before release

---

## 11. Sample Content Library

Use this sample content in all mocks, seeds, and tests. Never use Lorem Ipsum.

### 11.1 Sample people

```typescript
export const SAMPLE_PEOPLE = [
  { name: 'Mom', relationship: 'Family', hasBirthday: true, annualBudget: 40000 },
  { name: 'Dad', relationship: 'Family', hasBirthday: true, annualBudget: 40000 },
  { name: 'Sarah Jenkins', relationship: 'Partner', hasBirthday: true, annualBudget: 100000 },
  { name: 'David Miller', relationship: 'Friend', hasBirthday: true, annualBudget: 15000 },
  { name: 'Emily Chen', relationship: 'Colleague', hasBirthday: true, annualBudget: 10000 },
  { name: 'Mike Harrison', relationship: 'Friend', hasBirthday: false, annualBudget: null },
  { name: 'Aunt Jane', relationship: 'Family', hasBirthday: true, annualBudget: 20000 },
  { name: 'Uncle Bob', relationship: 'Family', hasBirthday: true, annualBudget: 20000 },
];
```

### 11.2 Sample gifts

```typescript
export const SAMPLE_GIFTS = [
  { name: 'Hand-knitted Scarf', direction: 'given', price: 4500, occasion: 'birthday' },
  { name: 'Espresso Machine', direction: 'given', price: 29900, occasion: 'anniversary' },
  { name: 'Leather Briefcase', direction: 'given', price: 18000, occasion: 'birthday' },
  { name: 'Noise-Cancelling Headphones', direction: 'received', price: 29900, occasion: 'christmas' },
  { name: 'Silk Scarf', direction: 'given', price: 8500, occasion: 'birthday' },
  { name: 'Cookbook: Salt, Fat, Acid, Heat', direction: 'given', price: 3500, occasion: 'just_because' },
  { name: 'Silver Earrings', direction: 'given', price: 12000, occasion: 'birthday' },
  { name: 'Wireless Charging Pad', direction: 'received', price: 4000, occasion: 'christmas' },
  { name: 'Pottery Class Gift Card', direction: 'given', price: 15000, occasion: 'custom', customLabel: 'Retirement' },
];
```

### 11.3 Sample occasions

```typescript
export const SAMPLE_OCCASIONS = [
  { type: 'birthday', people: ['Sarah Jenkins'], date: '1992-05-24' },
  { type: 'anniversary', people: ['Mom', 'Dad'], date: '1988-06-15' },    // shared
  { type: 'christmas', people: ['Mom', 'Dad', 'Sarah Jenkins'], date: '2025-12-25', recurring: true },
  { type: 'birthday', people: ['David Miller'], date: '1989-03-11' },
  { type: 'valentines', people: ['Sarah Jenkins'], date: '2025-02-14' },
  { type: 'mothers_day', people: ['Mom'], date: '2025-05-11' },
];
```

### 11.4 Sample microcopy

Buttons: "Save Gift" / "Save Person" / "Save Occasion" / "Add Gift" / "Add Person" / "Add Occasion" / "Import from Contacts" / "Plan a Gift" / "Backup Now" / "Restore from Backup" / "Delete Everything" / "Try Again" / "Open Settings"

Toasts:
- Success: "Gift saved" / "{name} added" / "Occasion added" / "Backup complete" / "All data cleared" / "{N} people added"
- Info: "Backup in progress"
- Warning: "Couldn't reach iCloud — saved locally"
- Error: "Something went wrong" / "Couldn't save photo"

Empty state copy:
- Home: "Start tracking your gifts" / "Add someone you care about to never forget a thoughtful gift again."
- Person Detail history: "No gifts logged yet" / "Tap + to add the first gift for {name}."
- Calendar: "No occasions in {Month}" / "Nothing to plan for this month."
- Contacts Import (no contacts): "No contacts found" / "Your contacts list appears empty. Add people manually instead."

Confirmation body text:
- Delete Person: "Their gifts and occasions will be removed. Shared items will be kept for other people linked to them."
- Delete Gift: "This gift will be removed from every linked person's timeline."
- Delete All Data: "This will remove all people, gifts, occasions, and photos from this device. Your cloud backups are not affected. This cannot be undone."

Helper text:
- Add Person birthday: "To track an anniversary (even a shared one like your parents'), use Add Occasion after saving this person."
- Add Occasion date: "For recurring occasions, only the month and day matter."
- Currency locked: "Currency is locked after your first gift. To change, use Delete All Data."
- Multi-person picker birthday locked: "Birthdays are for one person."

---

## Implementation order

When handing this to Cursor, build in this order:

1. `constants/theme.ts` with all tokens from §2 and §3
2. Typography styles from §3.2 as reusable text components or `typography.ts` export
3. Basic components §6.1–6.5 (Button, Input, Chip, SegmentedControl, Toggle)
4. Avatar + AvatarStack §6.6–6.7
5. State & data layer per `Implementation Plan` Phase 2
6. List components §6.8–6.11 (PersonCard, GiftCard, OccasionCard, CountdownBadge)
7. BudgetRing §6.12
8. Complex modals §6.13–6.14 (MultiPersonPicker, OccasionTypePicker)
9. Utility components §6.15–6.24 (PhotoPicker, warning banner, toast, etc.)
10. Screens in order: Home → People → Person Detail → Add Gift → Add Person → Add Occasion → Gift Detail → Calendar → Contacts Import → Settings → Delete All Data confirm
11. Platform polish per §9
12. Accessibility pass per §10

Keep this doc open in Cursor as you build — cite the section number when prompting ("Implement §6.13 MultiPersonPicker").

---

**End of UI/UX specification.** This document plus the PRD, Data Schema, and Implementation Plan are the complete handoff. No Stitch, no Figma, no ambiguity.
