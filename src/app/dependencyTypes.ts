import type { DataFilePort, UserDataRepository } from '@/features/backup';
import type { ContentRepository, ExerciseTypeRegistry } from '@/features/content';
import type { NotificationPermission, ReminderScheduler } from '@/features/notifications';
import type { SessionRepository, TestRegistry } from '@/features/daily-tests';
import type { AttemptRepository } from '@/features/session-player';
import type { SettingsRepository } from '@/features/settings';
import type { ReviewCardRepository } from '@/features/spaced-repetition';
import type { TopicProgressRepository } from '@/features/study-map';
import type { Clock } from '@/shared/utils/clock';
import type { IdGenerator } from '@/shared/utils/idGenerator';

/**
 * The dependency container. Features declare the narrow slice they need
 * (e.g. SettingsDependencies); this type satisfies all of them structurally.
 */
export type AppDependencies = {
  clock: Clock;
  generateId: IdGenerator;
  /** Files the user picks (backup export / import). */
  files: DataFilePort;
  /** The daily local notification and the permission to post it. */
  reminders: ReminderScheduler;
  notificationPermission: NotificationPermission;
  storage: {
    /** Runs pending database migrations. Safe to call on every start. */
    prepare: () => Promise<void>;
  };
  /** Filled in src/app/registries.ts; thunks read them from here, the UI via providers. */
  registries: {
    exerciseTypes: ExerciseTypeRegistry;
    tests: TestRegistry;
  };
  repositories: {
    content: ContentRepository;
    topicProgress: TopicProgressRepository;
    reviewCards: ReviewCardRepository;
    sessions: SessionRepository;
    attempts: AttemptRepository;
    settings: SettingsRepository;
    userData: UserDataRepository;
  };
};
