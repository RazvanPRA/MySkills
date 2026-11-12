import { formatShortDate, type Language, type Strings } from '@/shared/i18n';
import { toLocalDate } from '@/shared/utils/localDate';
import type { Backup } from '../model/backup';

/** "Înlocuiești datele … cu copia din 9 nov. (12 topicuri, 30 de teste, 140 de răspunsuri)?" */
export function describeBackup(backup: Backup, strings: Strings, language: Language): string {
  const finished = backup.sessions.filter(session => session.status === 'completed').length;
  const contents = [
    strings.counts.topics(backup.topicProgress.length),
    strings.counts.tests(finished),
    strings.counts.answers(backup.attempts.length),
  ].join(', ');
  const date = formatShortDate(toLocalDate(new Date(backup.exportedAt)), language);
  return strings.backup.importConfirm(date, contents);
}
