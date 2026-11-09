import type { z } from 'zod';
import type { ContentIssue, ContentIssueCode } from '../../model/issues';
import {
  type Category,
  categorySchema,
  type Exercise,
  exerciseSchema,
  packEnvelopeSchema,
  type PackInfo,
  type Topic,
  topicSchema,
} from '../../model/schemas';
import { migrateContentPack } from '../migrateContentPack.service';
import { formatZodError } from './formatZodError';
import type { Owned, StepResult } from './types';

export type ParsedPack = {
  info: PackInfo;
  categories: Owned<Category>[];
  topics: Owned<Topic>[];
  exercises: Owned<Exercise>[];
};

const idOf = (raw: unknown): string | undefined => {
  const id = (raw as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id : undefined;
};

const packIssue = (packId: string, code: ContentIssueCode, message: string): ContentIssue => ({
  code,
  severity: 'error',
  packId,
  message,
  excluded: true,
});

type ItemSpec<T> = { schema: z.ZodType<T>; code: ContentIssueCode; packId: string };

/** Validates entities one by one, so one bad entity never drops the rest of the pack. */
function parseItems<T>(items: unknown[], spec: ItemSpec<T>): StepResult<Owned<T>> {
  const result: StepResult<Owned<T>> = { values: [], issues: [] };
  items.forEach((raw, index) => {
    const parsed = spec.schema.safeParse(raw);
    if (parsed.success) {
      result.values.push({ packId: spec.packId, value: parsed.data });
      return;
    }
    const entityId = idOf(raw) ?? `#${index}`;
    result.issues.push({
      ...packIssue(spec.packId, spec.code, formatZodError(parsed.error)),
      entityId,
    });
  });
  return result;
}

/** Migrates and validates one raw pack. Returns null when the pack itself is unusable. */
export function parsePack(
  raw: unknown,
  position: number,
): { pack: ParsedPack | null; issues: ContentIssue[] } {
  const packId = idOf(raw) ?? `pack#${position}`;
  const migrated = migrateContentPack(raw);
  if (!migrated.ok) {
    const code =
      migrated.reason === 'newer_than_supported' ? 'unsupported_schema_version' : 'invalid_pack';
    return { pack: null, issues: [packIssue(packId, code, migrated.message)] };
  }
  const envelope = packEnvelopeSchema.safeParse(migrated.pack);
  if (!envelope.success) {
    return {
      pack: null,
      issues: [packIssue(packId, 'invalid_pack', formatZodError(envelope.error))],
    };
  }
  const { categories, topics, exercises, ...info } = envelope.data;
  const id = info.id;
  const cats = parseItems(categories, {
    schema: categorySchema,
    code: 'invalid_category',
    packId: id,
  });
  const tops = parseItems(topics, { schema: topicSchema, code: 'invalid_topic', packId: id });
  const exs = parseItems<Exercise>(exercises, {
    schema: exerciseSchema,
    code: 'invalid_exercise',
    packId: id,
  });
  return {
    pack: { info, categories: cats.values, topics: tops.values, exercises: exs.values },
    issues: [...cats.issues, ...tops.issues, ...exs.issues],
  };
}
