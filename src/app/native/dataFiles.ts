import type { DataFilePort } from '@/features/backup';
import NativeDataFiles from '@/native/specs/NativeDataFiles';

/** Backups are JSON; files coming back from Drive or email may be typed loosely. */
const OPENABLE_TYPES = ['application/json', 'text/plain', 'application/octet-stream'];

const unavailable = () => Promise.reject(new Error('The DataFiles native module is missing'));

/** Backup files through the Android system dialogs (src/native/specs/NativeDataFiles.ts). */
export function createAndroidDataFiles(): DataFilePort {
  const native = NativeDataFiles;
  if (!native) {
    return { saveText: unavailable, openText: unavailable };
  }
  return {
    saveText: ({ fileName, text }) => native.saveText(fileName, 'application/json', text),
    openText: () => native.openText(OPENABLE_TYPES),
  };
}
