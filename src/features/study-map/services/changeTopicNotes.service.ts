import type { TopicProgress } from '../model/topicProgress';

type NotesChange = {
  topicId: string;
  notes: string;
  previous?: TopicProgress;
  now: Date;
};

/**
 * Pure: the progress after editing the notes. Status and `studiedAt` are kept; a topic never
 * touched stays "not started". Blank notes are removed.
 */
export function changeTopicNotes({ topicId, notes, previous, now }: NotesChange): TopicProgress {
  return {
    topicId,
    status: previous?.status ?? 'not_started',
    updatedAt: now.toISOString(),
    ...(previous?.studiedAt ? { studiedAt: previous.studiedAt } : {}),
    ...(notes.trim() ? { notes } : {}),
  };
}
