import { fireEvent, screen } from '@testing-library/react-native';
import type { Exercise } from '@/features/content';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import FlashcardRenderer from '../components/FlashcardRenderer/FlashcardRenderer';
import { flashcardSelfGraded } from '../index';
import { type FlashcardPayload, flashcardPayloadSchema } from '../model/schemas';
import { evaluateFlashcard, flashcardFsrsRating } from '../services/evaluateFlashcard.service';

const payload: FlashcardPayload = {
  answer: { ro: 'Când datele se citesc pe server și **nu** au nevoie de interactivitate.' },
  keyPoints: [{ ro: 'Bundle mai mic' }, { ro: 'Acces direct la date' }],
};

const exercise: Exercise<FlashcardPayload> = {
  id: 'react.nextjs.senior.f1',
  type: 'flashcard_self_graded',
  topicId: 'react.nextjs.senior',
  level: 'senior',
  difficulty: 4,
  estimatedSeconds: 90,
  prompt: { ro: 'Când alegi RSC în locul client components?' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
};

describe('flashcard_self_graded schemas', () => {
  it('requires a model answer; key points default to none', () => {
    expect(flashcardPayloadSchema.parse({ answer: { ro: 'x' } })).toEqual({
      answer: { ro: 'x' },
      keyPoints: [],
    });
    expect(flashcardPayloadSchema.safeParse({ keyPoints: [] }).success).toBe(false);
  });

  it('accepts only ratings 1–4 as answers', () => {
    expect(flashcardSelfGraded.answerSchema.safeParse({ rating: 4 }).success).toBe(true);
    expect(flashcardSelfGraded.answerSchema.safeParse({ rating: 5 }).success).toBe(false);
    expect(flashcardSelfGraded.answerSchema.safeParse({ rating: 0 }).success).toBe(false);
  });
});

describe('evaluateFlashcard', () => {
  it.each([
    [1, { correct: false, score: 0 }],
    [2, { correct: false, score: 1 / 3 }],
    [3, { correct: true, score: 2 / 3 }],
    [4, { correct: true, score: 1 }],
  ] as const)('rating %i → %j, and back to the same FSRS rating', (rating, expected) => {
    const result = evaluateFlashcard(payload, { rating });
    expect(result).toEqual(expected);
    expect(flashcardFsrsRating(result)).toBe(rating);
  });

  it('uses the self-graded flow and its own FSRS mapping', () => {
    expect(flashcardSelfGraded.flow).toBe('self_graded');
    expect(flashcardSelfGraded.toFsrsRating).toBe(flashcardFsrsRating);
  });
});

describe('FlashcardRenderer', () => {
  const render = (props: Partial<Parameters<typeof FlashcardRenderer>[0]> = {}) =>
    renderWithTheme(
      <FlashcardRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('shows only a hint before reveal', async () => {
    await render();
    expect(screen.getByText(/Formulează răspunsul/)).toBeOnTheScreen();
    expect(screen.queryByText('Răspuns model')).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('after reveal shows the model answer without a verdict, and the key points', async () => {
    await render({ revealed: true });
    expect(screen.getByText('Răspuns model')).toHaveStyle({ color: lightColors.text });
    expect(screen.getByText('nu')).toHaveStyle({ fontWeight: '600' });
    expect(screen.getByText('Bundle mai mic')).toBeOnTheScreen();
  });

  it('reports the self-rating', async () => {
    const onAnswerChange = jest.fn();
    await render({ revealed: true, onAnswerChange });
    await fireEvent.press(screen.getByRole('radio', { name: 'Greu' }));
    expect(onAnswerChange).toHaveBeenCalledWith({ rating: 2 });
  });

  it('marks the chosen rating as selected', async () => {
    await render({ revealed: true, answer: { rating: 4 } });
    expect(screen.getByRole('radio', { name: 'Ușor' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Nu știam' })).not.toBeSelected();
  });
});
