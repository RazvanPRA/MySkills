import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './Tag.styles';
import type { TagProps } from './Tag.types';

/** Read-only metadata (test kind, level, status). Never pressable: use Chip for that. */
function TagBase({ label }: TagProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.tag}>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

export const Tag = memo(TagBase);
