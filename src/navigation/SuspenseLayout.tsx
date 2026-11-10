import { type ReactNode, Suspense } from 'react';

/**
 * Feature screens are exported lazily (their index.ts must load in Node for content
 * validation), so every navigator wraps its screens in Suspense. In a bundled app the
 * import resolves within a frame; the themed navigator background shows meanwhile.
 */
export const SuspenseLayout = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);
