import type { TopicProgress, TopicStatus } from '../model/topicProgress';

type StatusChange = {
  topicId: string;
  status: TopicStatus;
  /** The stored progress, if the topic was touched before. */
  previous?: TopicProgress;
  now: Date;
};

/**
 * Pure: the progress after a status change. Notes are kept; `studiedAt` records when the
 * topic was first marked studied and is cleared if it goes back to an earlier status.
 */
export function changeTopicStatus({ topicId, status, previous, now }: StatusChange): TopicProgress {
  const studiedAt = status === 'studied' ? previous?.studiedAt ?? now.toISOString() : undefined;
  return {
    topicId,
    status,
    updatedAt: now.toISOString(),
    ...(studiedAt ? { studiedAt } : {}),
    ...(previous?.notes ? { notes: previous.notes } : {}),
  };
}
