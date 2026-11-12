import { formatTime, parseTime, shiftTime } from '../services/reminderTime.service';

describe('reminder time', () => {
  it.each([
    ['07:30', { hour: 7, minute: 30 }],
    ['00:00', { hour: 0, minute: 0 }],
    ['23:59', { hour: 23, minute: 59 }],
    ['24:00', null],
    ['7:30', null],
    ['ab:cd', null],
  ])('parseTime(%s)', (text, time) => {
    expect(parseTime(text)).toEqual(time);
  });

  it('formats with leading zeros', () => {
    expect(formatTime({ hour: 7, minute: 5 })).toBe('07:05');
  });

  it.each([
    ['20:00', 15, '20:15'],
    ['20:00', -15, '19:45'],
    ['23:45', 15, '00:00'],
    ['00:00', -15, '23:45'],
    ['bad', 15, 'bad'],
  ])('shiftTime(%s, %i) = %s', (text, minutes, expected) => {
    expect(shiftTime(text, minutes)).toBe(expected);
  });
});
