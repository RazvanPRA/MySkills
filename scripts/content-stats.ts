/** pnpm content:stats: exercises per category × level × type, to see where content is missing. */
import { exerciseTypeRegistry } from '@/app/registries';
import { buildContentCatalog } from '@/features/content';
import { readPackFiles } from './content/packFiles';
import { computeStats, renderStats } from './content/stats';

const raws = readPackFiles().flatMap(file => (file.ok ? [file.json] : []));
const { catalog, issues } = buildContentCatalog(raws, exerciseTypeRegistry);

console.log(renderStats(computeStats(catalog)));
if (issues.length > 0) {
  console.log(
    `\n${issues.length} content issue(s) excluded from these counts; see pnpm content:validate`,
  );
}
