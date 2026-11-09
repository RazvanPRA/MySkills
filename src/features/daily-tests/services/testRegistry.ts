import { createRegistry, type Registry } from '@/shared/registry';
import type { TestDefinition, TestSchedule } from '../model/testDefinition';

export type TestRegistry = Registry<TestDefinition>;

export const createTestRegistry = (): TestRegistry =>
  createRegistry<TestDefinition>('TestRegistry', definition => definition.kind);

/** Tests with the given schedule, in registration order (e.g. the cards on Today). */
export const testsWithSchedule = (
  registry: TestRegistry,
  schedule: TestSchedule,
): TestDefinition[] => registry.list().filter(definition => definition.schedule === schedule);
