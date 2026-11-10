import type { ReactNode } from 'react';
import { useStrings } from '@/shared/i18n';
import { ScreenContainer, ScreenHeader } from '@/shared/ui';
import { ContentPacksCard } from '../components/ContentPacksCard/ContentPacksCard';
import { PreferencesCard } from '../components/PreferencesCard/PreferencesCard';

export type SettingsScreenProps = {
  /** Sections owned by other features (reminder, data), composed by the app. */
  children?: ReactNode;
};

/** Settings (brief §9.8): preferences, other features' sections, installed content. */
export default function SettingsScreen({ children }: SettingsScreenProps) {
  const { screens } = useStrings();
  return (
    <ScreenContainer>
      <ScreenHeader title={screens.settings.title} subtitle={screens.settings.subtitle} />
      <PreferencesCard />
      {children}
      <ContentPacksCard />
    </ScreenContainer>
  );
}
