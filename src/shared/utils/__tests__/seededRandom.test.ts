import { createSeededRandom, hashString, shuffle, weightedOrder } from '../seededRandom';

const take = (random: () => number, count: number) => Array.from({ length: count }, random);

describe('hashString', () => {
  it('is stable and spreads similar inputs', () => {
    expect(hashString('2026-11-10:knowledge')).toBe(hashString('2026-11-10:knowledge'));
    expect(hashString('2026-11-10:knowledge')).not.toBe(hashString('2026-11-11:knowledge'));
    expect(hashString('2026-11-10:knowledge')).not.toBe(hashString('2026-11-10:logic'));
  });

  it('returns an unsigned 32-bit integer, also for the empty string', () => {
    for (const value of ['', 'a', 'ăîșț', 'x'.repeat(1000)]) {
      const hash = hashString(value);
      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(2 ** 32);
    }
  });
});

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    expect(take(createSeededRandom(42), 20)).toEqual(take(createSeededRandom(42), 20));
    expect(take(createSeededRandom(42), 5)).not.toEqual(take(createSeededRandom(43), 5));
  });

  it('stays in [0, 1) and is roughly uniform', () => {
    const values = take(createSeededRandom(7), 10_000);
    expect(values.every(value => value >= 0 && value < 1)).toBe(true);
    const buckets = [0, 0, 0, 0];
    values.forEach(value => (buckets[Math.floor(value * 4)] as number)++);
    buckets.forEach(count => expect(count).toBeGreaterThan(2_200));
  });
});

describe('shuffle', () => {
  it('returns a deterministic permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input, createSeededRandom(1));
    expect([...result].sort((a, b) => a - b)).toEqual(input);
    expect(result).toEqual(shuffle(input, createSeededRandom(1)));
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('handles empty and single-item lists', () => {
    expect(shuffle([], createSeededRandom(1))).toEqual([]);
    expect(shuffle(['a'], createSeededRandom(1))).toEqual(['a']);
  });
});

describe('weightedOrder', () => {
  it('puts heavier items first more often', () => {
    const random = createSeededRandom(3);
    let heavyFirst = 0;
    for (let run = 0; run < 1_000; run += 1) {
      const [first] = weightedOrder(['light', 'heavy'], item => (item === 'heavy' ? 4 : 1), random);
      heavyFirst += first === 'heavy' ? 1 : 0;
    }
    // P(heavy first) = 4 / (4 + 1) = 0.8.
    expect(heavyFirst).toBeGreaterThan(740);
    expect(heavyFirst).toBeLessThan(860);
  });

  it('keeps zero-weight items, last and in their original order', () => {
    const result = weightedOrder(
      ['z1', 'a', 'z2', 'b'],
      item => (item.startsWith('z') ? 0 : 1),
      createSeededRandom(9),
    );
    expect(result.slice(2)).toEqual(['z1', 'z2']);
    expect(result.slice(0, 2).sort()).toEqual(['a', 'b']);
  });
});
