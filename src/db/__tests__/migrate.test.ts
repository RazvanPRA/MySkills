import { createDatabase } from '../database';
import { migrateDatabase, toMigrationMeta, type MigrationBundle } from '../migrate';
import migrations from '../migrations/migrations';
import { betterSqliteExecutor, createTestDatabase } from '../testing/createTestDatabase';

const tableNames = (sqlite: { prepare: (sql: string) => { all: () => unknown[] } }) =>
  (
    sqlite.prepare("select name from sqlite_master where type = 'table' order by name").all() as {
      name: string;
    }[]
  ).map(row => row.name);

describe('toMigrationMeta', () => {
  const bundle: MigrationBundle = {
    journal: {
      entries: [
        { idx: 0, when: 100, tag: '0000_init', breakpoints: true },
        { idx: 1, when: 200, tag: '0001_next', breakpoints: true },
      ],
    },
    migrations: { m0000: 'A;--> statement-breakpoint\nB;', m0001: 'C;' },
  };

  it('splits statements and keeps journal order and timestamps', () => {
    expect(toMigrationMeta(bundle)).toEqual([
      { sql: ['A;', '\nB;'], bps: true, folderMillis: 100, hash: '' },
      { sql: ['C;'], bps: true, folderMillis: 200, hash: '' },
    ]);
  });

  it('fails loudly when a migration file is missing from the bundle', () => {
    expect(() => toMigrationMeta({ ...bundle, migrations: { m0000: 'A;' } })).toThrow('0001_next');
  });
});

describe('migrateDatabase', () => {
  it('creates every table on a fresh database', async () => {
    const { sqlite } = await createTestDatabase();
    expect(tableNames(sqlite)).toEqual(
      expect.arrayContaining(['attempts', 'daily_sessions', 'review_cards', 'topic_progress']),
    );
  });

  it('is idempotent and keeps existing rows when run again (every app start)', async () => {
    const { db, sqlite } = await createTestDatabase();
    sqlite
      .prepare(
        "insert into topic_progress (topic_id, status, updated_at) values ('react.hooks', 'studied', 'x')",
      )
      .run();
    await migrateDatabase(db, migrations);
    await migrateDatabase(createDatabase(betterSqliteExecutor(sqlite)), migrations);
    expect(sqlite.prepare('select count(*) as n from topic_progress').get()).toEqual({ n: 1 });
  });

  it('records applied migrations', async () => {
    const { sqlite } = await createTestDatabase();
    const applied = sqlite.prepare('select count(*) as n from __drizzle_migrations').get();
    expect(applied).toEqual({ n: migrations.journal.entries.length });
  });

  it('enforces foreign keys (attempts need an existing session)', async () => {
    const { sqlite } = await createTestDatabase();
    const insert = () =>
      sqlite
        .prepare(
          "insert into attempts (id, session_id, exercise_id, answer, result, duration_ms, answered_at) values ('a', 'missing', 'e', '1', '{}', 1, 'x')",
        )
        .run();
    expect(insert).toThrow(/FOREIGN KEY/);
  });
});
