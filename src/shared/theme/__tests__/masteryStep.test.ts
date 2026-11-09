import { masteryStep } from '../masteryStep';

describe('masteryStep', () => {
  it('returns 0 for a topic that was never started', () => {
    expect(masteryStep(null)).toBe(0);
  });

  it.each([
    [0, 1],
    [1, 1],
    [39, 1],
    [40, 2],
    [69, 2],
    [70, 3],
    [89, 3],
    [90, 4],
    [100, 4],
  ])('maps %p%% to step %p', (percent, step) => {
    expect(masteryStep(percent)).toBe(step);
  });

  it('rounds before choosing a step', () => {
    expect(masteryStep(39.4)).toBe(1);
    expect(masteryStep(39.5)).toBe(2);
  });

  it('clamps out-of-range values', () => {
    expect(masteryStep(-20)).toBe(1);
    expect(masteryStep(140)).toBe(4);
  });

  it('treats NaN as not started', () => {
    expect(masteryStep(Number.NaN)).toBe(0);
  });
});
