import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { logicFixturePack } from './logicFixturePack';
import { seedLogicHistory } from './seedLogicHistory';

const TIMEOUT = { timeout: 5000 };

describe('Today stats', () => {
  it('shows the streak, the 7-day accuracy and the weakest topic to re-read', async () => {
    const { dependencies, sqlite } = await createTestDependencies({ packs: [logicFixturePack] });
    await dependencies.storage.prepare();
    seedLogicHistory(sqlite);
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
