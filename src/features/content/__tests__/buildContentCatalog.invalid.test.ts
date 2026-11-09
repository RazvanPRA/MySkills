import { buildContentCatalog } from '../services/buildContentCatalog.service';
import {
  fakeExerciseTypes,
  rawCategory,
  rawExercise,
  rawPack,
  rawTopic,
  validPack,
} from './fixtures';

// Each test breaks one rule and checks that only the offending entity is affected.

const build = (...packs: unknown[]) => buildContentCatalog(packs, fakeExerciseTypes);

const withPack = (extra: Record<string, unknown>) =>
  rawPack('p', {
    categories: [rawCategory('react')],
    topics: [rawTopic('react.hooks', 'react')],
    ...extra,
  });

describe('buildContentCatalog: invalid packs', () => {
  it('excludes a pack that is not a valid envelope, keeping the others', () => {
    const { catalog, issues } = build({ id: 'broken', schemaVersion: 1 }, validPack());
    expect(catalog.packs.map(p => p.id)).toEqual(['frontend']);
    expect(issues).toEqual([
      expect.objectContaining({ code: 'invalid_pack', packId: 'broken', excluded: true }),
    ]);
  });

  it('reports packs from a newer schema version', () => {
    const { issues } = build({ ...validPack(), schemaVersion: 99 });
    expect(issues[0]).toMatchObject({ code: 'unsupported_schema_version', packId: 'frontend' });
  });

  it('names packs without an id by position', () => {
    const { issues } = build('not a pack');
    expect(issues[0]).toMatchObject({ code: 'invalid_pack', packId: 'pack#0' });
  });

  it('excludes a duplicate pack id', () => {
    const { catalog, issues } = build(validPack(), validPack());
    expect(catalog.packs).toHaveLength(1);
    expect(issues.map(i => i.code)).toContain('duplicate_id');
  });
});

describe('buildContentCatalog: invalid entities', () => {
  it('excludes one invalid exercise and keeps the rest of the pack', () => {
    const pack = withPack({
      exercises: [
        rawExercise('ok', 'react.hooks'),
        rawExercise('bad', 'react.hooks', { difficulty: 9 }),
      ],
    });
    const { catalog, issues } = build(pack);
    expect([...catalog.exercisesById.keys()]).toEqual(['ok']);
    expect(issues).toEqual([
      expect.objectContaining({ code: 'invalid_exercise', entityId: 'bad', excluded: true }),
    ]);
    expect(issues[0]?.message).toContain('difficulty');
  });

  it('reports duplicate ids across packs and keeps the first', () => {
    const second = rawPack('other', { categories: [rawCategory('react', { order: 9 })] });
    const { catalog, issues } = build(withPack({}), second);
    expect(catalog.categoriesById.get('react')?.order).toBe(1);
    expect(issues[0]).toMatchObject({ code: 'duplicate_id', packId: 'other', entityId: 'react' });
  });

  it('excludes topics with an unknown category, and their exercises', () => {
    const pack = withPack({
      topics: [rawTopic('go.channels', 'go')],
      exercises: [rawExercise('go.q1', 'go.channels')],
    });
    const { catalog, issues } = build(pack);
    expect(catalog.topicsById.size).toBe(0);
    expect(issues.map(i => i.code)).toEqual(['unknown_category', 'unknown_topic']);
  });

  it('strips unknown prerequisites but keeps the topic', () => {
    const pack = withPack({
      topics: [rawTopic('react.hooks', 'react', { prerequisites: ['nope'] })],
    });
    const { catalog, issues } = build(pack);
    expect(catalog.topicsById.get('react.hooks')?.prerequisites).toEqual([]);
    expect(issues[0]).toMatchObject({ code: 'unknown_prerequisite', excluded: false });
  });

  it('reports prerequisite cycles', () => {
    const pack = withPack({
      topics: [
        rawTopic('react.a', 'react', { prerequisites: ['react.b'] }),
        rawTopic('react.b', 'react', { prerequisites: ['react.a'] }),
      ],
    });
    const { issues } = build(pack);
    expect(issues).toEqual([
      expect.objectContaining({ code: 'prerequisite_cycle', excluded: false }),
    ]);
    expect(issues[0]?.message).toContain('react.a → react.b → react.a');
  });

  it('excludes exercises of an unregistered type', () => {
    const pack = withPack({ exercises: [rawExercise('q', 'react.hooks', { type: 'sql_query' })] });
    expect(build(pack).issues[0]).toMatchObject({ code: 'unknown_exercise_type', entityId: 'q' });
  });

  it('excludes exercises whose payload fails the type schema', () => {
    const pack = withPack({
      exercises: [
        rawExercise('q', 'react.hooks', { payload: { options: ['only one'], correct: 0 } }),
      ],
    });
    const { catalog, issues } = build(pack);
    expect(catalog.exercisesById.size).toBe(0);
    expect(issues[0]).toMatchObject({ code: 'invalid_payload', entityId: 'q' });
  });

  it('flags cedilla diacritics anywhere in an entity, without excluding it', () => {
    const pack = withPack({
      exercises: [rawExercise('q', 'react.hooks', { explanation: { ro: 'Aşa se face.' } })],
    });
    const { catalog, issues } = build(pack);
    expect(catalog.exercisesById.has('q')).toBe(true);
    expect(issues).toEqual([
      expect.objectContaining({ code: 'cedilla_diacritics', entityId: 'q', excluded: false }),
    ]);
  });
});
