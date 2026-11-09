/**
 * Where content packs come from. Returns raw JSON: validation happens once, in
 * `buildContentCatalog`, whatever the source (bundled today; backend or AI-generated later).
 */
export type ContentRepository = {
  loadPacks: () => Promise<readonly unknown[]>;
};
