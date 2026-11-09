import { createTestDatabase } from '@/db/testing/createTestDatabase';
import type { ReviewCard } from '../model/reviewCard';
import { createLocalReviewCardRepository } from '../repository/LocalReviewCardRepository';

const card = (exerciseId: string, due: string, extra: Partial<ReviewCard> = {}): ReviewCard => ({
  exerciseId,
  due,
  stability: 2.5,
  difficulty: 5.1,
  scheduledDays: 3,
  learningSteps: 0,
  reps: 2,
  lapses: 0,
  state: 'review',
  ...extra,
});

async function setup() {
  const { db } = await createTestDatabase();
  return createLocalReviewCardRepository(db);
}

describe('LocalReviewCardRepository', () => {
  it('round-trips a card without losing FSRS fields', async () => {
    const repo = await setup();
    const saved = card('react.q1', '2026-11-10T08:00:00.000Z', {
      lastReview: '2026-11-07T08:00:00.000Z',
      stability: 12.345678,
    });
    await repo.save(saved);
    expect(await repo.get('react.q1')).toEqual(saved);
  });

  it('returns null for an exercise without a card (a new exercise)', async () => {
    expect(await (await setup()).get('nope')).toBeNull();
  });

  it('lists due cards, most overdue first, excluding future ones', async () => {
    const repo = await setup();
    await repo.save(card('later', '2026-11-12T08:00:00.000Z'));
    await repo.save(card('today', '2026-11-10T07:00:00.000Z'));
    await repo.save(card('overdue', '2026-11-01T07:00:00.000Z'));
    const due = await repo.getDue('2026-11-10T23:59:59.999Z');
    expect(due.map(c => c.exerciseId)).toEqual(['overdue', 'today']);
  });

  it('updates an existing card after a review', async () => {
    const repo = await setup();
    await repo.save(card('react.q1', '2026-11-10T08:00:00.000Z'));
    const reviewed = card('react.q1', '2026-11-20T08:00:00.000Z', { reps: 3, scheduledDays: 10 });
    await repo.save(reviewed);
    expect(await repo.getAll()).toEqual([reviewed]);
  });
});
