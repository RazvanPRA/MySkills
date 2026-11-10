import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import type { Exercise } from '@/features/content';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import OrderingRenderer from '../components/OrderingRenderer/OrderingRenderer';
import { ordering } from '../index';
import { type OrderingPayload, orderingPayloadSchema } from '../model/schemas';
import { evaluateOrdering } from '../services/evaluateOrdering.service';
import { orderItemStates } from '../services/orderItemStates';
import { moveItem, startingOrder } from '../services/reorder';

const payload: OrderingPayload = {
  items: [{ ro: 'sync' }, { ro: 'microtask' }, { ro: '`setTimeout`' }],
};

const exercise: Exercise<OrderingPayload> = {
  id: 'logic.event-loop.mid.o1',
  type: 'ordering',
  topicId: 'logic.event-loop.mid',
  level: 'mid',
  difficulty: 3,
  estimatedSeconds: 90,
  prompt: { ro: 'În ce ordine apar mesajele?' },
  payload,
  explanation: { ro: 'Explicație.' },
  tags: [],
  source: 'pack',
  version: 1,
};

describe('ordering schemas', () => {
  it('accepts 2–8 items', () => {
    expect(orderingPayloadSchema.safeParse(payload).success).toBe(true);
    expect(orderingPayloadSchema.safeParse({ items: [{ ro: 'a' }] }).success).toBe(false);
    const nine = Array.from({ length: 9 }, (_, index) => ({ ro: String(index) }));
    expect(orderingPayloadSchema.safeParse({ items: nine }).success).toBe(false);
  });

  it('answers are an order without repeats', () => {
    expect(ordering.answerSchema.safeParse({ order: [2, 0, 1] }).success).toBe(true);
    expect(ordering.answerSchema.safeParse({ order: [0, 0, 1] }).success).toBe(false);
    expect(ordering.answerSchema.safeParse({ order: [-1, 0] }).success).toBe(false);
  });
});

describe('evaluateOrdering', () => {
  it.each([
    ['all in place', [0, 1, 2], { correct: true, score: 1, credit: { earned: 3, total: 3 } }],
    ['one in place', [0, 2, 1], { correct: false, score: 1 / 3, credit: { earned: 1, total: 3 } }],
    ['none in place', [1, 2, 0], { correct: false, score: 0, credit: { earned: 0, total: 3 } }],
    ['too short', [0, 1], { correct: false, score: 0, credit: { earned: 0, total: 3 } }],
    ['an unknown item', [0, 1, 5], { correct: false, score: 0, credit: { earned: 0, total: 3 } }],
  ])('%s', (_case, order, expected) => {
    expect(evaluateOrdering(payload, { order })).toEqual(expected);
  });
});

describe('reorder services', () => {
  it('starts from a stable order that is never already solved', () => {
    expect(startingOrder(exercise.id, 3)).toEqual(startingOrder(exercise.id, 3));
    for (let index = 0; index < 50; index += 1) {
      const order = startingOrder(`exercise.${index}`, 2);
      expect(order).toEqual([1, 0]);
    }
  });

  it('moves an item one place and stops at the edges', () => {
    expect(moveItem([2, 0, 1], 0, 'up')).toEqual([0, 2, 1]);
    expect(moveItem([2, 0, 1], 0, 'down')).toEqual([2, 1, 0]);
    expect(moveItem([2, 0, 1], 2, 'up')).toEqual([2, 0, 1]);
    expect(moveItem([2, 0, 1], 1, 'down')).toEqual([2, 0, 1]);
  });

  it('gives each item its state and, if misplaced, its correct position', () => {
    expect(orderItemStates({ order: [2, 1, 0], revealed: false })[0]?.state).toBe('idle');
    expect(orderItemStates({ order: [2, 1, 0], revealed: true })).toEqual([
      { item: 2, state: 'wrong', correctPosition: 3 },
      { item: 1, state: 'correct', correctPosition: null },
      { item: 0, state: 'wrong', correctPosition: 1 },
    ]);
  });
});

describe('OrderingRenderer', () => {
  const render = (props: Partial<Parameters<typeof OrderingRenderer>[0]> = {}) =>
    renderWithTheme(
      <OrderingRenderer
        exercise={exercise}
        answer={null}
        onAnswerChange={jest.fn()}
        revealed={false}
        result={null}
        {...props}
      />,
    );

  it('starts shuffled and reports the new order after a move, announcing it', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const onAnswerChange = jest.fn();
    await render({ answer: { order: [2, 0, 1] }, onAnswerChange });
    expect(screen.getByText('Pune elementele în ordinea corectă.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Mută în sus: sync' }));
    expect(onAnswerChange).toHaveBeenCalledWith({ order: [0, 2, 1] });
    expect(announce).toHaveBeenCalledWith('Mutat pe poziția 1');
  });

  it('shows the starting order before the first move', async () => {
    await render();
    const first = startingOrder(exercise.id, 3)[0] as number;
    const firstText = ['sync', 'microtask', 'setTimeout'][first] as string;
    expect(screen.getByRole('button', { name: `Mută în sus: ${firstText}` })).toBeDisabled();
  });

  it('after reveal: per-item verdicts with the correct position as text, read-only', async () => {
    await render({ answer: { order: [2, 1, 0] }, revealed: true });
    expect(screen.getByText('Poziția corectă: 3')).toBeOnTheScreen();
    expect(screen.getByText('La locul potrivit')).toBeOnTheScreen();
    expect(screen.getByTestId('reorder-item-1')).toHaveStyle({
      borderColor: lightColors.success,
    });
    screen.getAllByRole('button').forEach(button => expect(button).toBeDisabled());
  });
});
