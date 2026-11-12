import { formatDuration } from '../duration';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [999, '0:00'],
    [65_000, '1:05'],
    [3_725_000, '62:05'],
    [-5, '0:00'],
    [Number.NaN, '0:00'],
  ])('%d ms → %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
