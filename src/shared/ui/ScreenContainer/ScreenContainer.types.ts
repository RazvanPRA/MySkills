import type { PropsWithChildren, Ref } from 'react';
import type { ScrollViewInstance } from 'react-native';

export type ScreenContainerProps = PropsWithChildren<{
  /** For scroll-to-top when the content changes (`useScrollToTop`). */
  ref?: Ref<ScrollViewInstance>;
}>;
