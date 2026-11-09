import { createContext, type PropsWithChildren, useContext } from 'react';
import type { CatalogBuildResult } from '../../services/buildContentCatalog.service';

const ContentContext = createContext<CatalogBuildResult | null>(null);

type ContentProviderProps = PropsWithChildren<{ value: CatalogBuildResult }>;

/**
 * Holds the validated catalog. It lives in context, not Redux: it is large, immutable and
 * indexed with Maps, while the store keeps only the user's source data.
 */
export function ContentProvider({ value, children }: ContentProviderProps) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContentContext(): CatalogBuildResult {
  const value = useContext(ContentContext);
  if (!value) {
    throw new Error('useContentCatalog must be used inside <ContentProvider>');
  }
  return value;
}

export const useContentCatalog = () => useContentContext().catalog;

/** Content problems found at load time (shown in Settings, Phase 4). */
export const useContentIssues = () => useContentContext().issues;
