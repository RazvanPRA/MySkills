/** A small content pack for app-level flow tests (valid against the real registries). */
const text = (ro: string, en?: string) => (en ? { ro, en } : { ro });

const singleChoice = (id: string, topicId: string, correctIndex: number) => ({
  id,
  type: 'single_choice',
  topicId,
  level: 'mid',
  difficulty: 2,
  estimatedSeconds: 60,
  prompt: text(`Întrebarea ${id}: ce afișează \`console.log(typeof null)\`?`),
  payload: { options: [text('`"object"`'), text('`"null"`'), text('`"undefined"`')], correctIndex },
  explanation: text('`typeof null` este `"object"`: o moștenire din primele versiuni JavaScript.'),
});

export const fixturePack = {
  id: 'fixture',
  version: '1.0.0',
  schemaVersion: 1,
  title: text('Fixture'),
  categories: [
    { id: 'react', title: text('React + Next.js'), testKinds: ['knowledge'], order: 10 },
    { id: 'go', title: text('Go'), testKinds: ['knowledge'], order: 20 },
  ],
  topics: [
    {
      id: 'react.hooks.mid',
      categoryId: 'react',
      title: text('Hooks și efecte', 'Hooks and effects'),
      level: 'mid',
      summary: text('Scrii **custom hooks** și faci cleanup corect.'),
      resources: [{ title: 'React: Hooks', url: 'https://react.dev/reference/react/hooks' }],
    },
    {
      id: 'react.state.junior',
      categoryId: 'react',
      title: text('State management'),
      level: 'junior',
      summary: text('State local și Context.'),
    },
    {
      id: 'go.errors.mid',
      categoryId: 'go',
      title: text('Gestionarea erorilor'),
      level: 'mid',
      summary: text('Wrapping cu `%w`.'),
    },
  ],
  exercises: [
    singleChoice('react.hooks.mid.q1', 'react.hooks.mid', 0),
    singleChoice('react.hooks.mid.q2', 'react.hooks.mid', 0),
    {
      id: 'react.hooks.mid.m1',
      type: 'multiple_choice',
      topicId: 'react.hooks.mid',
      level: 'mid',
      difficulty: 3,
      estimatedSeconds: 60,
      prompt: text('Ce declanșează o re-randare?'),
      payload: {
        options: [text('setState'), text('Context schimbat'), text('O variabilă locală')],
        correctIndices: [0, 1],
      },
      explanation: text('State și context, nu variabile locale.'),
    },
    {
      id: 'react.hooks.mid.f1',
      type: 'flashcard_self_graded',
      topicId: 'react.hooks.mid',
      level: 'mid',
      difficulty: 3,
      estimatedSeconds: 90,
      prompt: text('Când NU ai nevoie de `useEffect`?'),
      payload: {
        answer: text('Pentru date derivate și pentru evenimente.'),
        keyPoints: [text('Date derivate')],
      },
      explanation: text('Efectele sincronizează cu sisteme externe.'),
    },
  ],
};
