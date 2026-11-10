import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';

const TIMEOUT = { timeout: 5000 };

async function openStudyTab() {
  const { dependencies, sqlite } = await createTestDependencies({ packs: [fixturePack] });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Studiu'));
  await screen.findByRole('tab', { name: 'React + Next.js' }, TIMEOUT);
  return { sqlite };
}

describe('study map flow', () => {
  it('lists the selected category’s topics by level, all not started', async () => {
    await openStudyTab();
    expect(screen.getByRole('tab', { name: 'React + Next.js' })).toBeSelected();
    expect(
      screen.getByRole('button', { name: 'Hooks și efecte, Mid, Neînceput' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'State management, Junior, Neînceput' }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Gestionarea erorilor')).toBeNull();
  });

  it('switches category through the tabs', async () => {
    await openStudyTab();
    await fireEvent.press(screen.getByRole('tab', { name: 'Go' }));
    expect(
      screen.getByRole('button', { name: 'Gestionarea erorilor, Mid, Neînceput' }),
    ).toBeOnTheScreen();
  });

  it('marks a topic as studied: saved in SQLite and shown back in the list', async () => {
    const { sqlite } = await openStudyTab();
    await fireEvent.press(screen.getByRole('button', { name: /Hooks și efecte/ }));
    await screen.findByRole('header', { name: 'Hooks și efecte' }, TIMEOUT);
    expect(screen.getByText('React + Next.js · Mid')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Neînceput' })).toBeSelected();

    await fireEvent.press(screen.getByRole('radio', { name: 'Parcurs' }));
    expect(await screen.findByRole('radio', { name: 'Parcurs', selected: true })).toBeOnTheScreen();
    expect(sqlite.prepare('select topic_id, status from topic_progress').all()).toEqual([
      { topic_id: 'react.hooks.mid', status: 'studied' },
    ]);

    await fireEvent.press(screen.getByRole('button', { name: 'Înapoi' }));
    expect(
      await screen.findByRole('button', { name: 'Hooks și efecte, Mid, Parcurs' }, TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('shows the topic summary as Markdown and its resources', async () => {
    await openStudyTab();
    await fireEvent.press(screen.getByRole('button', { name: /Hooks și efecte/ }));
    expect(await screen.findByText('custom hooks', undefined, TIMEOUT)).toHaveStyle({
      fontWeight: '600',
    });
    expect(screen.getByRole('button', { name: 'React: Hooks, react.dev' })).toBeOnTheScreen();
  });
});
