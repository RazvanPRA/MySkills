import type { AttemptRepository } from '@/features/session-player';
import type { ReviewCardRepository } from '@/features/spaced-repetition';
import type { TopicProgressRepository } from '@/features/study-map';
import type { Clock } from '@/shared/utils/clock';
import type { IdGenerator } from '@/shared/utils/idGenerator';
import type { SessionRepository } from '../repository/SessionRepository';
import type { TestRegistry } from '../services/testRegistry';

/** What this feature needs from the dependency container. */
export type DailyTestsDependencies = {
  clock: Clock;
  generateId: IdGenerator;
  registries: { tests: TestRegistry };
  repositories: {
    sessions: SessionRepository;
    attempts: AttemptRepository;
    topicProgress: TopicProgressRepository;
    reviewCards: ReviewCardRepository;
  };
};
