---
name: modular-architecture
description: Mandatory architecture rules for this React Native + TypeScript codebase. Use for ANY code change — new screens, components, hooks, services, state, API, refactors or bug fixes — to keep code split into small, reusable, single-purpose units and isolated feature modules at senior level.
---

# Modular architecture — senior standard

These rules are **mandatory**, not suggestions. Every agent working in this repository follows them on every change, including small fixes. If a rule blocks a task, stop and explain why instead of breaking it silently.

For anything the user sees (tokens, primitives, states, copy, accessibility), also follow the `senior-prep-design-system` skill.

## 1. Core principles

1. **One unit, one reason to change.** A component renders, a hook manages state or effects, a service performs one business capability, a repository talks to storage or the network. Never mix these roles in one file.
2. **Small by default.** Prefer five 40-line units over one 200-line unit.
3. **Reuse before you write.** Search the codebase before creating anything new (section 6).
4. **Depend on contracts, not implementations.** Features and services talk through typed interfaces and public `index.ts` entry points.
5. **Explicit over clever.** Readable names, typed inputs and outputs, no hidden side effects.

## 2. Hard limits

Exceeding a limit means you must split the unit before finishing the task.

| Unit | Limit |
|---|---|
| Component file | ≤ 150 lines (JSX ≤ 80 lines) |
| Screen file | ≤ 120 lines; it only composes sections and wires hooks |
| Hook | ≤ 80 lines, one concern |
| Service / util function | ≤ 40 lines per function, ≤ 200 lines per file |
| Props per component | ≤ 7; group related props into an object or split the component |
| Nesting depth in JSX | ≤ 4 levels; extract a subcomponent beyond that |
| Function parameters | ≤ 3; use an options object beyond that |
| Cyclomatic complexity | ≤ 10 per function |

If splitting would genuinely hurt readability, keep the unit, add a one-line comment `// arch-exception: <reason>` at the top, and mention it in your summary.

## 3. Layers and dependency direction

Dependencies only point **downward**. A lower layer never imports from a higher one.

```
app / navigation          navigators (React Navigation), providers, registries, dependencies
  ↓
screens                   compose feature sections; no logic of their own
  ↓
features/<name>           feature components, feature hooks, slice, selectors
  ↓
services                  business capabilities (pure where possible)
  ↓
repositories              storage + API access behind interfaces
  ↓
api / storage             RTK Query endpoints, DTOs, op-sqlite (Drizzle), AsyncStorage, Keychain
─────────────────────────
shared (usable by every layer above it): ui primitives, theme, i18n, utils, domain types
```

Rules:
- **UI primitives** (`src/shared/ui`) know nothing about features, the store, i18n keys or navigation. They receive everything via props.
- **Feature components** may use the store, i18n and feature hooks, but never call repositories, the database or the API directly.
- **Features never import from another feature's internals.** Cross-feature use goes through that feature's `index.ts` public API only. If two features need the same thing, move it down to `shared` or `services`.
- **No circular imports.** If one appears, extract the shared piece to a lower layer.

## 4. Feature modules ("micro-services" inside the app)

Each feature is a self-contained module with its own public contract, so it can be developed, tested, replaced or later backed by a real backend service without touching other features.

```
src/features/<feature>/
  index.ts                  public API: the only file other modules may import
  model/                    types.ts, schemas.ts (zod), constants.ts
  state/                    slice.ts, selectors.ts, thunks.ts
  services/                 <capability>.service.ts — one capability per file
  repository/               <Feature>Repository.ts (interface), Local<Feature>Repository.ts, Remote<Feature>Repository.ts
  hooks/                    use<Something>.ts — one concern per hook
  components/               feature components, one folder each
  screens/                  thin screens composing the components
  __tests__/
```

- `index.ts` exports only what others need: screens, public hooks, public selectors and public types. Everything else stays private.
- **Services** are small, focused and mostly pure: `buildKnowledgeSession`, `adjustLogicDifficulty`, `calculateTopicMastery`, `estimateCategoryLevel`, `evaluateSingleChoice`. They receive dependencies as parameters (repository, clock, seed, id generator) so they can be tested without mocks of global state.
- **Repositories** hide where data lives. The rest of the feature depends on the interface; the concrete implementation (local today, remote later) is injected in one place (`src/app/dependencies.ts`).
- **Registries** (exercise types, test types) are filled in one place (`src/app/registries.ts`). Features read from a registry; they never import another exercise type or test type directly.
- Feature-to-feature communication happens through **public selectors, public hooks or dispatched domain actions**, never through reaching into another slice's state shape.

## 5. Component rules

Every component lives in its own folder:

```
ComponentName/
  ComponentName.tsx          rendering only
  ComponentName.styles.ts    StyleSheet built from theme tokens only
  ComponentName.types.ts     props and public types
  useComponentName.ts        local logic, when there is any
  ComponentName.test.tsx
  index.ts                   re-export
```

- **Presentational vs container:** a component either renders props (presentational) or connects data via hooks and passes it down (container). Not both. Containers stay tiny.
- **Logic goes into hooks**, not into JSX. No data transformation, sorting, filtering or formatting inline in the render.
- **Composition over configuration:** prefer `children`, slots and small variants to boolean-flag explosions. More than 2 boolean props that change layout means you need two components or a `variant` prop.
- **Styling:** tokens only (`theme.color.*`, `theme.space.*`, `theme.radius.*`). No inline hex values, magic numbers or inline style objects created on every render.
- **Text:** every user-visible string comes from i18n. Primitives receive already-translated strings.
- **Accessibility is part of the component's contract:** role, state, label and a ≥ 44 pt touch target.
- **Performance:** wrap list items and frequently re-rendered leaves in `React.memo`. Pass stable callbacks (`useCallback`) to memoized children. Select the smallest store slice needed with memoized selectors. Any animation runs on the UI thread with Reanimated worklets.

## 6. Reuse-first workflow

Before creating any component, hook, service or util:

1. Search `src/shared` (ui, theme, i18n, utils, domain) and the relevant feature for something that already does it or almost does it.
2. If something close exists, **extend it** (new variant or prop) as long as it stays within the limits in section 2.
3. If you are about to write the same logic or markup a **second time**, extract it into a shared unit now and replace both usages.
4. Name new units so the next agent can find them: `<Noun><Role>` for components (`OptionRow`, `MasteryCell`), `use<Verb><Noun>` for hooks (`useDailySession`), `<verb><Noun>` for service functions (`buildKnowledgeSession`).

## 7. Decomposition example

The session player must not be one file. Split it like this:

```
features/session-player/screens/SessionScreen.tsx      composes the sections below
features/session-player/components/
  SessionHeader/                                       test kind Tag, level Tag, "3 / 10", ProgressBar
  ExerciseView/                                        asks the registry for the Renderer of exercise.type
  SessionFeedback/                                     FeedbackBox + "Recitește topicul" link
  SessionNavigation/                                   Back + Verifică → Următoarea → Termină
  SelfRating/                                          "Nu știam / Greu / Bine / Ușor" (flashcards only)
features/session-player/hooks/
  useSessionProgress.ts                                current index, answers, resume after restart
  useExerciseAnswer.ts                                 draft answer, check, reveal state
features/session-player/services/
  scoreSession.service.ts                              pure: attempts → score summary
  nextPrimaryAction.service.ts                         pure: (step, isLast) → 'check' | 'next' | 'finish'
features/exercise-types/single-choice/
  index.ts                                             ExerciseTypeDefinition (schemas, Renderer, evaluate)
  SingleChoiceRenderer/                                list of OptionRow
  evaluateSingleChoice.service.ts                      pure: (payload, answer) → EvaluationResult
```

Shared primitives used here (`OptionRow`, `FeedbackBox`, `CodeBlock`, `Button`, `Tag`, `ProgressBar`, `SegmentedControl`) come from `src/shared/ui`, not from the feature.

## 8. Types and state

- TypeScript `strict`. No `any`, no non-null `!` assertions without a comment explaining why.
- Domain types are defined once in `model/` and inferred from zod schemas where data crosses a boundary (content packs, storage, API).
- The store holds **source data only**. Derived values (mastery, estimated level, streak) are memoized selectors or pure services.
- Slices are owned by one feature. Other features read through public selectors.

## 9. Testing requirements

- Every service function: unit tests covering normal, edge and invalid input. Session builders are tested with a fixed seed and fixed dates.
- Every exercise type: tests for its schemas, its evaluator and its renderer.
- Every hook with logic: tests with `renderHook`.
- Every UI primitive: a render test plus interaction and accessibility state.
- Every slice: reducer and selector tests.
- Every DB or content schema migration: a test that old data survives.
- A change that adds behavior without a test is not done.

## 10. Definition of done (check before every summary)

- [ ] No file exceeds the limits in section 2, or each exception is marked and explained
- [ ] No upward or cross-feature internal imports; no circular dependencies
- [ ] No duplicated markup or logic; anything used twice is extracted
- [ ] No hard-coded strings, colors or spacing
- [ ] New units are in their correct layer and folder, exported via `index.ts`
- [ ] New exercise or test types are registered only in `src/app/registries.ts`
- [ ] Tests added or updated and passing
- [ ] `typecheck`, `lint` and `test` pass

In your summary, list the new units you created, which existing units you reused, and any `arch-exception` you added.

## 11. Anti-patterns to reject

- "God" screens or components that fetch, transform, store and render in one place
- Utility dumping grounds (`helpers.ts`, `utils.ts` with unrelated functions); group by purpose instead
- Prop drilling more than 2 levels; use composition, a feature hook or a selector
- Copy-pasted components with small differences instead of a variant
- Business rules inside components or reducers instead of services
- `switch` on exercise type, test type or category outside a registry
- Direct database, AsyncStorage or fetch calls outside repositories
- `Date.now()` or `Math.random()` inside services; pass a clock or a seed
- Importing from `../../otherFeature/components/...`
