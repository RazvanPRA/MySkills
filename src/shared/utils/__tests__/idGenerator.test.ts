import { createIdGenerator } from '../idGenerator';

describe('createIdGenerator', () => {
  it('is deterministic for fixed sources, with a time-sequence-entropy shape', () => {
    const sources = { now: () => 1_700_000_000_000, random: () => 0.5 };
    const id = createIdGenerator(sources)();
    expect(id).toBe(createIdGenerator(sources)());
    expect(id).toMatch(/^[0-9a-z]+-0001-[0-9a-z]{6,}$/);
  });

  it('never repeats within the same millisecond and random value', () => {
    const next = createIdGenerator({ now: () => 0, random: () => 0 });
    const ids = new Set(Array.from({ length: 1000 }, next));
    expect(ids.size).toBe(1000);
  });

  it('sorts by creation time across milliseconds', () => {
    let time = 1_700_000_000_000;
    const next = createIdGenerator({ now: () => time, random: () => 0.1 });
    const first = next();
    time += 5000;
    expect(next() > first).toBe(true);
  });
});
