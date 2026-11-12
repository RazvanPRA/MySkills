import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentCatalog } from '@/features/content';
import {
  type SelfAssessment,
  type SettingsDependencies,
  type SettingsState,
  updateSettings,
} from '@/features/settings';
import {
  markTopicsStudied,
  type StudyMapDependencies,
  type StudyMapState,
} from '@/features/study-map';
import { topicsToMark } from '../services/topicsToMark.service';

type ThunkConfig = {
  extra: SettingsDependencies & StudyMapDependencies;
  state: { settings: SettingsState; studyMap: StudyMapState };
};

/**
 * Finishes onboarding (brief §9.1): marks the topics the self-assessment covers, saves the
 * assessment, and only then flags onboarding as done, so an interrupted run starts again.
 */
export const completeOnboarding = createAsyncThunk<
  void,
  { catalog: ContentCatalog; assessment: Record<string, SelfAssessment> },
  ThunkConfig
>('onboarding/complete', async ({ catalog, assessment }, { dispatch }) => {
  await dispatch(markTopicsStudied(topicsToMark(catalog, assessment))).unwrap();
  await dispatch(updateSettings({ selfAssessment: assessment, onboardingDone: true })).unwrap();
});
