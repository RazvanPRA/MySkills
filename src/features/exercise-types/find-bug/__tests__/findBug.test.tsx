import { fireEvent, screen } from '@testing-library/react-native';
import type { Exercise } from '@/features/content';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import FindBugRenderer from '../components/FindBugRenderer/FindBugRenderer';
import { findBug } from '../index';
import { codeLineCount, type FindBugPayload, findBugPayloadSchema } from '../model/schemas';
import { bugLineStates, evaluateFindBug } from '../services/evaluateFindBug.service';

const payload: FindBugPayload = {
  code: 'function sum(xs) {\n  let total;\n  for (const x of xs) total += x;\n  return total;\n}\n',
  language: 'js',
  bugLines: [2],
};

const exercise: Exercise<FindBugPayload> = {
  id: 'logic.debugging.junior.q1',
  type: 'find_bug',
  topicId: 'logic.debugging.junior',
  level: 'junior',
  difficulty: 2,
  estimatedSeconds: 60,
  prompt: { ro: '`sum([1, 2])` întoarce `NaN`.' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
};

describe('find_bug schemas', () => {
  it('counts lines like CodeBlock (one trailing newline is not a line)', () => {
    expect(codeLineCount(payload.code)).toBe(5);
    expect(codeLineCount('a\nb')).toBe(2);
  });

  it('accepts bug lines inside the code', () => {
    expect(findBugPayloadSchema.safeParse(payload).success).toBe(true);
    expect(findBugPayloadSchema.safeParse({ ...payload, bugLines: [5] }).success).toBe(true);
  });

  it.each([
    ['a line past the end', { ...payload, bugLines: [6] }],
    ['line 0', { ...payload, bugLines: [0] }],
    ['no bug line', { ...payload, bugLines: [] }],
    ['a repeated line', { ...payload, bugLines: [2, 2] }],
    ['empty code', { ...payload, code: '' }],
  ])('rejects %s', (_case, invalid) => {
    expect(findBugPayloadSchema.safeParse(invalid).success).toBe(false);
  });

  it('answers are a positive line number', () => {
    expect(findBug.answerSchema.safeParse({ line: 2 }).success).toBe(true);
    expect(findBug.answerSchema.safeParse({ line: 0 }).success).toBe(false);
  });
});

describe('evaluateFindBug and bugLineStates', () => {
  it('is right only on a bug line', () => {
    expect(evaluateFindBug(payload, { line: 2 })).toEqual({ correct: true, score: 1 });
    expect(evaluateFindBug(payload, { line: 3 })).toEqual({ correct: false, score: 0 });
    expect(evaluateFindBug({ ...payload, bugLines: [2, 3] }, { line: 3 }).correct).toBe(true);
  });

  it('marks only the pick before reveal', () => {
    expect(bugLineStates({ lineCount: 3, bugLines: [2], picked: 3, revealed: false })).toEqual([
      'idle',
      'idle',
      'selected',
    ]);
  });

  it('after reveal: bug line correct, a wrong pick wrong, the rest idle', () => {
    expect(bugLineStates({ lineCount: 4, bugLines: [2], picked: 3, revealed: true })).toEqual([
      'idle',
      'correct',
      'wrong',
      'idle',
    ]);
    expect(bugLineStates({ lineCount: 2, bugLines: [2], picked: 2, revealed: true })).toEqual([
      'idle',
      'correct',
    ]);
  });
});

describe('FindBugRenderer', () => {
  const render = (props: Partial<Parameters<typeof FindBugRenderer>[0]> = {}) =>
    renderWithTheme(
      <FindBugRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('asks to tap the buggy line and reports the tapped line', async () => {
    const onAnswerChange = jest.fn();
    await render({ onAnswerChange });
    expect(screen.getByText('Atinge linia cu bug-ul.')).toHaveStyle({ color: lightColors.accent });
    expect(screen.getAllByRole('button')).toHaveLength(5);
    await fireEvent.press(screen.getByRole('button', { name: 'Linia 2: let total;' }));
    expect(onAnswerChange).toHaveBeenCalledWith({ line: 2 });
  });

  it('after reveal: names the bug line, colors the lines and locks them', async () => {
    await render({ answer: { line: 3 }, revealed: true });
    expect(screen.getByText('Linia cu bug-ul: 2')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Linia 2:/ })).toHaveStyle({
      borderColor: lightColors.success,
    });
    expect(screen.getByRole('button', { name: /^Linia 3:/ })).toHaveStyle({
      borderColor: lightColors.danger,
    });
    screen.getAllByRole('button').forEach(line => expect(line).toBeDisabled());
  });
});
