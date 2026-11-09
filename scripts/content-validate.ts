/**
 * pnpm content:validate: validates every pack in content/packs with the app's own rules
 * (zod schemas, references, duplicate ids, registered exercise types and their payload
 * schemas, diacritics) and checks the pack manifest. Exits 1 on any error. Runs in CI.
 */
import { readFileSync } from 'node:fs';
import { exerciseTypeRegistry } from '@/app/registries';
import { renderManifest } from './content/manifest';
import { listPackFileNames, MANIFEST_PATH, readPackFiles } from './content/packFiles';
import { allIssues, formatIssue, summarize, validatePacks } from './content/validation';

const manifestUpToDate =
  readFileSync(MANIFEST_PATH, 'utf8') === renderManifest(listPackFileNames());

const report = validatePacks({
  files: readPackFiles(),
  exerciseTypes: exerciseTypeRegistry,
  manifestUpToDate,
});

const issues = allIssues(report);
issues.forEach(issue => console.log(formatIssue(issue)));
console.log(summarize(report));
console.log(`Registered exercise types: ${exerciseTypeRegistry.keys().join(', ') || '(none yet)'}`);

process.exit(issues.some(issue => issue.severity === 'error') ? 1 : 0);
