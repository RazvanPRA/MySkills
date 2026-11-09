# Senior Prep

A personal Android app (React Native CLI, TypeScript) that prepares me for a **Senior Full Stack Engineer** role. Every day it builds two tests:

- **Logic test:** code tracing, event loop ordering, complexity, SQL result prediction, concurrency, puzzles. Difficulty adapts to my accuracy.
- **Knowledge test:** spaced repetition (FSRS) plus new questions, drawn only from topics I have marked as covered.

It also has a study map (categories → topics by level), progress tracking (a categories × levels mastery heatmap) and a daily reminder.

The project is also a portfolio piece. The product brief is in [.claude/CLAUDE.md](.claude/CLAUDE.md). The architecture rules are in [modular-architecture](.claude/skills/modular-architecture/SKILL.md) and the UI rules in [senior-prep-design-system](.claude/skills/senior-prep-design-system/SKILL.md).

## Requirements

| Tool        | Version                         | Notes                            |
| ----------- | ------------------------------- | -------------------------------- |
| Node        | ≥ 22.11 (24 recommended)        |                                  |
| pnpm        | 12 (pinned in `packageManager`) | `corepack enable pnpm`           |
| JDK         | 17                              | Used by the Android Gradle build |
| Android SDK | platform 37, NDK 27.1           | Via Android Studio               |

pnpm uses the hoisted `node_modules` layout (`pnpm-workspace.yaml` → `nodeLinker: hoisted`), because React Native autolinking and Gradle expect a flat `node_modules`.

## Getting started

```sh
pnpm install
pnpm start          # Metro
pnpm android        # debug build on an emulator or device
```

On Windows, `powershell -ExecutionPolicy Bypass -File .claude\scripts\run-android.ps1` does the whole loop: it starts the emulator, fixes off-screen windows, starts Metro, builds only when native code changed, and checks that the app is in the foreground.

The debug build is installed as **Senior Prep Dev** (`com.razvanprajanu.seniorprep.dev`), next to the release build **Senior Prep** (`com.razvanprajanu.seniorprep`).

## Scripts

| Script                         | What it does                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`               | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`)                                                                                                                                                              |
| `pnpm lint`                    | ESLint with zero warnings allowed. It also enforces layering, feature boundaries and size limits                                                                                                                 |
| `pnpm format` / `format:check` | Prettier                                                                                                                                                                                                         |
| `pnpm test`                    | Jest + React Native Testing Library                                                                                                                                                                              |
| `pnpm build:apk`               | Signed release APK: `android/app/build/outputs/apk/release/app-release.apk`                                                                                                                                      |
| `pnpm build:aab`               | Release App Bundle, for Google Play later                                                                                                                                                                        |
| `pnpm content:validate`        | Validates every pack with the app's own rules: schemas, references, duplicate ids, registered exercise types and their payload schemas, ș/ț diacritics, plus a fresh manifest. Exits 1 on any error (runs in CI) |
| `pnpm content:stats`           | Exercises per category × level × type, measured against the targets (15 per category, 60 for logic)                                                                                                              |
| `pnpm content:matrix`          | Regenerates the categories and topics of the packs from [docs/competency-matrix.md](docs/competency-matrix.md), keeping their exercises (`--check` in CI)                                                        |
| `pnpm content:index`           | Regenerates `content/packs/index.generated.ts` (`--check` in CI)                                                                                                                                                 |
| `pnpm db:generate`             | Generates a SQL migration from `src/db/schema.ts` (drizzle-kit)                                                                                                                                                  |

Git hooks: `pre-commit` runs lint-staged (ESLint + Prettier on staged files). `commit-msg` enforces [Conventional Commits](https://www.conventionalcommits.org/).

## Release signing

Release builds are signed with a private upload key that never enters the repo. A release build fails with a clear message if the key is not configured; it never silently falls back to the debug key.

1. Generate the key once, and back it up somewhere safe. Losing it means you can no longer publish updates to this `applicationId`.

   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keyalg RSA -keysize 2048 -validity 10000 ^
     -keystore %USERPROFILE%\.android-keystores\seniorprep-upload.keystore ^
     -alias seniorprep-upload
   ```

2. Add the credentials to your **user-level** `%USERPROFILE%\.gradle\gradle.properties`, not `android/gradle.properties`:

   ```properties
   SENIORPREP_UPLOAD_STORE_FILE=C:/Users/<you>/.android-keystores/seniorprep-upload.keystore
   SENIORPREP_UPLOAD_STORE_PASSWORD=...
   SENIORPREP_UPLOAD_KEY_ALIAS=seniorprep-upload
   SENIORPREP_UPLOAD_KEY_PASSWORD=...
   ```

3. Build and verify the signature:

   ```sh
   pnpm build:apk
   %ANDROID_HOME%\build-tools\37.0.0\apksigner verify --print-certs android\app\build\outputs\apk\release\app-release.apk
   ```

If `JAVA_HOME` points to a newer JDK, run Gradle with JDK 17. Either set `JAVA_HOME` for the session, or add `org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-17...` to the same user-level `gradle.properties`.

## Adding content

Categories, topics and exercises are data, not code.

- **Categories and topics** come from the competency matrix, [docs/competency-matrix.md](docs/competency-matrix.md). Each row × level is one topic. Edit the matrix, then run `pnpm content:matrix`: it rewrites the categories and topics of the packs it describes, keeps their exercises, bumps the pack version when something changed, and refreshes the pack manifest. Do not edit categories or topics in the JSON by hand; CI fails if the packs and the matrix disagree.
- **Exercises** are written by hand in `content/packs/<pack-id>.json`, and reference topic ids such as `react.hooks.mid`.
- **A pack outside the matrix** (e.g. `logic-core`) is a JSON file in `content/packs/` whose file name equals the pack `id`. Run `pnpm content:index` after adding the file.

Run `pnpm content:validate` after any change, and `pnpm content:stats` to see where exercises are missing.

If you change the pack schema, increase `CURRENT_CONTENT_SCHEMA_VERSION` and add a migration to `contentMigrations` (`src/features/content/services/migrateContentPack.service.ts`), with a test.

At startup, invalid content is left out of the catalog and reported. The app never crashes because of it.

A new exercise type or test type is a module in `src/features/exercise-types/<type>` or `src/features/test-definitions/<kind>`, registered with one line in `src/app/registries.ts`.

## Database

SQLite runs through op-sqlite on the device. Drizzle builds the queries through its `sqlite-proxy` driver, over a small `SqlExecutor`. The same driver and the same migration runner run in Jest on better-sqlite3, so repository and migration tests use real SQL.

To change the schema: edit `src/db/schema.ts`, run `pnpm db:generate`, and add a test showing that existing rows survive. Migrations run on every start, before any screen mounts.

## Project structure

```
src/
  app/          providers, store, bootstrap, registries.ts, dependencies.ts (the only place implementations are chosen)
  navigation/   React Navigation: tabs, root stack, linking (seniorprep://), token-based theme
  features/     self-contained feature modules; others may import only their index.ts
  db/           Drizzle schema, generated migrations, executors (op-sqlite, better-sqlite3)
  shared/       ui (primitives), theme (tokens), i18n (strings.ts), domain, registry, utils
content/packs/  content packs (JSON) and the generated manifest
scripts/        content:validate / content:stats / content:index, Gradle helper
```

ESLint (`eslint-plugin-boundaries`) enforces the dependency direction `app → navigation → features → db → shared`. It also blocks imports into another feature's internals.
