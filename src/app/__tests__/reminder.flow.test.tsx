import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createMemoryReminders, createTestDependencies } from '../testing/createTestDependencies';

const TIMEOUT = { timeout: 5000 };

async function openSettings(permission: 'granted' | 'denied' = 'granted') {
  const memory = createMemoryReminders(permission);
  const { dependencies } = await createTestDependencies({ reminders: memory });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Setări'));
  await screen.findByText('Memento zilnic', undefined, TIMEOUT);
  return { calls: memory.calls, settings: () => dependencies.repositories.settings.load() };
}

const lastCall = (calls: ReturnType<typeof createMemoryReminders>['calls']) =>
  calls[calls.length - 1]?.scheduled;

describe('daily reminder', () => {
  it('turns on at 20:00 with Romanian texts and saves the time', async () => {
    const { calls, settings } = await openSettings();
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    expect(
      await screen.findByLabelText('Ora mementoului: 20:00', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    expect(lastCall(calls)).toEqual([
      { hour: 20, minute: 0 },
      {
        title: 'Testele de azi te așteaptă',
        body: 'Câteva minute de logică și de cunoștințe, ca seria să continue.',
        channelName: 'Memento zilnic',
      },
    ]);
    await waitFor(async () => expect((await settings()).notificationTime).toBe('20:00'));
  });

  it('moves the time in 15-minute steps', async () => {
    const { calls } = await openSettings();
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: '+15 min' }, TIMEOUT));
    expect(
      await screen.findByLabelText('Ora mementoului: 20:15', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '−15 min' }));
    await fireEvent.press(screen.getByRole('button', { name: '−15 min' }));
    expect(
      await screen.findByLabelText('Ora mementoului: 19:45', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    expect(lastCall(calls)?.[0]).toEqual({ hour: 19, minute: 45 });
  });

  it('turns off and cancels the notification', async () => {
    const { calls, settings } = await openSettings();
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    await screen.findByLabelText('Ora mementoului: 20:00', undefined, TIMEOUT);
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Oprit' }),
    );
    await waitFor(() => expect(lastCall(calls)).toBeNull());
    expect(screen.queryByLabelText(/Ora mementoului/)).toBeNull();
    await waitFor(async () => expect((await settings()).notificationTime).toBeNull());
  });

  it('explains a blocked permission and stays off', async () => {
    const { calls, settings } = await openSettings('denied');
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    expect(
      await screen.findByText(
        'Notificările sunt blocate pentru Senior Prep. Activează-le din setările telefonului.',
        undefined,
        TIMEOUT,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Deschide setările' })).toBeOnTheScreen();
    expect(calls).toEqual([]);
    expect((await settings()).notificationTime).toBeNull();
  });

  it('re-schedules with English texts after a language change', async () => {
    const { calls } = await openSettings();
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    await screen.findByLabelText('Ora mementoului: 20:00', undefined, TIMEOUT);
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    await waitFor(() =>
      expect(lastCall(calls)?.[1]).toEqual({
        title: "Today's tests are waiting",
        body: 'A few minutes of logic and knowledge to keep your streak going.',
        channelName: 'Daily reminder',
      }),
    );
  });
});
