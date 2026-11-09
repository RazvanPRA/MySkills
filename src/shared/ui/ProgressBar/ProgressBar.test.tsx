import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { ProgressBar } from './ProgressBar';
import { toPercent } from './toPercent';

describe('ProgressBar', () => {
  it('exposes the progressbar role with a 0–100 value', async () => {
    await renderWithTheme(<ProgressBar progress={0.3} accessibilityLabel="Progres test" />);
    const bar = screen.getByRole('progressbar', { name: 'Progres test' });
    expect(bar).toHaveAccessibilityValue({ min: 0, max: 100, now: 30 });
  });

  it('clamps progress outside 0..1', async () => {
    await renderWithTheme(<ProgressBar progress={1.7} accessibilityLabel="P" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 100 });
  });
});

describe('toPercent', () => {
  it.each([
    [0, 0],
    [0.5, 50],
    [0.333, 33],
    [1, 100],
    [-0.2, 0],
    [2, 100],
    [Number.NaN, 0],
  ])('%p → %p%%', (progress, percent) => {
    expect(toPercent(progress)).toBe(percent);
  });
});
