import type { TestDefinition } from '../model/testDefinition';
import { createTestRegistry, testsWithSchedule } from '../services/testRegistry';

const definition = (kind: string, schedule: TestDefinition['schedule']): TestDefinition => ({
  kind,
  title: { ro: kind },
  schedule,
  spacedRepetition: false,
  buildSession: () => ({ exerciseIds: [] }),
});

describe('TestRegistry', () => {
  it('starts empty: test types are registered only in src/app/registries.ts', () => {
    expect(createTestRegistry().list()).toEqual([]);
  });

  it('indexes definitions by kind and rejects duplicates', () => {
    const registry = createTestRegistry();
    registry.register(definition('logic', 'daily'));
    expect(registry.require('logic').schedule).toBe('daily');
    expect(() => registry.register(definition('logic', 'weekly'))).toThrow('already registered');
  });

  it('lists the daily tests (one Today card each), in registration order', () => {
    const registry = createTestRegistry();
    registry.register(definition('logic', 'daily'));
    registry.register(definition('system-design', 'weekly'));
    registry.register(definition('knowledge', 'daily'));
    expect(testsWithSchedule(registry, 'daily').map(t => t.kind)).toEqual(['logic', 'knowledge']);
  });
});
