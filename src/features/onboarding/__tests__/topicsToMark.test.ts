import { buildContentCatalog } from '@/features/content';
import { assessableCategories, topicsToMark } from '../services/topicsToMark.service';

const text = (ro: string) => ({ ro });
const topic = (id: string, categoryId: string, level: string) => ({
  id,
  categoryId,
  level,
  title: text(id),
  summary: text('.'),
});

const { catalog } = buildContentCatalog(
  [
    {
      id: 'p',
      version: '1.0.0',
      schemaVersion: 1,
      title: text('P'),
      categories: [
        { id: 'react', title: text('React'), testKinds: ['knowledge'], order: 0 },
        { id: 'go', title: text('Go'), testKinds: ['knowledge'], order: 1 },
        { id: 'logic', title: text('Logică'), testKinds: ['logic'], order: 2 },
      ],
      topics: [
        topic('react.a', 'react', 'junior'),
        topic('react.b', 'react', 'mid'),
        topic('react.c', 'react', 'senior'),
        topic('go.a', 'go', 'junior'),
        topic('logic.a', 'logic', 'junior'),
      ],
      exercises: [],
    },
  ],
  { get: () => undefined } as never,
);

describe('onboarding self-assessment', () => {
  it('offers only categories that feed the knowledge test', () => {
    expect(assessableCategories(catalog).map(c => c.id)).toEqual(['react', 'go']);
  });

  it('marks topics up to the chosen level', () => {
    expect(topicsToMark(catalog, { react: 'mid' })).toEqual(['react.a', 'react.b']);
    expect(topicsToMark(catalog, { react: 'senior', go: 'junior' })).toEqual([
      'react.a',
      'react.b',
      'react.c',
      'go.a',
    ]);
  });

  it('marks nothing for "none", for unknown categories or for logic', () => {
    expect(topicsToMark(catalog, {})).toEqual([]);
    expect(topicsToMark(catalog, { react: 'none', gone: 'senior', logic: 'senior' })).toEqual([]);
  });
});
