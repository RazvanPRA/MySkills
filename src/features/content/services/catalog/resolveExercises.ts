import type { ExerciseTypeLookup } from '../../model/exerciseType';
import type { ContentIssue, ContentIssueCode } from '../../model/issues';
import type { Exercise } from '../../model/schemas';
import { formatZodError } from './formatZodError';
import type { Owned, StepResult } from './types';

const excluded = (
  item: Owned<Exercise>,
  code: ContentIssueCode,
  message: string,
): ContentIssue => ({
  code,
  severity: 'error',
  packId: item.packId,
  entityId: item.value.id,
  message,
  excluded: true,
});

/** Checks one exercise; returns the exercise with its parsed payload, or the reason it is excluded. */
function resolveExercise(
  item: Owned<Exercise>,
  topicIds: ReadonlySet<string>,
  exerciseTypes: ExerciseTypeLookup,
): Owned<Exercise> | ContentIssue {
  const { value } = item;
  if (!topicIds.has(value.topicId)) {
    return excluded(item, 'unknown_topic', `Unknown topicId "${value.topicId}"`);
  }
  const definition = exerciseTypes.get(value.type);
  if (!definition) {
    return excluded(item, 'unknown_exercise_type', `Unknown exercise type "${value.type}"`);
  }
  const payload = definition.payloadSchema.safeParse(value.payload);
  if (!payload.success) {
    return excluded(item, 'invalid_payload', formatZodError(payload.error));
  }
  return { packId: item.packId, value: { ...value, payload: payload.data } };
}

/** Keeps exercises with a known topic, a registered type and a payload that passes its schema. */
export function resolveExercises(
  exercises: Owned<Exercise>[],
  topicIds: ReadonlySet<string>,
  exerciseTypes: ExerciseTypeLookup,
): StepResult<Owned<Exercise>> {
  const result: StepResult<Owned<Exercise>> = { values: [], issues: [] };
  for (const item of exercises) {
    const resolved = resolveExercise(item, topicIds, exerciseTypes);
    if ('code' in resolved) {
      result.issues.push(resolved);
    } else {
      result.values.push(resolved);
    }
  }
  return result;
}
