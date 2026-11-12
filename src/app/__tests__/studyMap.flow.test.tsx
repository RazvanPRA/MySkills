import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SETTINGS_STORAGE_KEY } from '@/features/settings';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';
import { logicFixturePack } from './logicFixturePack';

const TIMEOUT = { timeout: 5000 };

async function openStudyTab(stored: Record<string, unknown> = {}) {
  const { dependencies, sqlite } = await createTestDependencies({
    packs: [fixturePack, logicFixturePack],
    // The logic pack sorts first; these tests start on React unless they say otherwise.
    storedSettings: {
      [SETTINGS_STORAGE_KEY]: JSON.stringify({ studyCategoryId: 'react', ...stored }),
    },
  });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Studiu'));
  await screen.findByRole('tab', { name: 'React + Next.js' }, TIMEOUT);
  return { sqlite, settings: () => dependencies.repositories.settings.load() };
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

describe('study map filters', () => {
  it('searches every category, ignoring diacritics, and says when nothing matches', async () => {
    await openStudyTab();
    await fireEvent.changeText(screen.getByLabelText('Caută un topic'), 'erorilor');
    // Go is not the selected category, yet its topic is found, under a "Go" heading.
    expect(screen.getByRole('header', { name: 'Go' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Gestionarea erorilor, Mid, Neînceput' }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: 'Go' })).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Caută un topic'), 'efecte HOOKS');
    expect(screen.getByRole('button', { name: /Hooks și efecte/ })).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Caută un topic'), 'kubernetes');
    expect(screen.getByText('Niciun topic nu se potrivește.')).toBeOnTheScreen();
  });

  it('filters by level and remembers the levels and the category', async () => {
    const { settings } = await openStudyTab();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Mid' }));
    expect(screen.queryByRole('button', { name: /Hooks și efecte/ })).toBeNull();
    expect(screen.getByRole('button', { name: /State management/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: 'Go' }));
    expect(screen.getByText('Categoria nu are încă topicuri.')).toBeOnTheScreen();
    await waitFor(async () =>
      expect(await settings()).toMatchObject({
        studyLevels: ['junior', 'senior'],
        studyCategoryId: 'go',
      }),
    );
  });

  it('opens on the saved category and levels', async () => {
    await openStudyTab({ studyCategoryId: 'go', studyLevels: ['mid'] });
    expect(screen.getByRole('tab', { name: 'Go' })).toBeSelected();
    expect(screen.getByRole('checkbox', { name: 'Junior' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Gestionarea erorilor/ })).toBeOnTheScreen();
  });

  it('shows logic topics without a status', async () => {
    await openStudyTab();
    await fireEvent.press(screen.getByRole('tab', { name: 'Logică' }));
    expect(screen.getByRole('button', { name: 'trace, Mid' })).toBeOnTheScreen();
  });
});
