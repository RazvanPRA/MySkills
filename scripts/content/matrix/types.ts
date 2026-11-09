import type { Level } from '@/shared/domain';

export type MatrixResource = { title: string; url: string };

/** One matrix row: a subject with an expectation per level. Each filled cell becomes a topic. */
export type MatrixRow = {
  id: string;
  title: string;
  cells: Partial<Record<Level, string>>;
  resources: MatrixResource[];
};

export type MatrixCategory = { id: string; title: string; rows: MatrixRow[] };

export type MatrixPack = { id: string; title: string; categories: MatrixCategory[] };

export type MatrixParseResult = {
  packs: MatrixPack[];
  /** "line 12: ..." messages. Any error means the matrix must not be turned into packs. */
  errors: string[];
};
