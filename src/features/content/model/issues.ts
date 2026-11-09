/** Problems found while loading content. The app never crashes on them; CI fails on errors. */
export type ContentIssueCode =
  | 'invalid_pack'
  | 'unsupported_schema_version'
  | 'invalid_category'
  | 'invalid_topic'
  | 'invalid_exercise'
  | 'duplicate_id'
  | 'unknown_category'
  | 'unknown_topic'
  | 'unknown_prerequisite'
  | 'prerequisite_cycle'
  | 'unknown_exercise_type'
  | 'invalid_payload'
  | 'cedilla_diacritics';

export type ContentIssue = {
  code: ContentIssueCode;
  /** `error` fails `content:validate`; `warning` is reported only. */
  severity: 'error' | 'warning';
  packId: string;
  /** Id of the category, topic or exercise concerned, when known. */
  entityId?: string;
  message: string;
  /** True when the entity (or pack) was left out of the catalog. */
  excluded: boolean;
};
