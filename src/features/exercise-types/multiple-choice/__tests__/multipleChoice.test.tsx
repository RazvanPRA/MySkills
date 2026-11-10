import { fireEvent, screen } from '@testing-library/react-native';
import type { Exercise } from '@/features/content';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import MultipleChoiceRenderer from '../components/MultipleChoiceRenderer/MultipleChoiceRenderer';
import { multipleChoice } from '../index';
import {
  multipleChoiceAnswerSchema,
  type MultipleChoicePayload,
  multipleChoicePayloadSchema,
} from '../model/schemas';
import { evaluateMultipleChoice, togglePick } from '../services/evaluateMultipleChoice.service';

const payload: MultipleChoicePayload = {
  options: [{ ro: 'Idempotent' }, { ro: 'Sigur' }, { ro: 'Cacheabil' }, { ro: 'Are body' }],
  correctIndices: [0, 1, 2],
};

const exercise: Exercise<MultipleChoicePayload> = {
  id: 'fundamentals.http.mid.q1',
  type: 'multiple_choice',
  topicId: 'fundamentals.http.mid',
  level: 'mid',
  difficulty: 3,
  estimatedSeconds: 60,
  prompt: { ro: 'Ce proprietăți are GET?' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
};

describe('multiple_choice schemas', () => {
  it('accepts unique, in-range correct indices with at least one wrong option', () => {
    expect(multipleChoicePayloadSchema.safeParse(payload).success).toBe(true);
  });

  it.each([
    ['repeated indices', { ...payload, correctIndices: [0, 0] }],
    ['an index out of range', { ...payload, correctIndices: [0, 4] }],
    ['no correct option', { ...payload, correctIndices: [] }],
    ['every option correct', { ...payload, correctIndices: [0, 1, 2, 3] }],
  ])('rejects %s', (_case, invalid) => {
    expect(multipleChoicePayloadSchema.safeParse(invalid).success).toBe(false);
  });

  it('requires at least one unique pick in an answer', () => {
    expect(multipleChoiceAnswerSchema.safeParse({ indices: [2, 0] }).success).toBe(true);
    expect(multipleChoiceAnswerSchema.safeParse({ indices: [] }).success).toBe(false);
    expect(multipleChoiceAnswerSchema.safeParse({ indices: [1, 1] }).success).toBe(false);
  });
});

describe('evaluateMultipleChoice', () => {
  it.each([
    [
      'exact match, any order',
      [2, 0, 1],
      { correct: true, score: 1, credit: { earned: 3, total: 3 } },
    ],
    [
      '2 of 3, no wrong pick',
      [0, 1],
      { correct: false, score: 2 / 3, credit: { earned: 2, total: 3 } },
    ],
    [
      'all 3 plus a wrong pick',
      [0, 1, 2, 3],
      { correct: false, score: 2 / 3, credit: { earned: 3, total: 3 } },
    ],
    ['1 right, 1 wrong', [0, 3], { correct: false, score: 0, credit: { earned: 1, total: 3 } }],
    ['only wrong picks', [3], { correct: false, score: 0, credit: { earned: 0, total: 3 } }],
  ])('%s', (_case, indices, expected) => {
    expect(evaluateMultipleChoice(payload, { indices })).toEqual(expected);
  });

  it('togglePick adds in order and removes', () => {
    expect(togglePick([2], 0)).toEqual([0, 2]);
    expect(togglePick([0, 2], 2)).toEqual([0]);
  });

  it('is registered as multiple_choice', () => {
    expect(multipleChoice.type).toBe('multiple_choice');
  });
});

describe('MultipleChoiceRenderer', () => {
  const render = (props: Partial<Parameters<typeof MultipleChoiceRenderer>[0]> = {}) =>
    renderWithTheme(
      <MultipleChoiceRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('tells how many answers to choose', async () => {
    await render();
    expect(screen.getByText('Alege 3 răspunsuri')).toHaveStyle({ color: lightColors.accent });
  });

  it('toggles picks through checkboxes', async () => {
    const onAnswerChange = jest.fn();
    await render({ answer: { indices: [1] }, onAnswerChange });
    expect(screen.getByRole('checkbox', { name: /\. Sigur$/ })).toBeChecked();
    await fireEvent.press(screen.getByRole('checkbox', { name: /\. Idempotent$/ }));
    expect(onAnswerChange).toHaveBeenLastCalledWith({ indices: [0, 1] });
    await fireEvent.press(screen.getByRole('checkbox', { name: /\. Sigur$/ }));
    expect(onAnswerChange).toHaveBeenLastCalledWith({ indices: [] });
  });

  it('after reveal shows every option’s own state', async () => {
    await render({ answer: { indices: [0, 3] }, revealed: true });
    const option = (text: string) =>
      screen.getByRole('checkbox', { name: new RegExp(`\\. ${text}$`) });
    // Idempotent: picked + correct; Sigur: correct but missed (still green); Are body: wrong pick.
    expect(option('Idempotent')).toHaveStyle({ borderColor: lightColors.success });
    expect(option('Sigur')).toHaveStyle({ borderColor: lightColors.success });
    expect(option('Sigur')).not.toBeChecked();
    expect(option('Cacheabil')).toHaveStyle({ borderColor: lightColors.success });
    expect(option('Are body')).toHaveStyle({ borderColor: lightColors.danger });
  });
});
