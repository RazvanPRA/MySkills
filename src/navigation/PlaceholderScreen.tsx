import { type Strings, useStrings } from '@/shared/i18n';
import { AppText, Card, ScreenContainer, ScreenHeader } from '@/shared/ui';

export type PlaceholderSection = keyof Strings['screens'];

type PlaceholderScreenProps = {
  section: PlaceholderSection;
  /** Delivery phase that replaces this placeholder with the real feature screen. */
  phase: number;
};

/** Temporary tab content until each feature ships its own screen. */
export function PlaceholderScreen({ section, phase }: PlaceholderScreenProps) {
  const strings = useStrings();
  const { title, subtitle } = strings.screens[section];
  return (
    <ScreenContainer>
      <ScreenHeader title={title} subtitle={subtitle} />
      <Card>
        <AppText variant="small" tone="muted">
          {strings.placeholder.availableInPhase(phase)}
        </AppText>
      </Card>
    </ScreenContainer>
  );
}
