import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PACKS_DIR = path.join(__dirname, '..', '..', 'content', 'packs');
export const MANIFEST_PATH = path.join(PACKS_DIR, 'index.generated.ts');

export type PackFile =
  | { fileName: string; ok: true; json: unknown }
  | { fileName: string; ok: false; error: string };

export const listPackFileNames = (dir: string = PACKS_DIR): string[] =>
  readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort();

/** Reads every pack; a file with invalid JSON is reported, not thrown. */
export function readPackFiles(dir: string = PACKS_DIR): PackFile[] {
  return listPackFileNames(dir).map(fileName => {
    try {
      return {
        fileName,
        ok: true,
        json: JSON.parse(readFileSync(path.join(dir, fileName), 'utf8')),
      };
    } catch (error) {
      return { fileName, ok: false, error: (error as Error).message };
    }
  });
}
