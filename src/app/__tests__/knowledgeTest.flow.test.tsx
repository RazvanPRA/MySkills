import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';

const TIMEOUT = { timeout: 5000 };

/** One covered topic with 4 exercises: two single choice, one multiple choice, one flashcard. */
async function openToday() {
  const { dependencies, sqlite } = await createTestDependencies({ packs: [fixturePack] });
  await dependencies.storage.prepare();
  await dependencies.repositories.topicProgress.save({
    topicId: 'react.hooks.mid',
    status: 'studied',
    updatedAt: '2026-11-09T08:00:00.000Z',
  });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('button', { name: 'Începe' }, TIMEOUT);
  return { sqlite };
}

const press = (role: 'button' | 'radio' | 'checkbox', name: string | RegExp) =>
  fireEvent.press(screen.getByRole(role, { name }));

/** Answers whatever exercise is shown, correctly or not, and checks the feedback. */
async function answerCurrent({ correctly }: { correctly: boolean }) {
  await screen.findByRole('button', { name: /Verifică|Arată răspunsul/ }, TIMEOUT);
  if (screen.queryByRole('button', { name: 'Arată răspunsul' })) {
    await press('button', 'Arată răspunsul');
    await press('radio', correctly ? 'Ușor' : 'Nu știam');
  } else if (screen.queryAllByRole('checkbox').length > 0) {
    await press('checkbox', /\. setState$/);
    await press('checkbox', correctly ? /\. Context schimbat$/ : /\. O variabilă locală$/);
    await press('button', 'Verifică');
    expect(screen.getByText(correctly ? 'Corect' : 'Parțial corect (1/2)')).toBeOnTheScreen();
  } else {
    await press('radio', correctly ? /\. "object"$/ : /\. "null"$/);
    await press('button', 'Verifică');
    expect(screen.getByText(correctly ? 'Corect' : 'Greșit')).toBeOnTheScreen();
  }
}

async function moveOn() {
  const next = screen.queryByRole('button', { name: 'Următoarea' });
  await fireEvent.press(next ?? screen.getByRole('button', { name: 'Termină' }));
}

describe('knowledge test flow', () => {
  it('shows today’s card with its size and the shortfall', async () => {
    await openToday();
    expect(screen.getByRole('header', { name: 'Test de cunoștințe' })).toBeOnTheScreen();
    expect(screen.getByText('4 întrebări · ~5 minute')).toBeOnTheScreen();
    expect(screen.getByText(/Doar 4 din 10 întrebări/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Marchează topicuri' })).toBeOnTheScreen();
  });

  it('plays the whole test, shows the results and marks the day done', async () => {
    const { sqlite } = await openToday();
    await press('button', 'Începe');
    for (let index = 1; index <= 4; index += 1) {
      expect(await screen.findByText(`${index} / 4`, undefined, TIMEOUT)).toBeOnTheScreen();
      await answerCurrent({ correctly: true });
      await moveOn();
    }
    expect(await screen.findByRole('header', { name: '100%' }, TIMEOUT)).toBeOnTheScreen();
    expect(screen.getByText('4 din 4 corecte')).toBeOnTheScreen();
    expect(screen.getByText('Nimic de recitit azi.')).toBeOnTheScreen();

    expect(sqlite.prepare('select count(*) as n from attempts').get()).toEqual({ n: 4 });
    expect(sqlite.prepare('select count(*) as n from review_cards').get()).toEqual({ n: 4 });
    expect(sqlite.prepare('select status, score from daily_sessions').get()).toEqual({
      status: 'completed',
      score: 1,
    });

    await press('button', 'Gata');
    expect(await screen.findByText('Scor: 100%', undefined, TIMEOUT)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Începe' })).toBeNull();
  });

  it('explains a wrong answer, links to the topic, and resumes after leaving', async () => {
    await openToday();
    await press('button', 'Începe');
    await answerCurrent({ correctly: false });
    await press('button', 'Recitește topicul');
    expect(
      await screen.findByRole('header', { name: 'Hooks și efecte' }, TIMEOUT),
    ).toBeOnTheScreen();
    await press('button', 'Înapoi');

    await moveOn();
    expect(await screen.findByText('2 / 4', undefined, TIMEOUT)).toBeOnTheScreen();
    await press('button', 'Înapoi');
    expect(await screen.findByText('În lucru 1/4', undefined, TIMEOUT)).toBeOnTheScreen();
    await press('button', 'Continuă');
    expect(await screen.findByText('2 / 4', undefined, TIMEOUT)).toBeOnTheScreen();
  });
});
