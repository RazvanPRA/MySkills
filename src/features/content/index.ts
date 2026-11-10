// Public API of the content feature. Must stay free of react-native imports:
// `pnpm content:validate` loads it in Node.
export {
  CURRENT_CONTENT_SCHEMA_VERSION,
  categorySchema,
  topicSchema,
  exerciseSchema,
  resourceSchema,
  type Category,
  type Topic,
  type Exercise,
  type Resource,
  type ContentPack,
  type PackInfo,
} from './model/schemas';
export type { ContentCatalog } from './model/catalog';
export type { ContentIssue, ContentIssueCode } from './model/issues';
export type {
  ExerciseTypeDefinition,
  ExerciseRendererProps,
  ExerciseFlow,
  ExerciseTypeLookup,
  ExerciseTypeResolver,
} from './model/exerciseType';
export {
  buildContentCatalog,
  type CatalogBuildResult,
} from './services/buildContentCatalog.service';
export {
  migrateContentPack,
  contentMigrations,
  type ContentMigration,
} from './services/migrateContentPack.service';
export {
  createExerciseTypeRegistry,
  defineExerciseType,
  type ExerciseTypeRegistry,
} from './services/exerciseTypeRegistry';
export type { ContentRepository } from './repository/ContentRepository';
export { createLocalContentRepository } from './repository/LocalContentRepository';
export { ContentProvider, useContentCatalog, useContentIssues } from './components/ContentProvider';
export { ExerciseTypesProvider, useExerciseType } from './components/ExerciseTypesProvider';
