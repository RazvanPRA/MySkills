import type { Topic } from '@/features/content';
import { buildContentCatalog } from '@/features/content';
import { groupStudyTopics, normalizeSearch } from '../services/filterTopics.service';
import { hostOf } from '../services/hostOf';

const topic = (id: string, level: Topic['level']): Topic => ({
  id,
  categoryId: 'react',
  title: { ro: id },
  level,
  summary: { ro: '.' },
  resources: [],
  tags: [],
  prerequisites: [],
});

describe('groupStudyTopics', () => {
  const catalog = buildContentCatalog(
    [
      {
        id: 'p',
        version: '1.0.0',
        schemaVersion: 1,
        title: { ro: 'P' },
        categories: [
          { id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 0 },
          { id: 'go', title: { ro: 'Go' }, testKinds: ['knowledge'], order: 1 },
        ],
        topics: [
          topic('react.b', 'senior'),
          topic('react.a', 'junior'),
          { ...topic('react.c', 'senior'), title: { ro: 'Acțiuni server' }, tags: ['rsc'] },
          { ...topic('go.a', 'mid'), categoryId: 'go', title: { ro: 'Goroutine și acțiuni' } },
        ],
        exercises: [],
      },
    ],
    { get: () => undefined } as never,
  ).catalog;
  const group = (overrides: Partial<Parameters<typeof groupStudyTopics>[0]> = {}) =>
    groupStudyTopics({
      catalog,
      categoryId: 'react',
      levels: ['junior', 'mid', 'senior'],
      query: '',
      language: 'ro',
      ...overrides,
    }).map(g => [g.key, g.topics.map(t => t.id)]);

  it('browses a category Junior → Mid → Senior, skipping empty levels', () => {
    expect(group()).toEqual([
      ['junior', ['react.a']],
      ['senior', ['react.b', 'react.c']],
    ]);
  });

  it('applies the level filter', () => {
    expect(group({ levels: ['senior'] })).toEqual([['senior', ['react.b', 'react.c']]]);
    expect(group({ levels: [] })).toEqual([]);
    expect(group({ categoryId: null })).toEqual([]);
  });

  it('searches every category by title and tags, ignoring case and diacritics', () => {
    expect(group({ query: 'ACTIUNI' })).toEqual([
      ['react', ['react.c']],
      ['go', ['go.a']],
    ]);
    expect(group({ query: 'rsc' })).toEqual([['react', ['react.c']]]);
    expect(group({ query: 'actiuni goroutine' })).toEqual([['go', ['go.a']]]);
    expect(group({ query: 'actiuni', levels: ['mid'] })).toEqual([['go', ['go.a']]]);
    expect(group({ query: 'nimic' })).toEqual([]);
  });

  it('normalizeSearch lowercases and strips diacritics', () => {
    expect(normalizeSearch('  Ștergere ȚINTĂ ')).toBe('stergere tinta');
  });
});

describe('hostOf', () => {
  it.each([
    ['https://react.dev/learn', 'react.dev'],
    ['https://www.postgresql.org/docs/current/', 'postgresql.org'],
    ['http://localhost:8081/x', 'localhost'],
    ['not a url', 'not a url'],
  ])('%s → %s', (url, host) => {
    expect(hostOf(url)).toBe(host);
  });
});
