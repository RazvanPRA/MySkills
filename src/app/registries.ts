import { createExerciseTypeRegistry } from '@/features/content';
import { createTestRegistry } from '@/features/daily-tests';
import { flashcardSelfGraded } from '@/features/exercise-types/flashcard-self-graded';
import { multipleChoice } from '@/features/exercise-types/multiple-choice';
import { singleChoice } from '@/features/exercise-types/single-choice';
import { knowledgeTest } from '@/features/test-definitions/knowledge';

/*
 * The ONLY place where exercise types and test types are registered (brief §6, §11).
 * A new type = one import + one register line here; no other module changes.
 *
 * This file must stay free of react-native imports: `pnpm content:validate` loads it in Node
 * (exercise types load their Renderer lazily for that reason).
 */

export const exerciseTypeRegistry = createExerciseTypeRegistry();
exerciseTypeRegistry.register(singleChoice);
exerciseTypeRegistry.register(multipleChoice);
exerciseTypeRegistry.register(flashcardSelfGraded);
// Phase 3: code_output, find_bug, ordering

export const testRegistry = createTestRegistry();
testRegistry.register(knowledgeTest);
// Phase 3: logic
