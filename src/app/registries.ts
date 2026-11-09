import { createExerciseTypeRegistry } from '@/features/content';
import { createTestRegistry } from '@/features/daily-tests';

/*
 * The ONLY place where exercise types and test types are registered (brief §6, §11).
 * A new type = one import + one register line here; no other module changes.
 *
 * This file must stay free of react-native imports: `pnpm content:validate` loads it in Node
 * (exercise types load their Renderer lazily for that reason).
 */

export const exerciseTypeRegistry = createExerciseTypeRegistry();
// Phase 2: single_choice, multiple_choice, flashcard_self_graded
// Phase 3: code_output, find_bug, ordering

export const testRegistry = createTestRegistry();
// Phase 2: knowledge · Phase 3: logic
