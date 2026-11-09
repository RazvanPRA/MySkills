/**
 * pnpm content:matrix           regenerates the packs described in docs/competency-matrix.md
 * pnpm content:matrix --check   exits 1 if a pack is out of date with the matrix (CI)
 *
 * The matrix owns each pack's categories and topics. Exercises are written by hand in the
 * pack JSON and are preserved. Packs not in the matrix (e.g. logic-core) are not touched.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import prettier from 'prettier';
import { renderManifest } from './content/manifest';
import { parseMatrix } from './content/matrix/parseMatrix';
import { type ExistingPack, type GeneratedPack, matrixToPacks } from './content/matrix/toPacks';
import { listPackFileNames, MANIFEST_PATH, PACKS_DIR } from './content/packFiles';

const MATRIX_PATH = path.join(__dirname, '..', 'docs', 'competency-matrix.md');
const packPath = (id: string) => path.join(PACKS_DIR, `${id}.json`);

function fail(messages: string[]): never {
  messages.forEach(message => console.error(`✖ ${message}`));
  process.exit(1);
}

function readExisting(ids: string[]): Map<string, ExistingPack> {
  const existing = new Map<string, ExistingPack>();
  for (const id of ids.filter(candidate => existsSync(packPath(candidate)))) {
    try {
      existing.set(id, JSON.parse(readFileSync(packPath(id), 'utf8')) as ExistingPack);
    } catch (error) {
      fail([`${id}.json is not valid JSON, refusing to overwrite it: ${(error as Error).message}`]);
    }
  }
  return existing;
}

function formatJson(pack: GeneratedPack, file: string): string {
  const config = prettier.resolveConfig.sync(file) ?? {};
  return prettier.format(JSON.stringify(pack), { ...config, parser: 'json' });
}

const parsed = parseMatrix(readFileSync(MATRIX_PATH, 'utf8'));
if (parsed.errors.length > 0) {
  fail(parsed.errors.map(error => `docs/competency-matrix.md ${error}`));
}
const existing = readExisting(parsed.packs.map(pack => pack.id));
const packs = matrixToPacks(parsed.packs, existing);

if (process.argv.includes('--check')) {
  const stale = packs.filter(pack => !isDeepStrictEqual(existing.get(pack.id), pack));
  if (stale.length > 0) {
    fail(
      stale.map(pack => `${pack.id}.json is out of date with the matrix: run pnpm content:matrix`),
    );
  }
  console.log(`✔ ${packs.length} packs match docs/competency-matrix.md`);
} else {
  packs.forEach(pack => writeFileSync(packPath(pack.id), formatJson(pack, packPath(pack.id))));
  writeFileSync(MANIFEST_PATH, renderManifest(listPackFileNames()));
  const topics = packs.reduce((sum, pack) => sum + pack.topics.length, 0);
  packs.forEach(pack => console.log(`  ${pack.id} ${pack.version}: ${pack.topics.length} topics`));
  console.log(`✔ Wrote ${packs.length} packs (${topics} topics) and the pack manifest`);
}
