import { type ContentMigration, migrateContentPack } from '../services/migrateContentPack.service';

const v1Pack = { id: 'demo', schemaVersion: 1, title: { ro: 'Demo' } };

describe('migrateContentPack', () => {
  it('returns a current pack unchanged', () => {
    const result = migrateContentPack(v1Pack);
    expect(result).toEqual({ ok: true, pack: v1Pack, from: 1 });
  });

  it('applies every migration in order up to the target version', () => {
    // Simulated future schema: v2 renames `title` to `name`, v3 adds `tags`.
    const migrations: Record<number, ContentMigration> = {
      1: ({ title, ...rest }) => ({ ...rest, name: title }),
      2: pack => ({ ...pack, tags: [] }),
    };
    const result = migrateContentPack(v1Pack, { targetVersion: 3, migrations });
    expect(result).toEqual({
      ok: true,
      from: 1,
      pack: { id: 'demo', schemaVersion: 3, name: { ro: 'Demo' }, tags: [] },
    });
  });

  it('does not mutate the input pack', () => {
    const input = { ...v1Pack };
    migrateContentPack(input, { targetVersion: 2, migrations: { 1: p => ({ ...p, x: 1 }) } });
    expect(input).toEqual(v1Pack);
  });

  it('fails when a migration step is missing', () => {
    const result = migrateContentPack(v1Pack, { targetVersion: 3, migrations: { 1: p => p } });
    expect(result).toMatchObject({ ok: false, reason: 'missing_migration' });
  });

  it('refuses packs newer than the app supports', () => {
    const result = migrateContentPack({ ...v1Pack, schemaVersion: 2 });
    expect(result).toMatchObject({ ok: false, reason: 'newer_than_supported' });
  });

  it.each([null, 'pack', [1, 2], 42])('rejects a non-object (%p)', raw => {
    expect(migrateContentPack(raw)).toMatchObject({ ok: false, reason: 'not_an_object' });
  });

  it.each([undefined, 0, 1.5, '1'])('rejects schemaVersion %p', schemaVersion => {
    expect(migrateContentPack({ id: 'x', schemaVersion })).toMatchObject({
      ok: false,
      reason: 'missing_schema_version',
    });
  });
});
