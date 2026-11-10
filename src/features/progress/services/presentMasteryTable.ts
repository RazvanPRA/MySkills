import type { ContentCatalog } from '@/features/content';
import { type Level, resolveText } from '@/shared/domain';
import type { Language, Strings } from '@/shared/i18n';
import type { HeatmapCell, HeatmapRow } from './buildHeatmap.service';

export type MasteryCellModel = {
  level: Level;
  percent: number | null;
  text: string;
  label: string;
};

export type MasteryRowModel = {
  categoryId: string;
  title: string;
  cells: MasteryCellModel[];
  estimatedText: string;
  estimatedLabel: string;
};

type Context = {
  catalog: ContentCatalog;
  strings: Strings;
  language: Language;
  /** Onboarding self-assessment by category id ('none' or a level). */
  selfAssessment?: Readonly<Record<string, string>>;
};

/** "Autoevaluare: Senior" after the estimate, when the user rated the category. */
function selfAssessedText(categoryId: string, { strings, selfAssessment }: Context): string | null {
  const level = selfAssessment?.[categoryId];
  return level && level !== 'none'
    ? strings.progress.matrix.selfAssessed(strings.levels[level as Level])
    : null;
}

function cellModel(cell: HeatmapCell, category: string, { strings }: Context): MasteryCellModel {
  const { matrix } = strings.progress;
  const level = strings.levels[cell.level];
  if (cell.topicCount === 0 || cell.mastery === null) {
    const why = cell.topicCount === 0 ? matrix.noExercises : matrix.notStarted;
    return {
      level: cell.level,
      percent: null,
      text: matrix.empty,
      label: matrix.cellLabel(category, level, why),
    };
  }
  const text = `${cell.mastery}%`;
  return {
    level: cell.level,
    percent: cell.mastery,
    text,
    label: matrix.cellLabel(category, level, text),
  };
}

function estimatedText(row: HeatmapRow, { strings }: Context): string {
  if (row.estimatedLevel) {
    return strings.levels[row.estimatedLevel];
  }
  const practised = row.cells.some(cell => cell.mastery !== null);
  return practised ? strings.progress.matrix.belowJunior : strings.progress.matrix.empty;
}

/** The heatmap as text: every cell has its percentage and a full label (design system §6.3). */
export function presentMasteryTable(
  rows: readonly HeatmapRow[],
  context: Context,
): MasteryRowModel[] {
  return rows.map(row => {
    const category = context.catalog.categoriesById.get(row.categoryId);
    const title = category ? resolveText(category.title, context.language).text : row.categoryId;
    const estimated = estimatedText(row, context);
    const self = selfAssessedText(row.categoryId, context);
    return {
      categoryId: row.categoryId,
      title,
      cells: row.cells.map(cell => cellModel(cell, title, context)),
      estimatedText: [`${context.strings.progress.matrix.estimated}: ${estimated}`, self]
        .filter(Boolean)
        .join(' · '),
      estimatedLabel: [context.strings.progress.matrix.estimatedLabel(title, estimated), self]
        .filter(Boolean)
        .join(', '),
    };
  });
}
