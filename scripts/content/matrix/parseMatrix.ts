/**
 * Parses docs/competency-matrix.md. Format:
 *
 *   ## Pack title (`pack-id`)
 *   ### Category title (`category-id`)
 *   | Subiect | Junior | Mid | Senior |
 *   | --- | --- | --- | --- |
 *   | Row title (`row-id`) | junior text | mid text | senior text |
 *   - `row-id`: [Resource](https://...), [Another](https://...)
 *
 * Any other line (H1, paragraphs, blank lines) is ignored. An empty cell or "—" means
 * "no topic at this level".
 */
import { contentIdSchema, levels } from '@/shared/domain';
import type { MatrixCategory, MatrixParseResult, MatrixRow } from './types';

const TITLED_ID = /^(.+?) \(`([^`]+)`\)$/;
const SEPARATOR = /^\|(\s*:?-+:?\s*\|)+$/;
const RESOURCE = /^- `([^`]+)`:(.*)$/;
const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
const NO_TOPIC = new Set(['', '-', '—']);

type State = MatrixParseResult;

const currentPack = (state: State) => state.packs[state.packs.length - 1];

function currentCategory(state: State): MatrixCategory | undefined {
  const categories = currentPack(state)?.categories ?? [];
  return categories[categories.length - 1];
}

/** "Title (`id`)" → { title, id }, or an error message. */
function parseTitledId(text: string): { title: string; id: string } | string {
  const match = TITLED_ID.exec(text.trim());
  if (!match?.[1] || !match[2]) {
    return 'expected "Title (`id`)"';
  }
  return contentIdSchema.safeParse(match[2]).success
    ? { title: match[1].trim(), id: match[2] }
    : `invalid id "${match[2]}" (lowercase letters, digits, "." and "-")`;
}

function startPack(state: State, text: string, line: number) {
  const parsed = parseTitledId(text.slice(3));
  if (typeof parsed === 'string') {
    state.errors.push(`line ${line}: pack heading: ${parsed}`);
  } else if (state.packs.some(pack => pack.id === parsed.id)) {
    state.errors.push(`line ${line}: duplicate pack id "${parsed.id}"`);
  } else {
    state.packs.push({ ...parsed, categories: [] });
  }
}

function startCategory(state: State, text: string, line: number) {
  const parsed = parseTitledId(text.slice(4));
  const pack = currentPack(state);
  const allCategories = state.packs.flatMap(p => p.categories);
  if (typeof parsed === 'string') {
    state.errors.push(`line ${line}: category heading: ${parsed}`);
  } else if (!pack) {
    state.errors.push(`line ${line}: category "${parsed.id}" is outside a pack (## heading)`);
  } else if (allCategories.some(category => category.id === parsed.id)) {
    state.errors.push(`line ${line}: duplicate category id "${parsed.id}"`);
  } else {
    pack.categories.push({ ...parsed, rows: [] });
  }
}

const splitCells = (text: string) =>
  text
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());

const isHeader = (cells: string[]) =>
  cells
    .slice(1)
    .map(cell => cell.toLowerCase())
    .join(',') === levels.join(',');

function toRow(cells: string[]): MatrixRow | string {
  const [titleCell = '', ...levelCells] = cells;
  if (levelCells.length !== levels.length) {
    return `expected ${levels.length + 1} columns, found ${cells.length}`;
  }
  const parsed = parseTitledId(titleCell);
  if (typeof parsed === 'string') {
    return `row title: ${parsed}`;
  }
  const filled = levels.flatMap((level, index) => {
    const text = levelCells[index] ?? '';
    return NO_TOPIC.has(text) ? [] : [[level, text] as const];
  });
  return { ...parsed, cells: Object.fromEntries(filled), resources: [] };
}

function parseTableLine(state: State, text: string, line: number) {
  const category = currentCategory(state);
  const cells = splitCells(text);
  if (SEPARATOR.test(text) || isHeader(cells)) {
    return;
  }
  const row = category ? toRow(cells) : 'table row outside a category (### heading)';
  if (typeof row === 'string') {
    state.errors.push(`line ${line}: ${row}`);
  } else if (category?.rows.some(existing => existing.id === row.id)) {
    state.errors.push(`line ${line}: duplicate row id "${row.id}" in "${category.id}"`);
  } else {
    category?.rows.push(row);
  }
}

function parseResources(state: State, text: string, line: number) {
  const [, rowId = '', rest = ''] = RESOURCE.exec(text) ?? [];
  const row = currentCategory(state)?.rows.find(candidate => candidate.id === rowId);
  const links = [...rest.matchAll(LINK)].map(([, title = '', url = '']) => ({ title, url }));
  if (!row) {
    state.errors.push(`line ${line}: resources for unknown row "${rowId}"`);
  } else if (links.length === 0) {
    state.errors.push(`line ${line}: no [title](https://...) links for "${rowId}"`);
  } else {
    row.resources.push(...links);
  }
}

function parseLine(state: State, text: string, line: number) {
  if (text.startsWith('## ')) {
    startPack(state, text, line);
  } else if (text.startsWith('### ')) {
    startCategory(state, text, line);
  } else if (text.startsWith('|')) {
    parseTableLine(state, text, line);
  } else if (RESOURCE.test(text)) {
    parseResources(state, text, line);
  }
}

export function parseMatrix(markdown: string): MatrixParseResult {
  const state: State = { packs: [], errors: [] };
  markdown.split(/\r?\n/).forEach((text, index) => parseLine(state, text.trimEnd(), index + 1));
  return state;
}
