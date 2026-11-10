import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './ScreenContainer.styles';
import type { ScreenContainerProps } from './ScreenContainer.types';

const TAB_EDGES = ['top', 'left', 'right'] as const;
const STACK_EDGES = ['top', 'left', 'right', 'bottom'] as const;

/** Scrollable screen body: safe area, background, screen padding and section gap. */
export function ScreenContainer({ children, ref, bottomInset = false }: ScreenContainerProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView edges={bottomInset ? STACK_EDGES : TAB_EDGES} style={styles.safeArea}>
      <ScrollView
        ref={ref}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
