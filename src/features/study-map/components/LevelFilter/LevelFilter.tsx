import { memo } from 'react';
import { View } from 'react-native';
import { type Level, levels as allLevels } from '@/shared/domain';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { Chip } from '@/shared/ui';
import { createStyles } from './LevelFilter.styles';

type LevelFilterProps = {
  selected: readonly Level[];
  onToggle: (level: string) => void;
};

/** Multi-select level filter: a wrapping row of checkbox Chips (design system §4). */
function LevelFilterBase({ selected, onToggle }: LevelFilterProps) {
  const styles = useThemedStyles(createStyles);
  const { levels, studyMap } = useStrings();
  return (
    <View accessibilityLabel={studyMap.levelFilter} style={styles.row}>
      {allLevels.map(level => (
        <Chip
          key={level}
          id={level}
          label={levels[level]}
          role="checkbox"
          selected={selected.includes(level)}
          onPress={onToggle}
        />
      ))}
    </View>
  );
}

export const LevelFilter = memo(LevelFilterBase);
