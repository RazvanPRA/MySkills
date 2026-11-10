import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { Chip } from '@/shared/ui';
import { createStyles } from './CategoryTabs.styles';

export type CategoryTab = { id: string; label: string };

type CategoryTabsProps = {
  tabs: readonly CategoryTab[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  accessibilityLabel: string;
};

/** Single-select category picker: Chips with role "tab" inside a tablist (design system §4). */
function CategoryTabsBase({ tabs, selectedId, onSelect, accessibilityLabel }: CategoryTabsProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {tabs.map(tab => (
        <Chip
          key={tab.id}
          id={tab.id}
          label={tab.label}
          role="tab"
          selected={tab.id === selectedId}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}

export const CategoryTabs = memo(CategoryTabsBase);
