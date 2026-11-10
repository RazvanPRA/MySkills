import { fireEvent, screen } from '@testing-library/react-native';
import type { Exercise } from '@/features/content';
import { fontFamily, lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import CodeOutputRenderer from '../components/CodeOutputRenderer/CodeOutputRenderer';
import { codeOutput } from '../index';
import { type CodeOutputPayload, codeOutputPayloadSchema } from '../model/schemas';
import { evaluateCodeOutput, normalizeOutput } from '../services/evaluateCodeOutput.service';

const choice: CodeOutputPayload = {
  mode: 'choice',
  options: [{ ro: '`1 2 3`' }, { ro: '`3 3 3`' }, { ro: '`0 1 2`' }],
  correctIndex: 1,
};
const input = codeOutputPayloadSchema.parse({
  mode: 'input',
  expected: 'A\nC\nB',
  accepted: ['A C B'],
});

const exerciseWith = (payload: CodeOutputPayload): Exercise<CodeOutputPayload> => ({
  id: 'logic.event-loop.mid.q1',
  type: 'code_output',
  topicId: 'logic.event-loop.mid',
  level: 'mid',
  difficulty: 3,
  estimatedSeconds: 90,
  prompt: { ro: 'Ce afișează?' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
});

describe('code_output schemas', () => {
  it('accepts a choice payload and an input payload (accepted defaults to [])', () => {
    expect(codeOutputPayloadSchema.safeParse(choice).success).toBe(true);
    expect(codeOutputPayloadSchema.parse({ mode: 'input', expected: '42' })).toEqual({
      mode: 'input',
      expected: '42',
      accepted: [],
    });
  });

  it.each([
    ['an unknown mode', { mode: 'free', expected: '1' }],
    ['choice: correct index out of range', { ...choice, correctIndex: 3 }],
    ['input: blank expected output', { mode: 'input', expected: '  ' }],
    ['input: a blank accepted spelling', { mode: 'input', expected: '1', accepted: [''] }],
  ])('rejects %s', (_case, invalid) => {
    expect(codeOutputPayloadSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts a picked index or non-blank text as an answer', () => {
    expect(codeOutput.answerSchema.safeParse({ index: 0 }).success).toBe(true);
    expect(codeOutput.answerSchema.safeParse({ text: '1 2' }).success).toBe(true);
    expect(codeOutput.answerSchema.safeParse({ text: ' \n ' }).success).toBe(false);
    expect(codeOutput.answerSchema.safeParse(null).success).toBe(false);
  });
});

describe('evaluateCodeOutput', () => {
  it('choice: right only for the correct index', () => {
    expect(evaluateCodeOutput(choice, { index: 1 })).toEqual({ correct: true, score: 1 });
    expect(evaluateCodeOutput(choice, { index: 0 })).toEqual({ correct: false, score: 0 });
    expect(evaluateCodeOutput(choice, { text: '3 3 3' })).toEqual({ correct: false, score: 0 });
  });

  it.each([
    ['the exact output', 'A\nC\nB', true],
    ['spaces instead of line breaks', 'A C B', true],
    ['extra spaces and a trailing newline', '  A   C\tB\n', true],
    ['an accepted spelling', 'A C B', true],
    ['the wrong order', 'A B C', false],
    ['the wrong case', 'a c b', false],
  ])('input: %s → %s', (_case, text, correct) => {
    expect(evaluateCodeOutput(input, { text }).correct).toBe(correct);
  });

  it('input: a picked index is wrong', () => {
    expect(evaluateCodeOutput(input, { index: 0 }).correct).toBe(false);
  });

  it('normalizes curly quotes from phone keyboards', () => {
    expect(normalizeOutput('“ok” ‘x’')).toBe('"ok" \'x\'');
  });
});

describe('CodeOutputRenderer', () => {
  const render = (
    payload: CodeOutputPayload,
    props: Partial<Parameters<typeof CodeOutputRenderer>[0]> = {},
  ) =>
    renderWithTheme(
      <CodeOutputRenderer
        exercise={exerciseWith(payload)}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('choice mode: radio options; after reveal the correct one is green', async () => {
    const onAnswerChange = jest.fn();
    await render(choice, { onAnswerChange });
    await fireEvent.press(screen.getByRole('radio', { name: /\. 0 1 2$/ }));
    expect(onAnswerChange).toHaveBeenCalledWith({ index: 2 });
    await render(choice, { answer: { index: 2 }, revealed: true });
    expect(screen.getByRole('radio', { name: /\. 3 3 3$/ })).toHaveStyle({
      borderColor: lightColors.success,
    });
  });

  it('input mode: a labelled monospace field that reports the typed text', async () => {
    const onAnswerChange = jest.fn();
    await render(input, { onAnswerChange });
    const field = screen.getByLabelText('Output-ul programului');
    expect(field).toHaveStyle({ fontFamily: fontFamily.mono });
    await fireEvent.changeText(field, 'A C B');
    expect(onAnswerChange).toHaveBeenCalledWith({ text: 'A C B' });
    expect(screen.queryByText('Output corect')).toBeNull();
  });

  it('input mode after reveal: the field is read-only and the exact output is shown', async () => {
    await render(input, { answer: { text: 'A B C' }, revealed: true });
    expect(screen.getByLabelText('Output-ul programului')).toBeDisabled();
    expect(screen.getByText('Output corect')).toBeOnTheScreen();
    expect(screen.getByText('C')).toBeOnTheScreen();
  });
});
