// Public API of the backup feature: JSON export / import of the user's data and reset
// (brief §9.8). The card is lazy so the index loads without react-native.
import { lazy } from 'react';

export {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupSchema,
  type Backup,
  type DataFilePort,
  type UserDataSnapshot,
} from './model/backup';
export { createBackup, parseBackup } from './services/backupFile.service';
export type { UserDataRepository } from './repository/UserDataRepository';
export { createLocalUserDataRepository } from './repository/LocalUserDataRepository';
export {
  exportData,
  pickBackup,
  restoreBackup,
  resetData,
  type BackupDependencies,
} from './state/thunks';
export type { DataCardProps } from './components/DataCard/DataCard';

export const DataCard = lazy(() => import('./components/DataCard/DataCard'));
