import { buildHeatmap } from '../services/buildHeatmap.service';
import { estimateCategoryLevel } from '../services/estimateCategoryLevel.service';
import { masteryByTopic } from '../services/masteryByTopic.service';
import { calculateTopicMastery } from '../services/topicMastery.service';
import { catalog, fact, NOW } from './fixtures';

const mastery = (attempts: ReturnType<typeof fact>[], stabilities: number[] = []) =>
  calculateTopicMastery({ attempts, stabilities, now: NOW });

describe('calculateTopicMastery', () => {
  it('is null for a topic never attempted', () => {
    expect(mastery([])).toBeNull();
  });

  it('needs repeated evidence: 1 correct answer → 50, 3 → 75', () => {
    expect(mastery([fact('x')])).toBe(50);
    expect(mastery([fact('x'), fact('x'), fact('x')])).toBe(75);
  });

  it('counts partial credit and wrong answers', () => {
    expect(mastery([fact('x', { score: 0.5 }), fact('x', { score: 0 })])).toBe(17);
  });

  it('decays old attempts: an old mistake weighs less than a fresh one', () => {
    const freshMistake = mastery([fact('x', { score: 0 }), fact('x')]);
    const oldMistake = mastery([fact('x', { score: 0, daysAgo: 60 }), fact('x')]);
    expect(freshMistake).toBe(33);
    expect(oldMistake).toBe(44);
  });

  it('combines FSRS stability when the topic has review cards', () => {
    const attempts = [fact('x'), fact('x'), fact('x')];
    // 0.7 × 75% + 0.3 × (21 / (21 + 21))
    expect(mastery(attempts, [21])).toBe(68);
    expect(mastery(attempts, [210])).toBeGreaterThan(mastery(attempts, [2]) ?? 0);
  });

  it('treats answers dated after "now" (clock changes) as fresh', () => {
    expect(mastery([fact('x', { daysAgo: -3 })])).toBe(50);
  });
});

describe('masteryByTopic', () => {
  it('groups attempts and cards by topic and skips unknown exercises', () => {
    const result = masteryByTopic({
      catalog,
      attempts: [fact('react.a.junior.q1'), fact('react.a.junior.q2'), fact('gone.q1')],
      cards: [{ exerciseId: 'react.a.junior.q1', stability: 21 }],
      now: NOW,
    });
    // 0.7 × (2/3) + 0.3 × 0.5
    expect([...result]).toEqual([['react.a.junior', 62]]);
  });
});

describe('estimateCategoryLevel', () => {
  const t = (level: 'junior' | 'mid' | 'senior', value: number | null) => ({
    level,
    mastery: value,
  });

  it('is null without topics or when Junior is not reached', () => {
    expect(estimateCategoryLevel([])).toBeNull();
    expect(estimateCategoryLevel([t('junior', 90), t('junior', 40)])).toBeNull();
  });

  it('reaches a level with ≥70% mastery on ≥80% of the topics at that level and below', () => {
    const topics = [
      ...Array.from({ length: 4 }, () => t('junior', 80)),
      t('junior', 20),
      ...Array.from({ length: 4 }, () => t('mid', 75)),
      t('mid', null),
      t('senior', 95),
    ];
    // Junior: 4/5. Mid: 8/10. Senior: 9/11 ≈ 0.82, also enough.
    expect(estimateCategoryLevel(topics)).toBe('senior');
    expect(estimateCategoryLevel([...topics, t('senior', 10)])).toBe('mid');
  });

  it('never claims a level the category has no topics for', () => {
    expect(estimateCategoryLevel([t('junior', 90), t('mid', 90)])).toBe('mid');
  });

  it('follows a configured rule', () => {
    const topics = [t('junior', 65), t('junior', 65)];
    expect(estimateCategoryLevel(topics)).toBeNull();
    expect(estimateCategoryLevel(topics, { masteryThreshold: 60, coverage: 1 })).toBe('junior');
  });
});

describe('buildHeatmap', () => {
  it('builds categories × levels, counting only topics that have exercises', () => {
    const rows = buildHeatmap(
      catalog,
      new Map([
        ['react.a.junior', 90],
        ['react.b.junior', 70],
        ['react.c.mid', 40],
      ]),
    );
    expect(rows.map(row => row.categoryId)).toEqual(['react', 'logic']);
    const [react, logic] = rows;
    expect(react?.cells).toEqual([
      { level: 'junior', topicCount: 2, mastery: 80 },
      // react.e.mid has no exercises: it does not count.
      { level: 'mid', topicCount: 1, mastery: 40 },
      { level: 'senior', topicCount: 1, mastery: null },
    ]);
    expect(react?.estimatedLevel).toBe('junior');
    expect(logic?.cells[0]).toEqual({ level: 'junior', topicCount: 1, mastery: null });
    expect(logic?.cells[1]).toEqual({ level: 'mid', topicCount: 0, mastery: null });
    expect(logic?.estimatedLevel).toBeNull();
  });

  it('averages unattempted topics as 0 once one topic of the level was attempted', () => {
    const [react] = buildHeatmap(catalog, new Map([['react.a.junior', 90]]));
    expect(react?.cells[0]?.mastery).toBe(45);
  });
});
