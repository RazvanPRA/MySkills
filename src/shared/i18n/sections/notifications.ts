/** The daily reminder: Settings, onboarding and the notification itself. */
export const notificationsRo = {
  title: 'Memento zilnic',
  help: 'O notificare pe zi, la ora aleasă, care deschide testele de azi.',
  off: 'Oprit',
  on: 'Pornit',
  time: 'Ora',
  stepEarlier: '−15 min',
  stepLater: '+15 min',
  earlier: 'Mai devreme cu 15 minute',
  later: 'Mai târziu cu 15 minute',
  timeLabel: (time: string) => `Ora mementoului: ${time}`,
  denied: 'Notificările sunt blocate pentru Senior Prep. Activează-le din setările telefonului.',
  openSettings: 'Deschide setările',
  notification: {
    title: 'Testele de azi te așteaptă',
    body: 'Câteva minute de logică și de cunoștințe, ca seria să continue.',
    channel: 'Memento zilnic',
  },
};

export const notificationsEn: typeof notificationsRo = {
  title: 'Daily reminder',
  help: "One notification a day, at the time you choose, that opens today's tests.",
  off: 'Off',
  on: 'On',
  time: 'Time',
  stepEarlier: '−15 min',
  stepLater: '+15 min',
  earlier: '15 minutes earlier',
  later: '15 minutes later',
  timeLabel: (time: string) => `Reminder time: ${time}`,
  denied: 'Notifications are blocked for Senior Prep. Turn them on in the phone settings.',
  openSettings: 'Open settings',
  notification: {
    title: "Today's tests are waiting",
    body: 'A few minutes of logic and knowledge to keep your streak going.',
    channel: 'Daily reminder',
  },
};
