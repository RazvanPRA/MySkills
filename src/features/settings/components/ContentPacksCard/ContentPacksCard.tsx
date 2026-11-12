import { View } from 'react-native';
import { useContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { AppText, Card } from '@/shared/ui';

/** Installed content packs with their versions (brief §9.8). Read-only. */
export function ContentPacksCard() {
  const { packs } = useContentCatalog();
  const { settings: strings } = useStrings();
  const language = useLanguage();
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {strings.content}
      </AppText>
      {packs.map(pack => (
        <View key={pack.id} accessible>
          <AppText>{resolveText(pack.title, language).text}</AppText>
          <AppText variant="caption" tone="muted">
            {strings.packMeta(pack.version)}
          </AppText>
        </View>
      ))}
    </Card>
  );
}
