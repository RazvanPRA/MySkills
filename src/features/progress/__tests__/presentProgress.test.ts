import { strings } from '@/shared/i18n';
import type { SessionFact } from '../model/facts';
import { buildHeatmap } from '../services/buildHeatmap.service';
import { presentMasteryTable } from '../services/presentMasteryTable';
import {
  logicAttempts,
  presentHistory,
  presentWeakTopics,
  presentWeeks,
} from '../services/presentProgressLists';
import { catalog, fact } from './fixtures';

const ro = { catalog, strings: strings.ro, language: 'ro' as const };
const en = { catalog, strings: strings.en, language: 'en' as const };

describe('presentMasteryTable', () => {
  it('writes every cell and the estimated level as text with full labels', () => {
    const rows = presentMasteryTable(
      buildHeatmap(
        catalog,
        new Map([
          ['react.a.junior', 90],
          ['react.b.junior', 80],
        ]),
      ),
      ro,
    );
    const [react, logic] = rows;
    expect(react?.cells.map(cell => [cell.text, cell.label])).toEqual([
      ['85%', 'React, Junior: 85%'],
      ['—', 'React, Mid: neînceput'],
      ['—', 'React, Senior: neînceput'],
    ]);
    expect(react).toMatchObject({
      estimatedText: 'Nivel estimat: Junior',
      estimatedLabel: 'React, nivel estimat: Junior',
    });
    expect(logic?.cells[1]).toEqual({
      level: 'mid',
      percent: null,
      text: '—',
      label: 'Logică, Mid: fără exerciții',
    });
    expect(logic?.estimatedText).toBe('Nivel estimat: —');
  });

  it('says "below Junior" once something was practised', () => {
    const [react] = presentMasteryTable(
      buildHeatmap(catalog, new Map([['react.a.junior', 20]])),
      en,
    );
    expect(react?.estimatedText).toBe('Estimated level: Below Junior');
  });
});

describe('progress lists', () => {
  it('logicAttempts keeps only exercises of logic categories', () => {
    const attempts = [fact('logic.x.junior.q1'), fact('react.a.junior.q1'), fact('gone.q1')];
    expect(logicAttempts(catalog, attempts).map(a => a.exerciseId)).toEqual(['logic.x.junior.q1']);
  });

  it('presentWeeks titles weeks by their Monday and writes the value', () => {
    expect(
      presentWeeks(
        [
          { weekStart: '2026-11-02', accuracy: null, count: 0 },
          { weekStart: '2026-11-09', accuracy: 75, count: 4 },
        ],
        ro,
      ),
    ).toEqual([
      {
        weekStart: '2026-11-02',
        title: 'Săptămâna din 2 nov.',
        progress: 0,
        text: 'Fără răspunsuri',
      },
      {
        weekStart: '2026-11-09',
        title: 'Săptămâna din 9 nov.',
        progress: 0.75,
        text: '75% · 4 răspunsuri',
      },
    ]);
  });

  it('presentWeakTopics describes each topic and skips removed ones', () => {
    expect(
      presentWeakTopics(
        [
          { topicId: 'react.c.mid', mastery: 30 },
          { topicId: 'gone', mastery: 10 },
        ],
        ro,
      ),
    ).toEqual([{ id: 'react.c.mid', title: 'react.c.mid', meta: 'Stăpânire 30% · React · Mid' }]);
  });

  it('presentHistory lists finished tests, newest first, with date and score', () => {
    const session = (id: string, date: string, extra: Partial<SessionFact>): SessionFact => ({
      id,
      date,
      testKind: id.startsWith('l') ? 'logic' : 'unknown',
      status: 'completed',
      exerciseCount: 5,
      ...extra,
    });
    const items = presentHistory(
      [
        session('l1', '2026-11-08', { score: 1 }),
        session('l2', '2026-11-09', { score: 0.8 }),
        session('l3', '2026-11-10', { status: 'in_progress' }),
        session('u1', '2026-11-07', { score: 0.5 }),
      ],
      { ...ro, testTitles: { logic: { ro: 'Test de logică' } }, limit: 2 },
    );
    expect(items).toEqual([
      { id: 'l2', title: 'Test de logică', meta: '9 nov. · 80%' },
      { id: 'l1', title: 'Test de logică', meta: '8 nov. · 100%' },
    ]);
  });
});
