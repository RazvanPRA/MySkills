import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';
import { logicFixturePack } from './logicFixturePack';

const TIMEOUT = { timeout: 5000 };

async function openTopic(category: string, topic: RegExp) {
  const { dependencies, sqlite } = await createTestDependencies({
    packs: [fixturePack, logicFixturePack],
  });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Studiu'));
  await fireEvent.press(await screen.findByRole('tab', { name: category }, TIMEOUT));
  await fireEvent.press(screen.getByRole('button', { name: topic }));
  await screen.findByText('Notițele mele', undefined, TIMEOUT);
  return { sqlite };
}

const storedNotes = (sqlite: Awaited<ReturnType<typeof openTopic>>['sqlite']) =>
  sqlite.prepare('select topic_id, status, notes from topic_progress').all();

describe('topic notes', () => {
  it('saves notes by themselves, without changing the status', async () => {
    const { sqlite } = await openTopic('React + Next.js', /Hooks și efecte/);
    await fireEvent.changeText(screen.getByLabelText('Notițele mele'), 'Cleanup la unmount.');
    await waitFor(
      () =>
        expect(storedNotes(sqlite)).toEqual([
          { topic_id: 'react.hooks.mid', status: 'not_started', notes: 'Cleanup la unmount.' },
        ]),
      TIMEOUT,
    );
  });

  it('keeps the last words when leaving the screen right away', async () => {
    const { sqlite } = await openTopic('React + Next.js', /Hooks și efecte/);
    await fireEvent.changeText(screen.getByLabelText('Notițele mele'), 'Deps stabile.');
    await fireEvent.press(screen.getByRole('button', { name: 'Înapoi' }));
    await waitFor(
      () => expect(storedNotes(sqlite)).toMatchObject([{ notes: 'Deps stabile.' }]),
      TIMEOUT,
    );
    // And they are shown again when the topic is reopened.
    await fireEvent.press(await screen.findByRole('button', { name: /Hooks și efecte/ }, TIMEOUT));
    expect(await screen.findByDisplayValue('Deps stabile.', undefined, TIMEOUT)).toBeOnTheScreen();
  });
});

describe('practise this topic', () => {
  it('starts an on-demand session with the topic’s exercises and resumes it', async () => {
    const { sqlite } = await openTopic('React + Next.js', /Hooks și efecte/);
    await fireEvent.press(screen.getByRole('button', { name: 'Exersează topicul' }));
    expect(await screen.findByText('1 / 4', undefined, TIMEOUT)).toBeOnTheScreen();
    expect(
      sqlite
        .prepare("select test_kind, scope, status from daily_sessions where test_kind = 'practice'")
        .all(),
    ).toEqual([
      { test_kind: 'practice', scope: '{"topicIds":["react.hooks.mid"]}', status: 'pending' },
    ]);

    // Leaving and practising again resumes the same unfinished session.
    await fireEvent.press(screen.getByRole('button', { name: 'Înapoi' }));
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Exersează topicul' }, TIMEOUT),
    );
    await screen.findByText('1 / 4', undefined, TIMEOUT);
    expect(
      sqlite.prepare("select count(*) as n from daily_sessions where test_kind = 'practice'").get(),
    ).toEqual({ n: 1 });
  });

  it('is disabled, with the reason, for a topic without exercises', async () => {
    await openTopic('React + Next.js', /State management/);
    expect(screen.getByRole('button', { name: 'Exersează topicul' })).toBeDisabled();
    expect(screen.getByText('Topicul nu are încă exerciții.')).toBeOnTheScreen();
  });

  it('logic topics are reading only, but can be practised', async () => {
    await openTopic('Logică', /^trace/);
    expect(screen.queryByRole('radio', { name: 'Parcurs' })).toBeNull();
    expect(
      screen.getByText(
        'Acest topic nu se marchează: testul de logică își alege singur problemele.',
      ),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Exersează topicul' }));
    expect(await screen.findByText('1 / 1', undefined, TIMEOUT)).toBeOnTheScreen();
  });
});
