import {
  buildContentCatalog,
  type CatalogBuildResult,
  type ContentIssue,
  type ExerciseTypeLookup,
} from '@/features/content';
import type { PackFile } from './packFiles';

export type ValidationReport = {
  result: CatalogBuildResult;
  /** Problems found before catalog building (unreadable files, id/file mismatch, stale manifest). */
  fileIssues: ContentIssue[];
};

const fileIssue = (packId: string, message: string): ContentIssue => ({
  code: 'invalid_pack',
  severity: 'error',
  packId,
  message,
  excluded: true,
});

/** A pack's id must match its file name, so ids stay unique and easy to find. */
function idMismatch(file: PackFile): ContentIssue[] {
  if (!file.ok) {
    return [fileIssue(file.fileName, `Invalid JSON: ${file.error}`)];
  }
  const id = (file.json as { id?: unknown } | null)?.id;
  const expected = file.fileName.replace(/\.json$/, '');
  return typeof id === 'string' && id !== expected
    ? [
        {
          ...fileIssue(id, `Pack id "${id}" must match its file name "${file.fileName}"`),
          excluded: false,
        },
      ]
    : [];
}

type ValidateInput = {
  files: PackFile[];
  exerciseTypes: ExerciseTypeLookup;
  /** Whether content/packs/index.generated.ts lists exactly these files. */
  manifestUpToDate: boolean;
};

export function validatePacks({
  files,
  exerciseTypes,
  manifestUpToDate,
}: ValidateInput): ValidationReport {
  const raws = files.flatMap(file => (file.ok ? [file.json] : []));
  const fileIssues = files.flatMap(idMismatch);
  if (!manifestUpToDate) {
    fileIssues.push(
      fileIssue('(manifest)', 'index.generated.ts is out of date: run pnpm content:index'),
    );
  }
  return { result: buildContentCatalog(raws, exerciseTypes), fileIssues };
}

export const allIssues = (report: ValidationReport): ContentIssue[] => [
  ...report.fileIssues,
  ...report.result.issues,
];

export function formatIssue(issue: ContentIssue): string {
  const mark = issue.severity === 'error' ? '✖' : '⚠';
  const where = issue.entityId ? `${issue.packId} › ${issue.entityId}` : issue.packId;
  const effect = issue.excluded ? ' (excluded)' : '';
  return `${mark} ${where}: [${issue.code}] ${issue.message}${effect}`;
}

export function summarize(report: ValidationReport): string {
  const { catalog } = report.result;
  const errors = allIssues(report).filter(issue => issue.severity === 'error').length;
  const counts = `${catalog.packs.length} packs, ${catalog.categories.length} categories, ${catalog.topicsById.size} topics, ${catalog.exercisesById.size} exercises`;
  return errors === 0
    ? `✔ Content is valid: ${counts}`
    : `✖ ${errors} error(s). Valid content: ${counts}`;
}
