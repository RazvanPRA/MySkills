import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { logicFixturePack } from './logicFixturePack';

const TIMEOUT = { timeout: 5000 };

/** Two finished logic tests (Nov 8 and 9) and yesterday's answers: one right, one wrong. */
function seedHistory(sqlite: Awaited<ReturnType<typeof createTestDependencies>>['sqlite']) {
  const session = sqlite.prepare(
    "insert into daily_sessions (id, date, test_kind, exercise_ids, status, score) values (?, ?, 'logic', '[]', 'completed', ?)",
  );
  session.run('s8', '2026-11-08', 1);
  session.run('s9', '2026-11-09', 0.5);
  const attempt = sqlite.prepare(
    "insert into attempts (id, session_id, exercise_id, answer, result, duration_ms, answered_at) values (?, 's9', ?, 'null', ?, 1000, '2026-11-09T12:00:00.000Z')",
  );
  attempt.run('a1', 'logic.trace.mid.q1', JSON.stringify({ correct: true, score: 1 }));
  attempt.run('a2', 'logic.debugging.mid.q1', JSON.stringify({ correct: false, score: 0 }));
}

describe('Today stats', () => {
  it('shows the streak, the 7-day accuracy and the weakest topic to re-read', async () => {
    const { dependencies, sqlite } = await createTestDependencies({ packs: [logicFixturePack] });
    await dependencies.storage.prepare();
    seedHistory(sqlite);
    await render(<AppRoot dependencies={dependencies} />);

    expect(
      await screen.findByLabelText(
        'Serie: 2 zile. Termină testele de azi ca să o continui.',
        undefined,
        TIMEOUT,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Acuratețe 7 zile: 50%. 2 răspunsuri')).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'debugging, De recitit · stăpânire 0% · Logică · Mid' }),
    );
    expect(await screen.findByText('Despre debugging.', undefined, TIMEOUT)).toBeOnTheScreen();
  });

  it('starts at 0 days with no answers on a first run', async () => {
    const { dependencies } = await createTestDependencies({ packs: [logicFixturePack] });
    await dependencies.storage.prepare();
    await render(<AppRoot dependencies={dependencies} />);
    expect(
      await screen.findByLabelText(
        'Serie: 0 zile. Termină testele de azi ca să o continui.',
        undefined,
        TIMEOUT,
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Acuratețe 7 zile: —. Niciun răspuns în ultimele 7 zile.'),
    ).toBeOnTheScreen();
  });
});
