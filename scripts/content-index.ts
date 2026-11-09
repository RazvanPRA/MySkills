/**
 * pnpm content:index           regenerates content/packs/index.generated.ts
 * pnpm content:index --check   exits 1 if it is out of date (CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { renderManifest } from './content/manifest';
import { listPackFileNames, MANIFEST_PATH } from './content/packFiles';

const expected = renderManifest(listPackFileNames());
const current = (() => {
  try {
    return readFileSync(MANIFEST_PATH, 'utf8');
  } catch {
    return '';
  }
})();

if (process.argv.includes('--check')) {
  if (current !== expected) {
    console.error('✖ content/packs/index.generated.ts is out of date: run pnpm content:index');
    process.exit(1);
  }
  console.log('✔ Pack manifest is up to date');
} else {
  writeFileSync(MANIFEST_PATH, expected);
  console.log(`✔ Wrote ${MANIFEST_PATH} (${listPackFileNames().length} packs)`);
}
