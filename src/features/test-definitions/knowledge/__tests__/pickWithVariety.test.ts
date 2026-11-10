import { type Candidate, pickWithVariety } from '../services/pickWithVariety';

const item = (id: string, categoryId: string, topicId = id): Candidate => ({
  id,
  categoryId,
  topicId,
});
const ids = (groups: Candidate[][]) => groups.map(group => group.map(candidate => candidate.id));

describe('pickWithVariety', () => {
  it('fills phases in order, each up to its max', () => {
    const picks = pickWithVariety(
      [
        { candidates: [item('a', 'x'), item('b', 'y'), item('c', 'z')], max: 2 },
        { candidates: [item('d', 'w'), item('e', 'v')], max: 5 },
      ],
      { target: 3, maxPerCategory: 3 },
    );
    expect(ids(picks)).toEqual([['a', 'b'], ['d']]);
  });

  it('skips a repeated topic or a full category while alternatives exist', () => {
    const picks = pickWithVariety(
      [
        {
          candidates: [
            item('a1', 'x', 'ta'),
            item('a2', 'x', 'ta'),
            item('b', 'x', 'tb'),
            item('c', 'x', 'tc'),
            item('d', 'x', 'td'),
            item('e', 'y'),
          ],
          max: 10,
        },
      ],
      { target: 4, maxPerCategory: 3 },
    );
    expect(ids(picks)).toEqual([['a1', 'b', 'c', 'e']]);
  });

  it('relaxes the topic rule, then the category cap, before leaving slots empty', () => {
    const candidates = [
      item('a1', 'x', 't'),
      item('a2', 'x', 't'),
      item('a3', 'x', 't'),
      item('a4', 'x', 't'),
    ];
    expect(
      ids(pickWithVariety([{ candidates, max: 10 }], { target: 4, maxPerCategory: 3 })),
    ).toEqual([['a1', 'a2', 'a3', 'a4']]);
  });

  it('never picks the same item twice across phases', () => {
    const shared = item('a', 'x');
    const picks = pickWithVariety(
      [
        { candidates: [shared], max: 1 },
        { candidates: [shared, item('b', 'y')], max: 5 },
      ],
      { target: 5, maxPerCategory: 3 },
    );
    expect(ids(picks)).toEqual([['a'], ['b']]);
  });

  it('handles empty input', () => {
    expect(pickWithVariety([], { target: 5, maxPerCategory: 3 })).toEqual([]);
    expect(pickWithVariety([{ candidates: [], max: 3 }], { target: 5, maxPerCategory: 3 })).toEqual(
      [[]],
    );
  });
});
