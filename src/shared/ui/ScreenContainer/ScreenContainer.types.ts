import type { PropsWithChildren, Ref } from 'react';
import type { ScrollViewInstance } from 'react-native';

export type ScreenContainerProps = PropsWithChildren<{
  /** For scroll-to-top when the content changes (`useScrollToTop`). */
  ref?: Ref<ScrollViewInstance>;
  /** Stack screens without a tab bar: keep the content above the system navigation bar. */
  bottomInset?: boolean;
}>;
