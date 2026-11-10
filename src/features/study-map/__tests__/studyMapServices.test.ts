import type { Topic } from '@/features/content';
import { groupTopicsByLevel } from '../services/groupTopicsByLevel.service';
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

describe('groupTopicsByLevel', () => {
  it('groups Junior → Mid → Senior, keeping order and skipping empty levels', () => {
    const groups = groupTopicsByLevel([
      topic('b', 'senior'),
      topic('a', 'junior'),
      topic('c', 'senior'),
    ]);
    expect(groups.map(group => [group.level, group.topics.map(t => t.id)])).toEqual([
      ['junior', ['a']],
      ['senior', ['b', 'c']],
    ]);
  });

  it('returns nothing for no topics', () => {
    expect(groupTopicsByLevel([])).toEqual([]);
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
