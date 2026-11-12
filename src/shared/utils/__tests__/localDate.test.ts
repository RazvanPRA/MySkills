import { addDays, endOfLocalDayIso, parseLocalDate, startOfWeek, toLocalDate } from '../localDate';

describe('localDate', () => {
  it('formats the local calendar day, not the UTC one', () => {
    // 23:30 local time is still the 10th locally, whatever the machine's offset.
    expect(toLocalDate(new Date(2026, 10, 10, 23, 30))).toBe('2026-11-10');
    expect(toLocalDate(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
  });

  it('parses a day as local midnight', () => {
    const date = parseLocalDate('2026-03-29');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 2, 29, 0,
    ]);
  });

  it.each([
    ['2026-11-10', 1, '2026-11-11'],
    ['2026-11-30', 1, '2026-12-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-03-01', -1, '2026-02-28'],
    ['2028-03-01', -1, '2028-02-29'],
    ['2026-11-10', -14, '2026-10-27'],
    // Romania switches to summer time on 2026-03-29: still exactly one calendar day.
    ['2026-03-28', 1, '2026-03-29'],
    ['2026-03-29', 1, '2026-03-30'],
  ])('addDays(%s, %i) = %s', (day, amount, expected) => {
    expect(addDays(day, amount)).toBe(expected);
  });

  it('ends a day at the next local midnight', () => {
    expect(endOfLocalDayIso('2026-11-10')).toBe(new Date(2026, 10, 11).toISOString());
  });
});

describe('startOfWeek', () => {
  it.each([
    ['2026-11-09', '2026-11-09'], // Monday
    ['2026-11-10', '2026-11-09'], // Tuesday
    ['2026-11-15', '2026-11-09'], // Sunday belongs to the week that started on Monday
    ['2027-01-01', '2026-12-28'], // across the year boundary
  ])('startOfWeek(%s) = %s', (day, expected) => {
    expect(startOfWeek(day)).toBe(expected);
  });
});
