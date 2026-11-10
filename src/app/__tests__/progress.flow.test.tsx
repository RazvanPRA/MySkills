import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { logicFixturePack } from './logicFixturePack';
import { seedLogicHistory } from './seedLogicHistory';

const TIMEOUT = { timeout: 5000 };

async function openProgress({ seed = true } = {}) {
  const { dependencies, sqlite } = await createTestDependencies({ packs: [logicFixturePack] });
  await dependencies.storage.prepare();
  if (seed) {
    seedLogicHistory(sqlite);
  }
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Progres'));
  await screen.findByRole('header', { name: 'Progres' }, TIMEOUT);
}

describe('Progress tab', () => {
  it('shows the competency heatmap with every cell and the estimated level as text', async () => {
    await openProgress();
    // trace 50%, debugging 0%, event-loop never attempted: (50 + 0 + 0) / 3.
    expect(await screen.findByLabelText('Logică, Mid: 17%', undefined, TIMEOUT)).toBeOnTheScreen();
    expect(screen.getByLabelText('Logică, Junior: fără exerciții')).toBeOnTheScreen();
    expect(screen.getByLabelText('Logică, nivel estimat: Sub Junior')).toBeOnTheScreen();
  });

  it('shows logic accuracy by week, weak spots and history', async () => {
    await openProgress();
    expect(
      await screen.findByLabelText('Săptămâna din 9 nov.: 50% · 2 răspunsuri', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Săptămâna din 2 nov.: Fără răspunsuri')).toBeOnTheScreen();
    const weak = screen.getAllByRole('button', { name: /Stăpânire/ });
    expect(weak.map(row => row.props.accessibilityLabel)).toEqual([
      'debugging, Stăpânire 0% · Logică · Mid',
      'trace, Stăpânire 50% · Logică · Mid',
    ]);
    expect(screen.getByRole('button', { name: 'Test de logică, 8 nov. · 100%' })).toBeOnTheScreen();
  });

  it('opens a past test from history and comes back to Progress', async () => {
    await openProgress();
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Test de logică, 9 nov. · 50%' }, TIMEOUT),
    );
    expect(await screen.findByText('1 din 2 corecte', undefined, TIMEOUT)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Gata' }));
    expect(await screen.findByRole('header', { name: 'Progres' }, TIMEOUT)).toBeOnTheScreen();
  });

  it('has empty states on a first run', async () => {
    await openProgress({ seed: false });
    expect(
      await screen.findByText('Niciun test terminat încă.', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText('Niciun topic exersat nu e sub 60%.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Logică, Mid: neînceput')).toBeOnTheScreen();
    expect(screen.getByLabelText('Logică, nivel estimat: —')).toBeOnTheScreen();
  });
});
