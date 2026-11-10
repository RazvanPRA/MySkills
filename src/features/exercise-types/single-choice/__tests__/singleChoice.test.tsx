import { fireEvent, screen } from '@testing-library/react-native';
import type { Exercise } from '@/features/content';
import { LanguageProvider } from '@/shared/i18n';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { optionLetter } from '@/shared/ui';
import { seededPermutation } from '@/shared/utils/seededRandom';
import SingleChoiceRenderer from '../components/SingleChoiceRenderer/SingleChoiceRenderer';
import { singleChoice } from '../index';
import { type SingleChoicePayload, singleChoicePayloadSchema } from '../model/schemas';
import { evaluateSingleChoice } from '../services/evaluateSingleChoice.service';

const payload: SingleChoicePayload = {
  options: [
    { ro: '`useEffect`' },
    { ro: '`useLayoutEffect`', en: 'EN `useLayoutEffect`' },
    { ro: 'Niciunul' },
  ],
  correctIndex: 1,
};

const exercise: Exercise<SingleChoicePayload> = {
  id: 'react.hooks.mid.q1',
  type: 'single_choice',
  topicId: 'react.hooks.mid',
  level: 'mid',
  difficulty: 3,
  estimatedSeconds: 45,
  prompt: { ro: 'Care rulează înainte de paint?' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
};

describe('single_choice schemas', () => {
  it('accepts 2–6 options with an existing correct index', () => {
    expect(singleChoicePayloadSchema.safeParse(payload).success).toBe(true);
  });

  it.each([
    ['correct index out of range', { ...payload, correctIndex: 3 }],
    ['negative index', { ...payload, correctIndex: -1 }],
    ['a single option', { options: [{ ro: 'a' }], correctIndex: 0 }],
    ['seven options', { options: Array.from({ length: 7 }, () => ({ ro: 'x' })), correctIndex: 0 }],
    ['an option without Romanian', { options: [{ en: 'a' }, { ro: 'b' }], correctIndex: 0 }],
  ])('rejects %s', (_case, invalid) => {
    expect(singleChoicePayloadSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates answers as a non-negative integer index', () => {
    expect(singleChoice.answerSchema.safeParse({ index: 2 }).success).toBe(true);
    expect(singleChoice.answerSchema.safeParse({ index: 1.5 }).success).toBe(false);
    expect(singleChoice.answerSchema.safeParse(null).success).toBe(false);
  });
});

describe('evaluateSingleChoice', () => {
  it('scores the correct option 1 and anything else 0', () => {
    expect(evaluateSingleChoice(payload, { index: 1 })).toEqual({ correct: true, score: 1 });
    expect(evaluateSingleChoice(payload, { index: 0 })).toEqual({ correct: false, score: 0 });
    expect(evaluateSingleChoice(payload, { index: 9 })).toEqual({ correct: false, score: 0 });
  });

  it('is the registered definition’s evaluator, with the default check flow', () => {
    expect(singleChoice.type).toBe('single_choice');
    expect(singleChoice.evaluate(payload, { index: 1 })).toEqual({ correct: true, score: 1 });
    expect(singleChoice.flow).toBeUndefined();
  });
});

describe('SingleChoiceRenderer', () => {
  const render = (props: Partial<Parameters<typeof SingleChoiceRenderer>[0]> = {}) =>
    renderWithTheme(
      <SingleChoiceRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('lists lettered radio options and reports the picked index', async () => {
    const onAnswerChange = jest.fn();
    await render({ onAnswerChange });
    await fireEvent.press(screen.getByRole('radio', { name: /\. Niciunul$/ }));
    expect(onAnswerChange).toHaveBeenCalledWith({ index: 2 });
  });

  it('shows the current pick as checked', async () => {
    await render({ answer: { index: 0 } });
    expect(screen.getByRole('radio', { name: /\. useEffect$/ })).toBeChecked();
  });

  it('after reveal: wrong pick red, correct option green, all disabled', async () => {
    await render({ answer: { index: 0 }, revealed: true });
    expect(screen.getByRole('radio', { name: /\. useEffect$/ })).toHaveStyle({
      borderColor: lightColors.danger,
    });
    expect(screen.getByRole('radio', { name: /\. useLayoutEffect$/ })).toHaveStyle({
      borderColor: lightColors.success,
    });
    screen.getAllByRole('radio').forEach(option => expect(option).toBeDisabled());
  });

  it('uses the UI language when the option has a translation', async () => {
    await renderWithTheme(
      <LanguageProvider language="en">
        <SingleChoiceRenderer
          exercise={exercise}
          answer={null}
          onAnswerChange={jest.fn()}
          revealed={false}
          result={null}
        />
      </LanguageProvider>,
    );
    expect(screen.getByRole('radio', { name: /\. EN useLayoutEffect$/ })).toBeOnTheScreen();
  });
});

describe('SingleChoiceRenderer display order', () => {
  it('shows the options in the exercise’s stable shuffled order', async () => {
    await renderWithTheme(
      <SingleChoiceRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
      />,
    );
    const texts = ['useEffect', 'useLayoutEffect', 'Niciunul'];
    const expected = seededPermutation(exercise.id, 3).map(
      (index, position) => `${optionLetter(position)}. ${texts[index]}`,
    );
    expect(screen.getAllByRole('radio').map(option => option.props.accessibilityLabel)).toEqual(
      expected,
    );
  });
});
