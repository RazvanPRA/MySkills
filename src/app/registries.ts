import { createExerciseTypeRegistry } from '@/features/content';
import { createTestRegistry } from '@/features/daily-tests';
import { codeOutput } from '@/features/exercise-types/code-output';
import { findBug } from '@/features/exercise-types/find-bug';
import { flashcardSelfGraded } from '@/features/exercise-types/flashcard-self-graded';
import { multipleChoice } from '@/features/exercise-types/multiple-choice';
import { ordering } from '@/features/exercise-types/ordering';
import { singleChoice } from '@/features/exercise-types/single-choice';
import { knowledgeTest } from '@/features/test-definitions/knowledge';
import { logicTest } from '@/features/test-definitions/logic';

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
exerciseTypeRegistry.register(codeOutput);
exerciseTypeRegistry.register(findBug);
exerciseTypeRegistry.register(ordering);

export const testRegistry = createTestRegistry();
// Today shows one card per daily test, in registration order (brief §2: logic, then knowledge).
testRegistry.register(logicTest);
testRegistry.register(knowledgeTest);
