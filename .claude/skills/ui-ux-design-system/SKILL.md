---
name: ui-ux-design-system
description: Mandatory UI and UX rules for the AWS Grilă React Native app — design tokens, light/dark palette, typography, spacing, UI primitives, interaction states, quiz feedback patterns, accessibility and bilingual (RO/EN) copy. Use for ANY change that touches what the user sees or how they interact — new screens, components, styles, colors, text, layout, navigation, feedback or animations — together with the modular-architecture skill.
---

# UI & UX design system — AWS Grilă

These rules are **mandatory**. They describe the design system that already exists in `src/shared/theme` and `src/components/ui`, so every new screen looks and behaves as if the same person built it. If a rule blocks a task, stop and explain why instead of breaking it silently.

This skill covers **what the user sees and feels**. Folder layout, file limits and layering come from the `modular-architecture` skill; follow both.

## 1. Design principles

1. **Calm and readable first.** This is a study app used for long sessions. Neutral backgrounds, one accent color, generous line height, no decoration that competes with the question text.
2. **Content over chrome.** No icons in the tab bar, no illustrations, no gradients or shadows. Hierarchy comes from type size, weight, color tone and spacing.
3. **Color carries meaning, never decoration.** Accent = action / current selection. Success = correct. Danger = wrong. Selected (blue) = "picked, not yet checked". Do not use these colors for anything else.
4. **Never rely on color alone.** Every state shown by color also has text, a weight change, a filled shape or an accessibility state.
5. **Same light and dark.** Every screen is designed for both schemes; the theme follows the phone setting automatically.
6. **Predictable, low-friction flow.** One primary action per area, always on the right; the user never loses their place.

## 2. Design tokens (single source of truth)

All values live in `src/shared/theme/tokens.ts`. Use them through `useThemedStyles(createStyles)` or `useTheme()`; never hard-code hex values, font sizes or spacing.

### 2.1 Colors

| Token | Light | Dark | Use for |
|---|---|---|---|
| `background` | `#F2F5F6` | `#0E1418` | Screen background, inset areas (Tag, FeedbackBox) |
| `surface` | `#FFFFFF` | `#162027` | Cards, buttons, chips, options, tab bar |
| `text` | `#14202B` | `#E4EBEE` | Body and headings |
| `muted` | `#56636E` | `#97A5AE` | Secondary text, labels, help text, inactive tab |
| `border` | `#D6DDE1` | `#2A3740` | 1 px borders, progress track, table lines |
| `accent` | `#0B6E63` | `#43C2AF` | Primary button, active tab, selected chip border, emphasis text |
| `onAccent` | `#FFFFFF` | `#04201B` | Text on an `accent` fill |
| `accentSoft` | `#E0F0ED` | `#12332E` | Selected chip fill, table header |
| `success` / `successSoft` | `#1E6E36` / `#E3F2E8` | `#6CCB8A` / `#123020` | Correct answer: border+letter / fill |
| `danger` / `dangerSoft` | `#A8231B` / `#FBE8E6` | `#F2918A` / `#3A1815` | Wrong answer: border+letter / fill |
| `selected` / `selectedBorder` | `#DCE9F2` / `#3A6F96` | `#1C3242` / `#7FB2D6` | Picked option before it is checked |

Contrast (measured, WCAG): every text/background pair above is **≥ 5.3 : 1** in both schemes (body text ≥ 13 : 1). Any new color must keep **≥ 4.5 : 1** for text and **≥ 3 : 1** for borders and non-text indicators, in both schemes.

**Adding a color:** add it to `ColorTokens`, give it a value in **both** `lightColors` and `darkColors`, check contrast in both, and name it by role (`warning`, `warningSoft`), never by hue (`orange`). Use the `X` + `XSoft` pair pattern for any new semantic state.

### 2.2 Spacing — 4 pt scale

| `xs` | `sm` | `md` | `lg` | `xl` | `xxl` |
|---|---|---|---|---|---|
| 4 | 8 | 12 | 16 | 24 | 32 |

- Screen padding and the gap between top-level sections: `lg`. Bottom padding of a scroll view: `xxl`.
- Inside a Card: padding `lg`, gap between children `md`.
- Label → control → help text: `sm`. Title → subtitle: `xs`.
- Rows of buttons or chips: `sm` gap with `flexWrap: 'wrap'`.
- Use `gap` for spacing between siblings; do not add margins to children.

### 2.3 Radius

`sm` 6 (chips, tags, small badges, progress) · `md` 10 (cards, buttons, options, tables, feedback box) · `pill` 999 (segmented control only).

### 2.4 Typography — always through `AppText`

| Variant | Size | Weight | Line height | Use for |
|---|---|---|---|---|
| `display` | 40 | 700 | 1.1 | Screen title, big score number. Max one per screen area |
| `title` | 19 | 600 | 1.4 | Question text, section headings |
| `body` | 16 | 400 | 1.45 | Default text, option text |
| `small` | 14 | 400 | 1.45 | Chips, segments, explanations, table cells, meta info |
| `caption` | 12 | 400 | 1.4 | Help text, notes, tags |
| `label` | 12 | 600, UPPERCASE, +0.8 tracking | — | Field / group labels ("MOD", "SESIUNI") |

Tones: `default`, `muted`, `accent`, `success`, `danger`. Emphasis is `bold` (600), never a different font or italic. Never use `<Text>` from React Native directly in feature code.

### 2.5 Sizes

- Every pressable is at least `touchTarget` (44 × 44 pt).
- Borders are 1 px; the only exception is the 3 px left bar of `FeedbackBox`.
- Dimensions that are not in the scale (progress height 4/8, option letter 26, table cell 168) are **named constants or style keys inside that component**, never raw numbers scattered in JSX.

## 3. Theme usage pattern

```ts
// Component.styles.ts
export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    base: { minHeight: touchTarget, padding: space.md, borderRadius: radius.md,
            borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  });

// Component.tsx
const styles = useThemedStyles(createStyles);   // memoized per theme
```

- `createStyles` is a **module-level** function (stable reference), so memoization works.
- `useTheme()` only for values that cannot be in a StyleSheet (dynamic color by prop, navigation theme).
- Dynamic per-render values (e.g. progress width) are the only inline styles allowed.
- The navigation theme in `RootTabs` is derived from tokens; when you add a token that navigation needs, wire it there too.

## 4. Primitive inventory (`src/components/ui`)

Use these before writing any new view. Primitives receive translated strings and know nothing about features.

| Primitive | Purpose | Key props | A11y contract |
|---|---|---|---|
| `ScreenContainer` | Scrollable screen body, safe area (top/left/right), `background` color, `lg` padding and gap | `ref` for scroll-to-top | — |
| `ScreenHeader` | Display title + muted subtitle + right-side slot | `title`, `subtitle?`, `accessory?` | title has `header` role, auto-shrinks to one line |
| `Card` | Surface block grouping one task | `children` | — |
| `AppText` | All text | `variant`, `tone`, `bold` | inherits Text props |
| `Button` | Actions | `label`, `onPress`, `variant: 'primary' \| 'secondary'`, `disabled` | `button` role, `disabled` state, opacity 0.45 disabled / 0.8 pressed |
| `Chip` | Toggle in a multi-select group or a filter/picker | `label`, `selected`, `onPress` | `checkbox` role, `checked` state, bold label when selected |
| `SegmentedControl` | Pick exactly one of 2–4 short options | `options`, `value`, `onChange` | `radiogroup` / `radio`, `selected` state; active = inverted (`text` fill, `background` label) |
| `ProgressBar` | Progress 0..1 | `progress`, `tone`, `thick` | `progressbar` role with 0–100 value |
| `Tag` | Read-only metadata (session label) | `label` | not pressable |

### Which control to use

- One choice, 2–4 short labels (RO/EN, Learn/Exam, 10/20/All) → `SegmentedControl`.
- Many on/off choices or a long list of sections → wrapping row of `Chip`s.
- Doing something → `Button`. Exactly one `primary` per action row, placed **last (right)**; secondary/back actions go left.
- Read-only label → `Tag`. Never make a Tag pressable; use a Chip.
- New pattern needed twice → create a primitive (per `modular-architecture` §6), with styles, types, test and export from `components/ui/index.ts`.

## 5. Interaction states

Every interactive element defines all of these, using tokens only:

| State | Visual | Accessibility |
|---|---|---|
| Default | `surface` fill, `border` 1 px | role + label |
| Pressed | opacity 0.8 (Button) | — |
| Selected / checked | `accentSoft` + `accent` border (Chip), inverted (Segment), `selected` + `selectedBorder` (option) and bold label | `checked` / `selected` |
| Disabled | opacity 0.45, not pressable | `disabled: true` |
| Correct | `successSoft` fill, `success` border, filled `success` letter | text "Corect" in feedback |
| Wrong | `dangerSoft` fill, `danger` border, filled `danger` letter | text "Greșit" in feedback |

Derive the visual state in a **pure function** (see `optionState(option, revealed)`), map it to style keys (`styles[state]`, `styles[`${state}Letter`]`) and test the function. Do not chain ternaries in JSX.

## 6. Quiz UX patterns (keep consistent)

- **Question card order:** header (session `Tag` · "3 / 20" position · thin `ProgressBar`) → question `title` → "choose N" hint in `accent` bold (only when more than one answer is required) → options → feedback → navigation.
- **Options:** full-width rows with a lettered badge (A, B, C…) and text that wraps; whole row is the touch target. After reveal, options become disabled.
- **Learn mode:** feedback right after "Verifică": correct option(s) green, wrongly picked option red, unpicked wrong options stay neutral, then `FeedbackBox` with verdict + explanation.
- **Exam mode:** no feedback until the end; results show score, per-session breakdown and the mistake review list.
- **Feedback:** `FeedbackBox` uses `accessibilityLiveRegion="polite"` so screen readers announce the verdict. Any new asynchronous result must be announced the same way.
- **Navigation row:** Back (secondary, left) · primary action (right) whose label follows the step: Verifică → Următoarea → Termină. Disable, never hide, an action that is not available yet, so the layout does not jump.
- **Scroll position:** when the question, set or status changes, scroll to top without animation (`useScrollToTop`; Summary does the same on section change).
- **Results:** label (`label` variant, muted) → big `display` percentage + muted "correct / total" → bold verdict sentence.
- **Setup panel:** each group is a `SetupRow` (label → control → caption help). Actions: "Reia greșelile (n)" secondary, disabled at 0; "Set nou" primary, disabled when no session is selected.
- **Persisted choices:** language, mode, sessions, count and mistakes survive restarts; never reset user choices silently.
- **Tables:** wide comparison tables scroll horizontally inside a bordered frame with an `accentSoft` header; never shrink text to fit.

## 7. Layout rules

- Single column, top-to-bottom, inside `ScreenContainer`. Screen = `ScreenHeader` + Cards / sections.
- Text always wraps (`flex: 1` / `flexShrink: 1` in rows); never truncate question, option or explanation text. Only the screen title may auto-shrink.
- Support Dynamic Type / font scaling: no fixed heights on text containers, use `minHeight`.
- Rows of controls wrap (`flexWrap: 'wrap'`) so they fit small phones and Romanian strings that are longer than English.
- Bottom tabs: text labels only (icons hidden), `body` 600, active `accent`, inactive `muted`. Adding a tab requires a strings entry for both languages.

## 8. Copy and i18n

- Every visible string comes from `src/shared/i18n/strings.ts`, with **both `ro` and `en`** filled in. Counts and plurals are functions (`retryMistakes: n => ...`).
- Romanian uses correct diacritics with comma-below: **ș ț** (not ş ţ), plus ă â î.
- Tone: short, direct, second person, no exclamation marks except for success verdicts. Button labels are verbs or short noun actions ("Verifică", "Set nou").
- Content that exists only in Romanian (Summary) shows a muted caption note saying so, instead of a half-translated screen.
- Primitives never import i18n; containers pass translated text in.

## 9. Accessibility checklist (part of every component)

- Correct `accessibilityRole` (`button`, `checkbox`, `radio`, `radiogroup`, `tablist`, `progressbar`, `header`).
- `accessibilityState` mirrors the visual state (`selected`, `checked`, `disabled`).
- `accessibilityLabel` when the visible label is not enough (icon-only, abbreviations like "S1" → "Sesiunea 1").
- ≥ 44 pt targets, ≥ 4.5 : 1 text contrast in both themes, state never shown by color alone.
- Results and feedback that appear after an action use a live region.
- Tests query by role and name (`getByRole('button', { name })`), which also proves the a11y contract.

## 10. Motion

- Default is **no animation**: instant state changes, `animated: false` scroll. The app should feel immediate.
- If motion is added, it must be ≤ 200 ms, run on the UI thread (Reanimated), communicate a state change (not decorate), and respect the system "reduce motion" setting (`AccessibilityInfo.isReduceMotionEnabled`).

## 11. Known gaps (fix when you touch these files)

- `SectionPicker` uses `tablist` but its children are `Chip`s with the `checkbox` role; a picker with a single selection should expose `tab` + `selected` (add a role variant to Chip or a `TabChip` primitive).
- `SectionPicker` and `SegmentedControl` create inline `onPress` arrows, which defeats `memo` on `Chip`; pass a stable callback that receives the id.
- `Tag` uses `paddingVertical: 2` outside the spacing scale; keep it as a named style or add a `xxs: 2` token if it is reused.

## 12. Definition of done (UI/UX)

- [ ] Only tokens: no hex colors, raw font sizes or spacing numbers outside `tokens.ts` (named local constants for component-specific dimensions are fine)
- [ ] Checked in **light and dark** mode, with large font scaling, on a small screen
- [ ] Existing primitives reused; any new primitive is in `components/ui`, exported and tested
- [ ] All states defined (default, pressed, selected, disabled, success/danger where relevant)
- [ ] Roles, states, labels, 44 pt targets and contrast verified
- [ ] All strings in i18n for **RO and EN**, correct diacritics
- [ ] Exactly one primary action per action row, on the right; unavailable actions disabled, not hidden
- [ ] Layout does not jump between states; text wraps instead of truncating

In your summary, list the primitives you reused, any new token or primitive you added (with light and dark values), and any known gap you fixed or left.

## 13. Anti-patterns to reject

- Hard-coded colors (`'#fff'`, `'red'`), `fontSize: 15`, `margin: 10`
- A color defined only for light mode, or a dark mode "inverted" by hand in a component
- Using `success`/`danger` green/red for anything other than correct/wrong
- Raw `<Text>`, `<TouchableOpacity>` or one-off buttons instead of `AppText` / `Button` / `Chip`
- Two primary buttons side by side, or the primary action on the left
- Hiding a button instead of disabling it, causing layout shift
- Icons, shadows, gradients or decorative imagery added "to make it nicer" without a design decision
- Strings in JSX, English-only strings, or Romanian without diacritics
- Truncated question or option text, fixed-height text containers
- Animations for decoration, or animations that ignore reduce-motion
