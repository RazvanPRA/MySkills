import type { TimeOfDay } from '../model/reminder';

const MINUTES_PER_DAY = 24 * 60;
const pad = (value: number) => String(value).padStart(2, '0');

/** "07:30" → { hour: 7, minute: 30 }; null for anything that is not a valid HH:MM. */
export function parseTime(text: string): TimeOfDay | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

export const formatTime = ({ hour, minute }: TimeOfDay): string => `${pad(hour)}:${pad(minute)}`;

/** Moves an "HH:MM" by `minutes`, wrapping around midnight. Invalid input stays unchanged. */
export function shiftTime(text: string, minutes: number): string {
  const time = parseTime(text);
  if (!time) {
    return text;
  }
  const total = (time.hour * 60 + time.minute + minutes) % MINUTES_PER_DAY;
  const wrapped = (total + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return formatTime({ hour: Math.floor(wrapped / 60), minute: wrapped % 60 });
}
