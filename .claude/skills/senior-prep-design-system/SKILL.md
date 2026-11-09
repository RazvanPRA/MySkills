---
name: senior-prep-design-system
description: Mandatory UI/UX rules for the Senior Prep React Native app (daily logic and knowledge tests): tokens, light/dark palette, typography, primitives, exercise patterns, accessibility, RO/EN copy. Use for any visible UI change.
---

# UI & UX design system — Senior Prep

These rules are **mandatory**. They define the design system of the Senior Prep app: a study app with two daily tests (logic and knowledge), a study map and a progress view. Every screen must look and behave as if the same person built it. If a rule blocks a task, stop and explain why instead of breaking it silently.

This skill covers **what the user sees and feels**. Folder layout, file limits and layering come from the `modular-architecture` skill; follow both. The product itself is described in the project brief (`CLAUDE.md`).

The repository starts empty. The tokens live in `src/shared/theme` and the primitives in `src/shared/ui`; build them in Phase 0 exactly as specified here, and build each primitive marked *planned* the first time a screen needs it.

## 1. Design principles

1. **Calm and readable first.** Users study here every day, sometimes for long sessions. Neutral backgrounds, one accent color, generous line height, nothing that competes with the question or the code.
2. **Content over chrome.** No icons in the tab bar, no illustrations, no gradients, no shadows, no gamification art (flames, trophies, confetti). Hierarchy comes from type size, weight, tone and spacing.
3. **Color carries meaning, never decoration.** Accent = action / current selection. Success = correct. Danger = wrong. Selected (blue) = "picked, not yet checked". Categories, topics and levels have **no colors of their own**. Syntax colors exist only inside `CodeBlock`; mastery colors exist only inside `MasteryCell`.
4. **Never rely on color alone.** Every state shown by color also has text, a weight change, a filled shape or an accessibility state.
5. **Same light and dark.** Every screen is designed for both schemes; the theme follows the phone setting automatically.
6. **Predictable, low-friction flow.** One primary action per area, always on the right; the user never loses their place, and an unfinished daily test resumes exactly where it stopped.
7. **Code is first-class content.** Code is shown in a monospace `CodeBlock`, never wrapped, never shrunk, always readable in both themes.

## 2. Design tokens (single source of truth)

All values live in `src/shared/theme/tokens.ts`. Use them through `useThemedStyles(createStyles)` or `useTheme()`; never hard-code hex values, font sizes or spacing.

### 2.1 Core colors

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
| `selected` / `selectedBorder` | `#DCE9F2` / `#3A6F96` | `#1C3242` / `#7FB2D6` | Picked option or code line before it is checked |

### 2.2 Code colors (only inside `CodeBlock`)

| Token | Light | Dark | Contrast on `codeSurface` (L / D) |
|---|---|---|---|
| `codeSurface` | `#EBF0F2` | `#0A1014` | — |
| `codeText` | `#14202B` | `#E4EBEE` | 14.4 / 15.9 |
| `syntaxKeyword` | `#6F3C96` | `#C9A2F0` | 6.6 / 9.0 |
| `syntaxString` | `#8A4B08` | `#E7B37A` | 5.9 / 10.1 |
| `syntaxNumber` | `#0F5F8C` | `#8CC4F0` | 6.0 / 10.3 |
| `syntaxComment` | `#56636E` | `#97A5AE` | 5.4 / 7.6 |
| `syntaxFunction` | `#9C2A5E` | `#F0A3C4` | 6.3 / 9.8 |

Any token the highlighter emits that is not listed falls back to `codeText`. Never map syntax to `success`, `danger` or `accent`.

### 2.3 Mastery scale (only inside `MasteryCell`)

Five steps, each a fill + a text color. The cell **always** shows the percentage as text, so the color is only a reinforcement.

| Token | Range | Light fill / text | Dark fill / text | Text contrast (L / D) |
|---|---|---|---|---|
| `mastery0` | not started | `#FFFFFF` / `#14202B` | `#162027` / `#E4EBEE` | 16.5 / 13.7 |
| `mastery1` | 1–39% | `#E0F0ED` / `#14202B` | `#12332E` / `#E4EBEE` | 14.1 / 11.3 |
| `mastery2` | 40–69% | `#B5DDD5` / `#14202B` | `#1D5249` / `#E4EBEE` | 11.2 / 7.4 |
| `mastery3` | 70–89% | `#5FAE9F` / `#04201B` | `#2B786A` / `#FFFFFF` | 6.6 / 5.3 |
| `mastery4` | 90–100% | `#0B6E63` / `#FFFFFF` | `#43C2AF` / `#04201B` | 6.1 / 7.8 |

Store them as `mastery: { fill: [...], text: [...] }` per scheme; the mapping from percentage to step is a pure, tested function (`masteryStep(percent)`).

Contrast rule: every text/background pair is **≥ 4.5 : 1** in both schemes (measured values above). Any new color keeps **≥ 4.5 : 1** for text and **≥ 3 : 1** for borders and non-text indicators, in both schemes.

**Adding a color:** add it to `ColorTokens`, give it a value in **both** `lightColors` and `darkColors`, check contrast in both, and name it by role (`warning`, `warningSoft`), never by hue (`orange`). Use the `X` + `XSoft` pair pattern for any new semantic state.

### 2.4 Spacing — 4 pt scale

| `xxs` | `xs` | `sm` | `md` | `lg` | `xl` | `xxl` |
|---|---|---|---|---|---|---|
| 2 | 4 | 8 | 12 | 16 | 24 | 32 |

- Screen padding and the gap between top-level sections: `lg`. Bottom padding of a scroll view: `xxl`.
- Inside a Card: padding `lg`, gap between children `md`.
- Label → control → help text: `sm`. Title → subtitle: `xs`. Tag vertical padding: `xxs`.
- Rows of buttons or chips: `sm` gap with `flexWrap: 'wrap'`.
- Use `gap` for spacing between siblings; do not add margins to children.

### 2.5 Radius

`sm` 6 (chips, tags, badges, progress, mastery cells) · `md` 10 (cards, buttons, options, code blocks, tables, feedback box) · `pill` 999 (segmented control only).

### 2.6 Typography — always through `AppText`

| Variant | Size | Weight | Line height | Use for |
|---|---|---|---|---|
| `display` | 40 | 700 | 1.1 | Screen title, big score number. Max one per screen area |
| `title` | 19 | 600 | 1.4 | Question text, section headings |
| `body` | 16 | 400 | 1.45 | Default text, option text |
| `small` | 14 | 400 | 1.45 | Chips, segments, explanations, table cells, meta info |
| `caption` | 12 | 400 | 1.4 | Help text, notes, tags |
| `label` | 12 | 600, UPPERCASE, +0.8 tracking | — | Field / group labels ("TESTUL DE AZI", "NIVEL") |
| `code` | 14 | 400, monospace | 1.5 | Code in `CodeBlock` and inline code in explanations |

Tones: `default`, `muted`, `accent`, `success`, `danger`. Emphasis is `bold` (600), never a different font or italic. The monospace family is platform-specific (`Menlo` on iOS, `monospace` on Android) and defined once in tokens. Never use `<Text>` from React Native directly in feature code.

### 2.7 Sizes

- Every pressable is at least `touchTarget` (44 × 44 pt), including selectable code lines.
- Borders are 1 px; the only exception is the 3 px left bar of `FeedbackBox`.
- Dimensions outside the scale (progress height 4/8, option letter 26, line-number gutter, mastery cell width) are **named constants or style keys inside that component**, never raw numbers in JSX.

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
- `useTheme()` only for values that cannot be in a StyleSheet (dynamic color by prop, navigation theme, mastery step colors).
- Dynamic per-render values (progress width, mastery step) are the only inline styles allowed.
- The React Navigation theme (bottom tabs and native stacks, in `src/navigation`) is derived from tokens; when you add a token that navigation needs, wire it there too.

## 4. Primitive inventory (`src/shared/ui`)

Use these before writing any new view. Primitives receive translated strings and know nothing about features, the store or content packs.

### 4.1 Base primitives (Phase 0)

| Primitive | Purpose | Key props | A11y contract |
|---|---|---|---|
| `ScreenContainer` | Scrollable screen body, safe area (top/left/right), `background` color, `lg` padding and gap | `ref` for scroll-to-top | — |
| `ScreenHeader` | Display title + muted subtitle + right-side slot | `title`, `subtitle?`, `accessory?` | title has `header` role, auto-shrinks to one line |
| `Card` | Surface block grouping one task | `children` | — |
| `AppText` | All text | `variant`, `tone`, `bold` | inherits Text props |
| `Button` | Actions | `label`, `onPress`, `variant: 'primary' \| 'secondary'`, `disabled` | `button` role, `disabled` state, opacity 0.45 disabled / 0.8 pressed |
| `Chip` | Toggle in a multi-select group, or one tab of a single-select picker | `label`, `selected`, `onPress(id)`, `role: 'checkbox' \| 'tab'` | `checkbox` + `checked`, or `tab` + `selected`; bold label when selected |
| `SegmentedControl` | Pick exactly one of 2–4 short options | `options`, `value`, `onChange(id)` | `radiogroup` / `radio`, `selected` state; active = inverted (`text` fill, `background` label) |
| `ProgressBar` | Progress 0..1 | `progress`, `tone`, `thick` | `progressbar` role with 0–100 value |
| `Tag` | Read-only metadata (test kind, level, topic status) | `label` | not pressable |
| `TextField` | Single-line text input (code output answers, search, notes) | `label`, `value`, `onChangeText`, `help?`, `monospace?` | label linked to input, `disabled` state |
| `ListRow` | Pressable row with title, meta line and right slot (topics, results) | `title`, `meta?`, `accessory?`, `onPress` | `button` role, label = title + meta |

### 4.2 Study primitives (*planned*, build when first needed)

| Primitive | Purpose | Key props | A11y contract |
|---|---|---|---|
| `OptionRow` | Lettered answer option (A, B, C…) | `letter`, `label`, `state`, `onPress(id)` | `radio` (single) or `checkbox` (multiple) with `checked`; disabled after reveal |
| `FeedbackBox` | Verdict + explanation after an answer | `verdict?: 'correct' \| 'wrong'`, `title`, `children` | `accessibilityLiveRegion="polite"`; verdict always written as text |
| `CodeBlock` | Highlighted code, horizontal scroll, optional line numbers and selectable lines | `code`, `language`, `selectableLines?`, `lineStates?`, `onSelectLine?(n)` | each selectable line is a `button` labelled "Linia 4: <code>" with `selected` state |
| `ReorderList` | Order items with move up / move down buttons (no drag) | `items`, `onMove(id, direction)`, `itemStates?` | buttons labelled "Mută în sus: <item>"; position announced after a move |
| `MasteryCell` | One heatmap cell: percentage + step fill | `percent`, `label?` | label = "<category>, <level>: 72%" |
| `StatTile` | Label + big value + caption (streak, accuracy) | `label`, `value`, `caption?` | read as one element |
| `MarkdownText` | Explanations, topic summaries | `content` | maps headings/paragraphs/lists to `AppText` variants; fenced code → `CodeBlock`; inline code → `code` variant |

### Which control to use

- One choice, 2–4 short labels (RO/EN, 5/10/15 questions, self-rating) → `SegmentedControl`.
- Many on/off choices (levels, categories filter) → wrapping row of `Chip`s with `role="checkbox"`.
- Single-select picker with more than 4 options (category tabs in the study map) → `Chip`s with `role="tab"`, inside a `tablist`.
- Doing something → `Button`. Exactly one `primary` per action row, placed **last (right)**; secondary/back actions go left.
- Read-only label → `Tag`. Never make a Tag pressable; use a Chip.
- New pattern needed twice → create a primitive (per `modular-architecture` §6), with styles, types, test and export from `shared/ui/index.ts`.

## 5. Interaction states

Every interactive element defines all of these, using tokens only:

| State | Visual | Accessibility |
|---|---|---|
| Default | `surface` fill, `border` 1 px | role + label |
| Pressed | opacity 0.8 | — |
| Selected / checked | `accentSoft` + `accent` border (Chip), inverted (Segment), `selected` + `selectedBorder` (option, code line) and bold label | `checked` / `selected` |
| Disabled | opacity 0.45, not pressable | `disabled: true` |
| Correct | `successSoft` fill, `success` border, filled `success` letter | text "Corect" in feedback |
| Wrong | `dangerSoft` fill, `danger` border, filled `danger` letter | text "Greșit" in feedback |
| Partially correct (multiple choice) | per-option correct/wrong states + verdict text "Parțial corect (2/3)" | verdict text |

Derive the visual state in a **pure function** (`optionState(option, answer, revealed)`, `lineState(...)`, `orderItemState(...)`), map it to style keys (`styles[state]`, `styles[`${state}Letter`]`) and test the function. Do not chain ternaries in JSX.

## 6. Session UX patterns (keep consistent)

Daily tests behave like a **learn mode**: feedback after every answer. (An exam mode without feedback until the end may come later for on-demand tests; it then follows the same results pattern.)

### 6.1 Common frame

- **Exercise card order:** header (test kind `Tag` · level `Tag` · "3 / 10" position · thin `ProgressBar`) → question `title` (via `MarkdownText`, may contain `CodeBlock`) → instruction hint in `accent` bold when needed ("Alege 2 răspunsuri", "Atinge linia cu bug-ul", "Ordonează pașii") → answer area (by exercise type) → `FeedbackBox` → navigation row.
- **Navigation row:** Back (secondary, left) · primary action (right) whose label follows the step: Verifică → Următoarea → Termină. Disable, never hide, an action that is not available yet, so the layout does not jump.
- **After reveal:** the answer area becomes disabled; correct parts green, the user's wrong picks red, untouched wrong parts neutral; then `FeedbackBox` with verdict and explanation, and a link "Recitește topicul" (secondary) to the topic.
- **Resume:** leaving a session keeps the current exercise and answers; reopening goes straight back to it.
- **Scroll position:** when the exercise or status changes, scroll to top without animation (`useScrollToTop`).

### 6.2 Per exercise type

| Type | Answer area | Reveal |
|---|---|---|
| `single_choice` | `OptionRow`s, `radio` role | correct option green; wrong pick red |
| `multiple_choice` | `OptionRow`s, `checkbox` role, hint "Alege N" | per-option states; verdict may be "Parțial corect (k/n)" |
| `code_output` | `CodeBlock` in the question, then `OptionRow`s or a monospace `TextField` | expected output shown in a `CodeBlock` inside the feedback |
| `find_bug` | `CodeBlock` with `selectableLines`; one line can be selected | buggy line green, wrong pick red, explanation names the line |
| `ordering` | `ReorderList` with up/down buttons and position numbers | each item green if in place, red if not, with "Poziția corectă: 3" as text |
| `flashcard_self_graded` | question only; primary "Arată răspunsul" | model answer in a `FeedbackBox` **without verdict**, then a `SegmentedControl` "Nu știam / Greu / Bine / Ușor"; "Următoarea" stays disabled until a rating is chosen. Ratings are neutral, never green/red. |

### 6.3 Screens

- **Today:** `ScreenHeader` ("Azi" + date) → one `Card` per daily test: `label` ("TEST DE LOGICĂ"), meta line ("5 probleme · ~15 min"), status `Tag` ("Neînceput" / "În lucru 3/5" / "Gata"), and one primary button ("Începe" / "Continuă"); when done, the score replaces the button. Below: `StatTile`s for streak ("12 zile") and weekly accuracy, written as text, no flame icons.
- **Results:** label (`label` variant, muted) → big `display` percentage + muted "correct / total" → bold verdict sentence → "De recitit" list of `ListRow`s (topic + why) → primary "Gata".
- **Study map:** category picker (`Chip role="tab"`) → level filter (`Chip role="checkbox"`) → topics as `ListRow`s with level `Tag` and status `Tag` ("Neînceput" / "În lucru" / "Parcurs").
- **Topic detail:** summary (`MarkdownText`) → resources (`ListRow`s) → notes (`TextField`, multi-line) → action row: status change (secondary) · "Exersează topicul" (primary).
- **Progress:** categories × levels table of `MasteryCell`s, inside a horizontally scrolling bordered frame with an `accentSoft` header; each row ends with the estimated level as text ("Nivel estimat: Mid"). Below: logic accuracy over time and weak topics as `ListRow`s.
- **Onboarding / setup rows:** each group is a `SetupRow` (label → control → caption help).
- **Persisted choices:** language, test length, notification time and filters survive restarts; never reset user choices silently.
- **Empty states:** when the knowledge pool is too small, the Today card says why in `small` muted text and offers a secondary button "Marchează topicuri" that opens the study map.

## 7. Layout rules

- Single column, top-to-bottom, inside `ScreenContainer`. Screen = `ScreenHeader` + Cards / sections.
- Text always wraps (`flex: 1` / `flexShrink: 1` in rows); never truncate question, option, explanation or topic text. Only the screen title may auto-shrink.
- **Exception — code:** code never wraps (wrapping changes its meaning). `CodeBlock` scrolls horizontally inside its frame and keeps the `code` size; font scaling still applies.
- Support Dynamic Type / font scaling: no fixed heights on text containers, use `minHeight`.
- Rows of controls wrap (`flexWrap: 'wrap'`) so they fit small phones and Romanian strings that are longer than English.
- Bottom tabs: "Azi", "Studiu", "Progres", "Setări" — text labels only (icons hidden), `body` 600, active `accent`, inactive `muted`. Adding a tab requires a strings entry for both languages.

## 8. Copy and i18n

- Every UI string comes from `src/shared/i18n/strings.ts`, with **both `ro` and `en`** filled in. Counts and plurals are functions (`questionsCount: n => ...`, `streakDays: n => ...`). No i18n library is needed.
- Content (questions, explanations, topic summaries) comes from content packs as `LocalizedText`. Show the user's language; if only `ro` exists, show it with a muted caption note ("Conținut disponibil doar în română") instead of a half-translated screen.
- Romanian uses correct diacritics with comma-below: **ș ț** (not ş ţ), plus ă â î. Content validation rejects cedilla forms.
- Tone: short, direct, second person, no exclamation marks except for success verdicts. Technical terms stay in English when that is how developers say them (hooks, event loop, middleware). Button labels are verbs or short noun actions ("Verifică", "Începe", "Arată răspunsul").
- Primitives never import i18n; containers pass translated text in.

## 9. Accessibility checklist (part of every component)

- Correct `accessibilityRole` (`button`, `checkbox`, `radio`, `radiogroup`, `tab`, `tablist`, `progressbar`, `header`).
- `accessibilityState` mirrors the visual state (`selected`, `checked`, `disabled`).
- `accessibilityLabel` when the visible label is not enough (code lines → "Linia 4: ...", mastery cells → "React, Senior: 72%", reorder buttons → "Mută în sus: ...").
- ≥ 44 pt targets, ≥ 4.5 : 1 text contrast in both themes, state never shown by color alone.
- Results and feedback that appear after an action use a live region; after a reorder, the new position is announced.
- Tests query by role and name (`getByRole('button', { name })`), which also proves the a11y contract.

## 10. Motion

- Default is **no animation**: instant state changes, `animated: false` scroll. The app should feel immediate.
- If motion is added, it must be ≤ 200 ms, run on the UI thread (Reanimated), communicate a state change (not decorate), and respect the system "reduce motion" setting (`AccessibilityInfo.isReduceMotionEnabled`).
- No celebration animations for streaks or scores.

## 11. Lessons from the previous app (build these right from the start)

- Single-select pickers use `Chip role="tab"` inside a `tablist`, never `checkbox` chips.
- Pickers and segmented controls pass one stable callback that receives the id (`onPress(id)`), never inline arrows per item, so `memo` on `Chip` / `OptionRow` works.
- No padding outside the spacing scale; `xxs` exists for the Tag's vertical padding.

## 12. Definition of done (UI/UX)

- [ ] Only tokens: no hex colors, raw font sizes or spacing numbers outside `tokens.ts` (named local constants for component-specific dimensions are fine)
- [ ] Checked in **light and dark** mode, with large font scaling, on a small screen
- [ ] Existing primitives reused; any new primitive is in `shared/ui`, exported and tested
- [ ] All states defined (default, pressed, selected, disabled, correct/wrong/partial where relevant)
- [ ] Roles, states, labels, 44 pt targets and contrast verified
- [ ] All strings in `strings.ts` for **RO and EN**, correct diacritics
- [ ] Exactly one primary action per action row, on the right; unavailable actions disabled, not hidden
- [ ] Layout does not jump between states; text wraps instead of truncating; code scrolls instead of wrapping
- [ ] Syntax and mastery colors used only inside `CodeBlock` and `MasteryCell`

In your summary, list the primitives you reused, any new token or primitive you added (with light and dark values and measured contrast), and any rule you could not follow and why.

## 13. Anti-patterns to reject

- Hard-coded colors (`'#fff'`, `'red'`), `fontSize: 15`, `margin: 10`
- A color defined only for light mode, or a dark mode "inverted" by hand in a component
- Using `success`/`danger` for anything other than correct/wrong (not for streaks, ratings, mastery or syntax)
- A color per category, topic or level
- Raw `<Text>`, `<TouchableOpacity>` or one-off buttons instead of `AppText` / `Button` / `Chip` / `ListRow`
- Two primary buttons side by side, or the primary action on the left
- Hiding a button instead of disabling it, causing layout shift
- Icons, shadows, gradients, badges, flames, confetti or decorative imagery added "to make it nicer"
- Strings in JSX, English-only strings, or Romanian without diacritics
- Truncated question, option or explanation text; wrapped or shrunk code; fixed-height text containers
- Drag-only interactions with no button alternative
- Animations for decoration, or animations that ignore reduce-motion
