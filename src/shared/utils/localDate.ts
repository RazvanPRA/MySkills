/** Calendar days ("YYYY-MM-DD") in the device's local time zone (brief §7.3). */

const pad = (value: number) => String(value).padStart(2, '0');

/** The local calendar day of an instant. */
export const toLocalDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Local midnight at the start of a "YYYY-MM-DD" day. */
export function parseLocalDate(day: string): Date {
  const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/** "2026-11-10" + 1 → "2026-11-11". Works across month, year and DST changes. */
export function addDays(day: string, amount: number): string {
  const date = parseLocalDate(day);
  date.setDate(date.getDate() + amount);
  return toLocalDate(date);
}

/** The first instant after `day` ends (local), as ISO. Cards due before it are due "today". */
export const endOfLocalDayIso = (day: string): string =>
  parseLocalDate(addDays(day, 1)).toISOString();

/** The Monday of the week containing `day` (weeks start on Monday, as in Romania). */
export function startOfWeek(day: string): string {
  const offset = (parseLocalDate(day).getDay() + 6) % 7;
  return addDays(day, -offset);
}
