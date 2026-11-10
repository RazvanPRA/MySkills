import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { logicFixturePack } from './logicFixturePack';

const TIMEOUT = { timeout: 5000 };

const press = (name: string | RegExp) => fireEvent.press(screen.getByRole('button', { name }));

async function openToday() {
  const { dependencies, sqlite } = await createTestDependencies({ packs: [logicFixturePack] });
  await dependencies.storage.prepare();
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('button', { name: 'Începe' }, TIMEOUT);
  return { sqlite };
}

/** The items of the ordering exercise, in their current on-screen order. */
const currentOrder = () =>
  screen
    .getAllByRole('button', { name: /^Mută în sus: / })
    .map(button => String(button.props.accessibilityLabel).replace('Mută în sus: ', ''));

/** Moves items up one by one until the list reads `target` (selection by insertion). */
async function arrange(target: readonly string[]) {
  for (const [position, item] of target.entries()) {
    while (currentOrder().indexOf(item) > position) {
      await press(`Mută în sus: ${item}`);
    }
  }
}

async function checkAndAdvance(verdict: string) {
  await press('Verifică');
  expect(screen.getByText(verdict)).toBeOnTheScreen();
  await press(/^(Următoarea|Termină)$/);
}

describe('logic test flow', () => {
  it('shows the logic card first, with a content-limited shortfall and no "mark topics"', async () => {
    await openToday();
    const headers = screen.getAllByRole('header').map(header => header.props.children);
    expect(headers.indexOf('Test de logică')).toBeLessThan(headers.indexOf('Test de cunoștințe'));
    expect(screen.getByText('3 întrebări · ~6 minute')).toBeOnTheScreen();
    expect(screen.getByText('Doar 3 din 5 probleme disponibile azi.')).toBeOnTheScreen();
  });

  it('plays code output, find the bug and ordering, then shows the results', async () => {
    const { sqlite } = await openToday();
    await press('Începe');

    expect(await screen.findByText('1 / 3', undefined, TIMEOUT)).toBeOnTheScreen();
    await fireEvent.changeText(
      await screen.findByLabelText('Output-ul programului', undefined, TIMEOUT),
      ' 4,6\n',
    );
    await press('Verifică');
    expect(screen.getByText('Corect')).toBeOnTheScreen();
    expect(screen.getByText('Output corect')).toBeOnTheScreen();
    await press('Următoarea');

    expect(await screen.findByText('2 / 3', undefined, TIMEOUT)).toBeOnTheScreen();
    expect(
      await screen.findByText('Atinge linia cu bug-ul.', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    await press('Linia 2: let total;');
    await checkAndAdvance('Corect');

    expect(await screen.findByText('3 / 3', undefined, TIMEOUT)).toBeOnTheScreen();
    await screen.findByText('Pune elementele în ordinea corectă.', undefined, TIMEOUT);
    expect(screen.getByRole('button', { name: 'Verifică' })).toBeDisabled();
    await arrange(['A', 'C', 'B']);
    await checkAndAdvance('Corect');

    expect(await screen.findByRole('header', { name: '100%' }, TIMEOUT)).toBeOnTheScreen();
    expect(screen.getByText('3 din 3 corecte')).toBeOnTheScreen();
    expect(sqlite.prepare('select count(*) as n from attempts').get()).toEqual({ n: 3 });
    // The logic test avoids repeats itself: no FSRS cards.
    expect(sqlite.prepare('select count(*) as n from review_cards').get()).toEqual({ n: 0 });
    expect(sqlite.prepare('select test_kind, status, score from daily_sessions').get()).toEqual({
      test_kind: 'logic',
      status: 'completed',
      score: 1,
    });

    await press('Gata');
    expect(await screen.findByText('Scor: 100%', undefined, TIMEOUT)).toBeOnTheScreen();
  });

  it('shows the correct output and partial credit when answers are wrong', async () => {
    await openToday();
    await press('Începe');
    await fireEvent.changeText(
      await screen.findByLabelText('Output-ul programului', undefined, TIMEOUT),
      '2,4,6',
    );
    await checkAndAdvance('Greșit');

    await screen.findByText('2 / 3', undefined, TIMEOUT);
    await press('Linia 3: for (const x of xs) total += x;');
    await press('Verifică');
    expect(screen.getByText('Linia cu bug-ul: 2')).toBeOnTheScreen();
    await press('Următoarea');

    await screen.findByText('3 / 3', undefined, TIMEOUT);
    await arrange(['A', 'B', 'C']);
    await press('Verifică');
    expect(screen.getByText('Parțial corect (1/3)')).toBeOnTheScreen();
    expect(screen.getByText('Poziția corectă: 3')).toBeOnTheScreen();
  });
});
