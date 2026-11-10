import { strings } from '@/shared/i18n';
import { presentTodayStats, type TodayStatsInput } from '../services/presentTodayStats';
import { catalog } from './fixtures';

const input = (overrides: Partial<TodayStatsInput> = {}): TodayStatsInput => ({
  streak: { days: 5, frozenDays: [], todayDone: true },
  week: { accuracy: 78, count: 23 },
  suggestion: null,
  mastery: new Map(),
  catalog,
  strings: strings.ro,
  language: 'ro',
  ...overrides,
});

describe('presentTodayStats', () => {
  it('writes the streak and accuracy as text', () => {
    expect(presentTodayStats(input()).tiles).toEqual([
      { key: 'streak', label: 'Serie', value: '5 zile', caption: 'Testele de azi sunt gata.' },
      { key: 'accuracy', label: 'Acuratețe 7 zile', value: '78%', caption: '23 de răspunsuri' },
    ]);
  });

  it('mentions the weekly freeze when it bridged a missed day', () => {
    const [streak] = presentTodayStats(
      input({ streak: { days: 1, frozenDays: ['2026-11-09'], todayDone: false } }),
    ).tiles;
    expect(streak).toMatchObject({
      value: '1 zi',
      caption:
        'Termină testele de azi ca să o continui. O zi ratată a fost acoperită de înghețarea săptămânii.',
    });
  });

  it('has neutral values before any data', () => {
    const [streak, accuracy] = presentTodayStats(input({ streak: null, week: null })).tiles;
    expect(streak?.value).toBe('0 zile');
    expect(accuracy).toMatchObject({ value: '—', caption: 'Niciun răspuns în ultimele 7 zile.' });
  });

  it('describes the suggestion with its reason, category and level', () => {
    const weak = presentTodayStats(
      input({
        suggestion: { topicId: 'react.c.mid', reason: 'weak' },
        mastery: new Map([['react.c.mid', 40]]),
      }),
    ).suggestion;
    expect(weak).toEqual({
      topicId: 'react.c.mid',
      title: 'react.c.mid',
      meta: 'De recitit · stăpânire 40% · React · Mid',
    });
    const next = presentTodayStats(
      input({
        suggestion: { topicId: 'react.a.junior', reason: 'next' },
        language: 'en',
        strings: strings.en,
      }),
    ).suggestion;
    expect(next?.meta).toBe('Next topic · React · Junior');
    const gone = presentTodayStats(input({ suggestion: { topicId: 'gone', reason: 'next' } }));
    expect(gone.suggestion).toBeNull();
  });
});
