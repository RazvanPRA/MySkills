import { changeTopicNotes } from '../services/changeTopicNotes.service';

const now = new Date('2026-11-10T08:00:00.000Z');

describe('changeTopicNotes', () => {
  it('creates a not-started entry for a topic never touched', () => {
    expect(changeTopicNotes({ topicId: 't', notes: 'Idee', now })).toEqual({
      topicId: 't',
      status: 'not_started',
      notes: 'Idee',
      updatedAt: now.toISOString(),
    });
  });

  it('keeps status and studiedAt, and removes blank notes', () => {
    const previous = {
      topicId: 't',
      status: 'studied' as const,
      studiedAt: '2026-11-01T00:00:00.000Z',
      notes: 'Veche',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
    expect(changeTopicNotes({ topicId: 't', notes: '  ', previous, now })).toEqual({
      topicId: 't',
      status: 'studied',
      studiedAt: '2026-11-01T00:00:00.000Z',
      updatedAt: now.toISOString(),
    });
  });
});
