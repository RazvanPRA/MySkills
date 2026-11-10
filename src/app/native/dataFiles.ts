import type { DataFilePort } from '@/features/backup';

/** Placeholder until the Android file module lands (next commit): export/import report failure. */
export function createAndroidDataFiles(): DataFilePort {
  const unavailable = () => Promise.reject(new Error('File access is not available yet'));
  return { saveText: unavailable, openText: unavailable };
}
