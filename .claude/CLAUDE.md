# Project brief: mobile app for Senior Full Stack interview prep

## 1. Role and context

You are a senior React Native + TypeScript engineer building, together with me, a personal mobile app that prepares me for a **Senior Full Stack Engineer** role.

About me:
- I have worked in IT since March 2022 (almost 5 years of experience).
- Target stack: **FE** React / Next.js, React Native, Angular; **BE** NestJS, Java (Spring Boot), Go; **DB** SQL (PostgreSQL) and MongoDB; plus DevOps, security, observability, architecture and soft skills.
- I have a competency matrix by level (Junior / Mid / Senior) for every area. It becomes the app's initial content (section 10).
- The app is also a portfolio project. The code must look like a senior's work: modular, tested, easy to extend.

## 2. What the app does

Every day it generates **two tests** for me:

1. **Logic test.** Independent of what I have studied. It trains reasoning: code tracing, event loop ordering, algorithmic reasoning and complexity, predicting SQL query results, concurrency (Go/Java), logic puzzles. Difficulty adapts to my performance.
2. **Knowledge test.** Contains questions **only** from topics I have marked as covered. It mixes spaced repetition (what is due for review today) with new questions from covered topics, weighted toward my weak areas.

Beyond the tests:
- **Study map:** categories → topics, each with its level (Junior/Mid/Senior), a summary, resources and my own notes. I mark a topic as "in progress" or "covered".
- **Progress:** mastery per category and topic, estimated level per matrix area, history, streak, weak spots.
- **Daily notification** at a time I choose.

**Main design requirement:** in the future I must be able to add **new categories** (e.g. System Design, English for interviews, AWS), **new exercise types** and **new test types** (e.g. a weekly System Design test) without changing the existing code of other modules.

## 3. Extensibility principles (the most important decisions)

The app strictly separates **content** from **behavior**.

| What I want to add | How it is added | New code needed |
| --- | --- | --- |
| A category or new topics | A new JSON **content pack**, or a new version of an existing one | None |
| New exercises of an existing type | New entries in a content pack | None |
| A **new exercise type** (e.g. "order the steps", "find the bug") | A module implementing `ExerciseTypeDefinition`, registered in the registry | Only the new module |
| A **new test type** (e.g. weekly test, single-category test) | A module implementing `TestDefinition`, registered in the registry | Only the new module |
| A new content source (backend, AI generation) | A new `ContentRepository` implementation injected in `src/app/dependencies.ts` | Only the new repository |

Rules:
- No `switch` on exercise type or category in UI or services. Everything goes through typed **registries**.
- Categories and topics are **data**, not code. No hardcoded category enums.
- Any data crossing a boundary (content JSON, storage, API) is validated with **zod**. TS types are inferred from the zod schemas.
- Content packs have a `schemaVersion`. Schema changes ship with explicit migrations.

## 4. Tech stack

- **React Native CLI** (latest stable React Native, New Architecture), TypeScript `strict`. No Expo. The `android/` folder is committed and maintained by hand.
- Build output: a signed release **APK** for personal use now (`./gradlew assembleRelease`, `pnpm build:apk`). An **AAB** (`./gradlew bundleRelease`) later, for Google Play. Keep `applicationId` stable from day one.
- **React Navigation** (native stack + bottom tabs) for navigation, with a `linking` config for deep links.
- **Redux Toolkit** for state (one slice per feature, memoized selectors). **RTK Query** once the backend arrives.
- **zod** for schemas and validation.
- **op-sqlite + Drizzle ORM** for local relational data (progress, attempts, spaced repetition state, sessions), with migrations. **AsyncStorage** (`@react-native-async-storage/async-storage`) only for small preferences. **react-native-keychain** for tokens, later.
- **ts-fsrs** for spaced repetition (the FSRS algorithm).
- **i18n without a library**: UI strings in `src/shared/i18n/strings.ts` with `ro` and `en` (Romanian by default), as defined in the `senior-prep-design-system` skill. Question content may start in one language, but the schema supports localized text.
- **FlashList** for lists. **Reanimated** only where motion is justified by the design system (default is no animation).
- **Notifee** (`@notifee/react-native`) for the daily local reminder. Check that it is still actively maintained before Phase 4, and propose an alternative if it is not.
- Markdown rendering for explanations and a **syntax-highlighted code** component (check which library is actively maintained before choosing, and justify the choice).
- Testing: **Jest + React Native Testing Library**, later **Maestro** for e2e.
- Quality: ESLint, Prettier, `typecheck`, husky + lint-staged, GitHub Actions (lint, typecheck, test, content validation).

If you propose something other than the above, explain the trade-off and wait for my confirmation.

## 5. Domain model

Start from the model below. You may refine it, but explain every change. Types are defined as zod schemas in `model/` and exported as inferred types.

```ts
type Level = 'junior' | 'mid' | 'senior';
type LocalizedText = { ro: string; en?: string };

interface Category {
  id: string;                 // 'react', 'nestjs', 'go', 'logic' ...
  title: LocalizedText;
  icon?: string;              // optional icon key, not rendered for now (design system: no decorative icons)
  testKinds: string[];        // which tests it feeds: ['knowledge'] or ['logic']
  order: number;
}

interface Topic {
  id: string;                 // 'react.hooks.use-effect'
  categoryId: string;
  title: LocalizedText;
  level: Level;
  summary: LocalizedText;     // markdown
  resources: { title: string; url: string }[];
  tags: string[];
  prerequisites: string[];    // topic ids
}

interface Exercise<TPayload = unknown> {
  id: string;
  type: string;               // key in ExerciseTypeRegistry
  topicId: string;            // for logic: topics in the 'logic' category
  level: Level;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedSeconds: number;
  prompt: LocalizedText;      // markdown, may contain code blocks
  payload: TPayload;          // validated by the exercise type's schema
  explanation: LocalizedText; // why it is correct, pitfalls, where to read more
  tags: string[];
  source: 'pack' | 'user' | 'ai';
  version: number;
}

interface ContentPack {
  id: string;
  version: string;            // semver
  schemaVersion: number;
  title: LocalizedText;
  categories: Category[];
  topics: Topic[];
  exercises: Exercise[];
}

interface TopicProgress {
  topicId: string;
  status: 'not_started' | 'in_progress' | 'studied';
  studiedAt?: string;
  notes?: string;
}

interface ReviewCard {        // FSRS state per exercise
  exerciseId: string;
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  lastReview?: string;
}

interface DailySession {
  id: string;
  date: string;               // 'YYYY-MM-DD' in the local time zone
  testKind: string;           // key in TestRegistry: 'logic' | 'knowledge' | ...
  exerciseIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  score?: number;
}

interface Attempt {
  id: string;
  sessionId: string;
  exerciseId: string;
  answer: unknown;            // validated by the type's answerSchema
  result: EvaluationResult;
  durationMs: number;
  confidence?: 1 | 2 | 3 | 4; // self-rating: Didn't know / Hard / Good / Easy
}

interface EvaluationResult {
  correct: boolean;
  score: number;              // 0..1, allows partial credit
  feedback?: LocalizedText;
}
```

## 6. Registries (the extensibility mechanism)

### 6.1 Exercise types

```ts
interface ExerciseTypeDefinition<TPayload, TAnswer> {
  type: string;
  payloadSchema: z.ZodType<TPayload>;
  answerSchema: z.ZodType<TAnswer>;
  Renderer: React.ComponentType<ExerciseRendererProps<TPayload, TAnswer>>;
  evaluate: (payload: TPayload, answer: TAnswer) => EvaluationResult; // pure function
  toFsrsRating?: (result: EvaluationResult, confidence?: number) => Rating;
}
```

- Each type lives in `src/features/exercise-types/<type>/`, with an `index.ts` that exports the definition.
- When content loads, `exerciseTypeRegistry` checks that every `exercise.type` exists and that its `payload` passes the schema. Invalid exercises are excluded and reported. The app does not crash.
- The session player is **generic**: it receives an exercise, gets the `Renderer` from the registry and calls `evaluate`.

MVP types:
1. `single_choice`
2. `multiple_choice` (partial credit)
3. `code_output`: predict a snippet's output (choices, or normalized free input)
4. `find_bug`: tap the buggy line in a code block
5. `ordering`: put steps in order (e.g. event loop log order, NestJS request pipeline order)
6. `flashcard_self_graded`: an open senior-level question ("When do you choose RSC over client components?"). I form my answer, see a model answer with key points and grade myself. The rating feeds FSRS.

Later (only prepare the contract, do not implement): `free_text_ai_graded`, `code_challenge`, `sql_query` (run against a local SQLite with test data).

### 6.2 Test types

```ts
interface TestDefinition {
  kind: string;                         // 'logic' | 'knowledge' | ...
  title: LocalizedText;
  schedule: 'daily' | 'weekly' | 'on_demand';
  buildSession: (ctx: TestBuildContext) => SessionPlan; // pure, deterministic
}

interface TestBuildContext {
  date: string;
  seed: number;                         // hash(date + kind): same day gives the same test
  catalog: ContentCatalog;              // valid categories, topics, exercises
  progress: TopicProgress[];
  reviewCards: ReviewCard[];
  recentAttempts: Attempt[];            // last 14 days
  settings: UserSettings;
}
```

- The Today screen shows one card per `TestDefinition` with `schedule: 'daily'`. A new test type appears automatically.
- `buildSession` receives all dependencies as parameters (no direct `Date.now()` or `Math.random()`), so it is fully testable.

## 7. Daily algorithms

### 7.1 Knowledge test (default 10 exercises, ~10–12 minutes)

1. Pool = exercises from topics with status `in_progress` or `studied`, in categories whose `testKinds` include `'knowledge'`.
2. Priority 1: FSRS cards with `due <= today`, sorted by how overdue they are. At most 6.
3. Priority 2: new exercises (no ReviewCard) from covered topics, weighted inversely to the category's mastery (weak areas appear more often). At most 3.
4. One "stretch" exercise: level `senior`, difficulty ≥ 4, from a covered topic.
5. Variety: at most 3 exercises from the same category, and no two exercises from the same topic in one test when alternatives exist.
6. If the pool is too small, the test is shorter and the app tells me what to mark as covered to get a full test.

### 7.2 Logic test (default 5 problems, ~15 minutes)

1. Pool = exercises from categories whose `testKinds` include `'logic'`. Subcategories (as topics): JS/TS code tracing, event loop and async, complexity and algorithms, SQL result prediction, Go/Java concurrency, classic logic puzzles, debugging.
2. **Adaptive difficulty:** target 70–80% accuracy over the last 7 days. Above target, raise the average difficulty by 0.5. Below target, lower it by 0.5. Bounds: 1–5.
3. At least 3 different subcategories per day. Do not repeat a logic exercise within 30 days.

### 7.3 Common rules

- The day is computed in the device's local time zone.
- The session is generated on the first open of the day and saved. Reopening the app gives the same test, with progress kept.
- Missed days do not stack up. The streak grows when both daily tests are complete. I get one "freeze" per week.
- After each exercise I immediately see right/wrong and the explanation. At the end I see a summary: score, time, topics to re-read, with a direct link to each topic.

## 8. Mastery and estimated level

- **Topic mastery** (0–100): a weighted average of recent attempt scores, with time decay, combined with FSRS stability.
- **Estimated level per category:** Junior / Mid / Senior, based on mastery of the topics at each level. Example rule: you are "Mid" in a category if you have ≥ 70% mastery on ≥ 80% of its Junior and Mid topics. Make the rule configurable and tested.
- The progress screen shows a **categories × levels matrix** (heatmap), the same structure as my competency matrix, so I can see at a glance how "senior" I am in each area.

## 9. Screens

1. **Onboarding:** choose the track (Senior Full Stack), self-assess my level per category, quickly mark topics I already know, choose the notification time.
2. **Today:** one card per daily test (status, estimated duration, score when done), streak, a suggested topic to study.
3. **Session player:** generic, progress bar, optional timer, renderer from the registry, confidence self-rating, explanation after each answer.
4. **Session results:** score, mistakes with explanations, topics to review.
5. **Study map:** categories → topics grouped by level, filters and search, status per topic.
6. **Topic detail:** summary, resources, my notes, a "Practice this topic only" button (`on_demand` session).
7. **Progress:** categories × levels heatmap, history, weak spots, logic-test accuracy over time.
8. **Settings:** notifications, language, test length, installed content packs (with version), JSON export/import of my data, reset.

Theme: dark and light, design tokens, good typography for code (monospace font), full accessibility.

## 10. Initial content

- Content lives in `content/packs/*.json`, one pack per domain: `fullstack-frontend`, `fullstack-mobile`, `fullstack-backend-node`, `fullstack-java`, `fullstack-go`, `fullstack-databases`, `fullstack-devops-soft`, `logic-core`.
- Categories and topics come from my competency matrix: React + Next.js, React Native, Angular, NestJS, Java/Spring, Go, SQL, MongoDB, cross-cutting fundamentals (JS/TS, HTTP, API design, testing, architecture), DevOps/security/observability, soft skills. Each matrix row × level becomes a topic.
- For the MVP: at least **15 exercises per category** (mixed levels, weighted toward Mid and Senior) and **60 logic exercises**. All with high-quality explanations, written the way a senior interviewer would explain them, not textbook definitions.
- Script `pnpm content:validate`: validates every pack with zod and checks references (topicId, categoryId, prerequisites), duplicate ids and known exercise types. Runs in CI.
- Script `pnpm content:stats`: counts exercises per category × level × type, so I can see where content is missing.

## 11. Code architecture

Follow the `modular-architecture` skill **in full** (layers, feature modules with a public `index.ts`, repositories behind interfaces, pure services, size limits, Definition of Done). In addition:

```
src/
  app/                      providers, dependencies.ts (repository injection), registries.ts
  navigation/               React Navigation navigators, route types, linking config (thin: mounts screens from features)
  features/
    content/                pack loading, validation, ContentCatalog, ContentRepository
    study-map/              categories, topics, TopicProgress, notes
    daily-tests/            TestRegistry, Today screen, session generation
    test-definitions/
      knowledge/            TestDefinition 'knowledge'
      logic/                TestDefinition 'logic'
    session-player/         generic player, results
    exercise-types/
      single-choice/
      multiple-choice/
      code-output/
      find-bug/
      ordering/
      flashcard-self-graded/
    spaced-repetition/      wrapper over ts-fsrs, ReviewCard repository
    progress/               mastery, estimated level, heatmap, streak
    notifications/
    settings/
  shared/                   ui (primitives, see senior-prep-design-system), theme (tokens), i18n (strings.ts), utils, shared domain types
  db/                       Drizzle schema, migrations, client
content/packs/              content JSON
scripts/                    content:validate, content:stats
```

- `registries.ts` is the **only** place where exercise types and test types are registered. A new module = one import and one registration line.
- Repositories have local implementations for now (`Local*Repository`). The interfaces are designed for `Remote*` implementations later.

## 12. Delivery phases

Work **one phase at a time**. At the end of each phase: run `typecheck`, `lint`, `test`, check the skill's Definition of Done, and summarize what you created, what you reused, any `arch-exception`, and what comes next. Then wait for my confirmation.

- **Phase 0 – Foundation:** React Native CLI project (Android, release signing, `build:apk` script), strict TS, ESLint/Prettier, Jest, folder structure, theme and tokens, i18n, base UI components, CI.
- **Phase 1 – Content and domain:** zod schemas, content packs, `content:validate`, `ContentCatalog`, registries (empty, with tests), SQLite DB + migrations, local repositories.
- **Phase 2 – Knowledge test:** FSRS, `TestDefinition 'knowledge'`, session player, `single_choice`, `multiple_choice` and `flashcard_self_graded` types, Today and Results screens.
- **Phase 3 – Logic test:** `TestDefinition 'logic'`, adaptive difficulty, `code_output`, `find_bug` and `ordering` types, the `logic-core` pack.
- **Phase 4 – Study and progress:** study map, topic detail, notes, mastery, estimated level, heatmap, streak, notifications, onboarding, export/import.
- **Phase 5 – Full stack (optional, also for interview prep):** a **NestJS + PostgreSQL + Prisma** backend: authentication, progress sync, versioned content pack distribution, generating new exercises and grading free-text answers with an LLM, **server-side only**, never with API keys in the app. In the app: `Remote*Repository` + RTK Query, keeping offline-first.

## 13. Quality

- Pure services (session generation, evaluators, mastery, estimated level, adaptive difficulty, streak) have unit tests for normal, edge and invalid cases. Session generation is tested with a fixed seed and fixed dates.
- Each exercise type has tests for its schema, evaluator and renderer (including accessibility).
- No data is lost on update: DB migrations and content schema migrations are tested.
- Performance: the player stays smooth on a mid-range Android. Large code blocks do not block the JS thread.

## 14. How to work with me

1. Before writing code, send me a **short plan for Phase 0 and Phase 1**: technical decisions, any deviations from this brief, and open questions. Wait for my confirmation.
2. Do not generate the whole project at once. Work incrementally, in small commits with conventional commit messages.
3. When a decision has real trade-offs (e.g. Drizzle vs another ORM, how to store FSRS state), briefly present 2 options and your recommendation.
4. Treat me as a colleague working toward senior: briefly explain *why* you chose an approach, especially for architecture, so the project also prepares me.