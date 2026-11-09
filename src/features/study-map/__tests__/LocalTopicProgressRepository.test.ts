import { createTestDatabase } from '@/db/testing/createTestDatabase';
import { isCovered, type TopicProgress } from '../model/topicProgress';
import { createLocalTopicProgressRepository } from '../repository/LocalTopicProgressRepository';

const progress = (extra: Partial<TopicProgress> = {}): TopicProgress => ({
  topicId: 'react.hooks',
  status: 'in_progress',
  updatedAt: '2026-11-09T10:00:00.000Z',
  ...extra,
});

async function setup() {
  const { db, sqlite } = await createTestDatabase();
  const onInvalid = jest.fn();
  return { repo: createLocalTopicProgressRepository(db, onInvalid), sqlite, onInvalid };
}

describe('LocalTopicProgressRepository', () => {
  it('returns null and an empty list before anything is saved', async () => {
    const { repo } = await setup();
    expect(await repo.get('react.hooks')).toBeNull();
    expect(await repo.getAll()).toEqual([]);
  });

  it('saves and reads back progress, mapping NULLs to missing fields', async () => {
    const { repo } = await setup();
    await repo.save(progress());
    expect(await repo.get('react.hooks')).toEqual(progress());
  });

  it('updates an existing topic instead of duplicating it', async () => {
    const { repo } = await setup();
    await repo.save(progress());
    const studied = progress({
      status: 'studied',
      studiedAt: '2026-11-10T09:00:00.000Z',
      notes: 'Cleanup rulează înainte de următorul efect.',
      updatedAt: '2026-11-10T09:00:00.000Z',
    });
    await repo.save(studied);
    expect(await repo.getAll()).toEqual([studied]);
  });

  it('skips and reports corrupted rows instead of failing', async () => {
    const { repo, sqlite, onInvalid } = await setup();
    await repo.save(progress({ topicId: 'react.state' }));
    sqlite
      .prepare(
        "insert into topic_progress (topic_id, status, updated_at) values ('react.hooks', 'bogus', 'x')",
      )
      .run();
    expect((await repo.getAll()).map(p => p.topicId)).toEqual(['react.state']);
    expect(onInvalid).toHaveBeenCalledWith('topic_progress', expect.anything(), expect.anything());
  });
});

describe('isCovered', () => {
  it.each([
    ['not_started', false],
    ['in_progress', true],
    ['studied', true],
  ] as const)('%s → %p', (status, covered) => {
    expect(isCovered({ status })).toBe(covered);
  });
});
