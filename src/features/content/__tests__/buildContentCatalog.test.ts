import { buildContentCatalog } from '../services/buildContentCatalog.service';
import { fakeExerciseTypes, rawCategory, rawPack, rawTopic, validPack } from './fixtures';

const build = (...packs: unknown[]) => buildContentCatalog(packs, fakeExerciseTypes);

describe('buildContentCatalog: valid content', () => {
  it('builds an indexed catalog with no issues', () => {
    const { catalog, issues } = build(validPack());
    expect(issues).toEqual([]);
    expect(catalog.packs).toEqual([
      { id: 'frontend', version: '1.0.0', schemaVersion: 1, title: { ro: 'Pachet frontend' } },
    ]);
    expect(catalog.categoriesById.size).toBe(2);
    expect(catalog.topicsById.size).toBe(3);
    expect(catalog.exercisesById.size).toBe(2);
  });

  it('sorts categories by order, topics by level and exercises by id', () => {
    const { catalog } = build(validPack());
    expect(catalog.categories.map(c => c.id)).toEqual(['nextjs', 'react']);
    expect(catalog.topicsByCategory.get('react')?.map(t => t.id)).toEqual([
      'react.basics',
      'react.hooks',
    ]);
    expect(catalog.exercisesByTopic.get('react.hooks')?.map(e => e.id)).toEqual([
      'react.hooks.q01',
      'react.hooks.q02',
    ]);
  });

  it('applies schema defaults (tags, resources, source, version)', () => {
    const { catalog } = build(validPack());
    expect(catalog.topicsById.get('react.basics')).toMatchObject({
      resources: [],
      tags: [],
      prerequisites: [],
    });
    expect(catalog.exercisesById.get('react.hooks.q01')).toMatchObject({
      source: 'pack',
      version: 1,
    });
  });

  it('merges several packs', () => {
    const backend = rawPack('backend', {
      categories: [rawCategory('nestjs')],
      topics: [rawTopic('nestjs.di', 'nestjs')],
    });
    const { catalog, issues } = build(validPack(), backend);
    expect(issues).toEqual([]);
    expect(catalog.packs.map(p => p.id)).toEqual(['frontend', 'backend']);
    expect(catalog.categoriesById.has('nestjs')).toBe(true);
  });

  it('returns an empty catalog for no packs', () => {
    const { catalog, issues } = build();
    expect(issues).toEqual([]);
    expect(catalog.categories).toEqual([]);
  });
});
