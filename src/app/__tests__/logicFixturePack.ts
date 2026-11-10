/**
 * A small logic pack for app-level flow tests: one problem of each Phase 3 type, in three
 * subcategories, with difficulties 1–3 so the test order (easiest first) is fixed.
 */
const text = (ro: string) => ({ ro });

const topic = (row: string) => ({
  id: `logic.${row}.mid`,
  categoryId: 'logic',
  title: text(row),
  level: 'mid',
  summary: text(`Despre ${row}.`),
});

const problem = (id: string, difficulty: number) => ({
  id,
  topicId: id.split('.').slice(0, 3).join('.'),
  level: 'mid',
  difficulty,
  estimatedSeconds: 120,
  explanation: text('Explicație.'),
});

export const logicFixturePack = {
  id: 'logic-fixture',
  version: '1.0.0',
  schemaVersion: 1,
  title: text('Logică'),
  categories: [{ id: 'logic', title: text('Logică'), testKinds: ['logic'], order: 1 }],
  topics: [topic('trace'), topic('debugging'), topic('event-loop')],
  exercises: [
    {
      ...problem('logic.trace.mid.q1', 1),
      type: 'code_output',
      prompt: text('Ce afișează `[1, 2, 3].map(x => x * 2).filter(x => x > 2).join(",")`?'),
      payload: { mode: 'input', expected: '4,6' },
    },
    {
      ...problem('logic.debugging.mid.q1', 2),
      type: 'find_bug',
      prompt: text('`sum([1, 2])` întoarce `NaN`.'),
      payload: {
        code: 'function sum(xs) {\n  let total;\n  for (const x of xs) total += x;\n  return total;\n}',
        language: 'js',
        bugLines: [2],
      },
    },
    {
      ...problem('logic.event-loop.mid.q1', 3),
      type: 'ordering',
      prompt: text('În ce ordine apar mesajele?'),
      payload: { items: [text('A'), text('C'), text('B')] },
    },
  ],
};
