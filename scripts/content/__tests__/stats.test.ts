import { z } from 'zod';
import { buildContentCatalog } from '@/features/content';
import { computeStats, renderStats } from '../stats';

const exercise = (id: string, level: string, type: string) => ({
  id,
  type,
  topicId: id.startsWith('logic') ? 'logic.tracing' : 'react.hooks',
  level,
  difficulty: 3,
  estimatedSeconds: 60,
  prompt: { ro: 'Î?' },
  payload: {},
  explanation: { ro: 'E.' },
});

const pack = {
  id: 'demo',
  version: '1.0.0',
  schemaVersion: 1,
  title: { ro: 'Demo' },
  categories: [
    { id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 1 },
    { id: 'logic', title: { ro: 'Logică' }, testKinds: ['logic'], order: 2 },
  ],
  topics: [
    {
      id: 'react.hooks',
      categoryId: 'react',
      title: { ro: 'H' },
      level: 'mid',
      summary: { ro: 's' },
    },
    {
      id: 'logic.tracing',
      categoryId: 'logic',
      title: { ro: 'T' },
      level: 'mid',
      summary: { ro: 's' },
    },
  ],
  exercises: [
    exercise('react.q1', 'mid', 'single_choice'),
    exercise('react.q2', 'senior', 'single_choice'),
    exercise('react.q3', 'senior', 'flashcard_self_graded'),
    exercise('logic.q1', 'junior', 'code_output'),
  ],
};

const anyType = { get: () => ({ payloadSchema: z.unknown() }) };

describe('computeStats', () => {
  const stats = computeStats(buildContentCatalog([pack], anyType).catalog);

  it('counts exercises per category, level and type', () => {
    expect(stats[0]).toEqual({
      categoryId: 'react',
      topics: 1,
      byLevel: { junior: 0, mid: 1, senior: 2 },
      byType: { single_choice: 2, flashcard_self_graded: 1 },
      total: 3,
      target: 15,
    });
  });

  it('uses the higher target for logic categories', () => {
    expect(stats[1]).toMatchObject({ categoryId: 'logic', total: 1, target: 60 });
  });

  it('renders a table that flags categories below target', () => {
    const table = renderStats(stats);
    expect(table).toContain('✖<15');
    expect(table).toContain('2 of 2 categories below target');
  });
});
