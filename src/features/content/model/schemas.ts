import { z } from 'zod';
import { contentIdSchema, levelSchema, localizedTextSchema } from '@/shared/domain';

/** Content packs at this schemaVersion are read directly; older ones are migrated first. */
export const CURRENT_CONTENT_SCHEMA_VERSION = 1;

const SEMVER = /^\d+\.\d+\.\d+$/;

export const categorySchema = z.object({
  id: contentIdSchema,
  title: localizedTextSchema,
  /** Optional icon key. Not rendered for now (design system: no decorative icons). */
  icon: z.string().min(1).optional(),
  /** Test kinds this category feeds, e.g. ["knowledge"] or ["logic"]. Keys of the TestRegistry. */
  testKinds: z.array(z.string().min(1)).min(1),
  order: z.number().int(),
});
export type Category = z.infer<typeof categorySchema>;

export const resourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.url(),
});
export type Resource = z.infer<typeof resourceSchema>;

export const topicSchema = z.object({
  id: contentIdSchema,
  categoryId: contentIdSchema,
  title: localizedTextSchema,
  level: levelSchema,
  /** Markdown. */
  summary: localizedTextSchema,
  resources: z.array(resourceSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
  /** Topic ids that should be studied first. */
  prerequisites: z.array(contentIdSchema).default([]),
});
export type Topic = z.infer<typeof topicSchema>;

export const exerciseSourceSchema = z.enum(['pack', 'user', 'ai']);

/** An exercise whose `payload` is still unchecked; the exercise type's schema validates it. */
export const exerciseSchema = z.object({
  id: contentIdSchema,
  /** Key in the ExerciseTypeRegistry. */
  type: z.string().min(1),
  topicId: contentIdSchema,
  level: levelSchema,
  difficulty: z.literal([1, 2, 3, 4, 5]),
  estimatedSeconds: z.number().int().positive(),
  /** Markdown, may contain code blocks. */
  prompt: localizedTextSchema,
  payload: z.unknown(),
  /** Why the answer is correct, pitfalls, where to read more. */
  explanation: localizedTextSchema,
  tags: z.array(z.string().min(1)).default([]),
  source: exerciseSourceSchema.default('pack'),
  version: z.number().int().positive().default(1),
});
export type Exercise<TPayload = unknown> = Omit<z.infer<typeof exerciseSchema>, 'payload'> & {
  payload: TPayload;
};

/** The pack envelope. Entities are validated one by one, so one bad item never drops a pack. */
export const packEnvelopeSchema = z.object({
  id: contentIdSchema,
  version: z.string().regex(SEMVER, 'Expected a semantic version like 1.0.0'),
  schemaVersion: z.literal(CURRENT_CONTENT_SCHEMA_VERSION),
  title: localizedTextSchema,
  categories: z.array(z.unknown()).default([]),
  topics: z.array(z.unknown()).default([]),
  exercises: z.array(z.unknown()).default([]),
});
export type PackEnvelope = z.infer<typeof packEnvelopeSchema>;

export type ContentPack = Omit<PackEnvelope, 'categories' | 'topics' | 'exercises'> & {
  categories: Category[];
  topics: Topic[];
  exercises: Exercise[];
};

export type PackInfo = Pick<ContentPack, 'id' | 'version' | 'schemaVersion' | 'title'>;
