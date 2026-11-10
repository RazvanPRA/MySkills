import { useCallback, useMemo, useState } from 'react';
import { useContentCatalog } from '@/features/content';
import type { SelfAssessment } from '@/features/settings';
import { assessableCategories, topicsToMark } from '../services/topicsToMark.service';
import { useOnboardingDispatch } from '../state/hooks';
import { completeOnboarding } from '../state/thunks';

export const ONBOARDING_STEPS = ['welcome', 'assess', 'review', 'reminder'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** The four onboarding steps and the self-assessment being built. */
export function useOnboarding() {
  const catalog = useContentCatalog();
  const dispatch = useOnboardingDispatch();
  const [index, setIndex] = useState(0);
  const [assessment, setAssessment] = useState<Record<string, SelfAssessment>>({});
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => assessableCategories(catalog), [catalog]);
  const markCount = useMemo(() => topicsToMark(catalog, assessment).length, [catalog, assessment]);
  const assess = useCallback(
    (categoryId: string, level: SelfAssessment) =>
      setAssessment(previous => ({ ...previous, [categoryId]: level })),
    [],
  );
  const back = useCallback(() => setIndex(value => Math.max(0, value - 1)), []);
  const next = useCallback(
    () => setIndex(value => Math.min(ONBOARDING_STEPS.length - 1, value + 1)),
    [],
  );
  // Once onboarding is saved, the navigator switches to the tabs by itself.
  const finish = useCallback(async () => {
    setBusy(true);
    await dispatch(completeOnboarding({ catalog, assessment }))
      .unwrap()
      .catch(() => setBusy(false));
  }, [dispatch, catalog, assessment]);

  return {
    step: ONBOARDING_STEPS[index] ?? 'welcome',
    index,
    total: ONBOARDING_STEPS.length,
    categories,
    assessment,
    assess,
    markCount,
    back,
    next,
    finish,
    busy,
  };
}
