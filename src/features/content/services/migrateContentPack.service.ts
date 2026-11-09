import { CURRENT_CONTENT_SCHEMA_VERSION } from '../model/schemas';

type RawPack = Record<string, unknown>;

/** Upgrades a raw pack by exactly one schemaVersion. Must be pure. */
export type ContentMigration = (pack: RawPack) => RawPack;

/**
 * Key `n` upgrades a pack from schemaVersion n to n + 1.
 * Every schema change ships with its migration here, plus a test that old packs survive.
 */
export const contentMigrations: Readonly<Record<number, ContentMigration>> = {};

export type MigrationFailure =
  | 'not_an_object'
  | 'missing_schema_version'
  | 'newer_than_supported'
  | 'missing_migration';

export type MigrationResult =
  | { ok: true; pack: RawPack; from: number }
  | { ok: false; reason: MigrationFailure; message: string };

type MigrationOptions = {
  targetVersion?: number;
  migrations?: Readonly<Record<number, ContentMigration>>;
};

const isRecord = (value: unknown): value is RawPack =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fail = (reason: MigrationFailure, message: string): MigrationResult => ({
  ok: false,
  reason,
  message,
});

/** Brings a raw pack to the current schemaVersion, one migration at a time. */
export function migrateContentPack(raw: unknown, options: MigrationOptions = {}): MigrationResult {
  const { targetVersion = CURRENT_CONTENT_SCHEMA_VERSION, migrations = contentMigrations } =
    options;
  if (!isRecord(raw)) {
    return fail('not_an_object', 'A content pack must be a JSON object');
  }
  const from = raw.schemaVersion;
  if (typeof from !== 'number' || !Number.isInteger(from) || from < 1) {
    return fail('missing_schema_version', 'schemaVersion must be a positive integer');
  }
  if (from > targetVersion) {
    return fail(
      'newer_than_supported',
      `schemaVersion ${from} is newer than this app supports (${targetVersion}); update the app`,
    );
  }
  let pack = raw;
  for (let version = from; version < targetVersion; version += 1) {
    const migrate = migrations[version];
    if (!migrate) {
      return fail('missing_migration', `No migration from schemaVersion ${version}`);
    }
    pack = { ...migrate(pack), schemaVersion: version + 1 };
  }
  return { ok: true, pack, from };
}
