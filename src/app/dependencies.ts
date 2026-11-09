import { type Clock, systemClock } from '@/shared/utils/clock';

/**
 * The dependency container: the only place where concrete implementations
 * (clock, repositories, later Remote* repositories) are chosen.
 * Features declare the narrow dependency types they need; this type satisfies all of them.
 */
export type AppDependencies = {
  clock: Clock;
};

export function createDependencies(): AppDependencies {
  return {
    clock: systemClock,
  };
}
