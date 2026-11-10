import { formatLongDate } from '../formatDate';

describe('formatLongDate', () => {
  it('formats a local day with weekday and month, capitalized', () => {
    expect(formatLongDate('2026-11-10', 'ro')).toBe('Marți, 10 noiembrie');
    // ICU versions differ on the comma after the weekday in en-GB.
    expect(formatLongDate('2026-11-10', 'en')).toMatch(/^Tuesday,? 10 November$/);
  });
});
