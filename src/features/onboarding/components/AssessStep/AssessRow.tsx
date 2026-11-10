import { memo, useCallback, useMemo } from 'react';
import type { Category } from '@/features/content';
import type { SelfAssessment } from '@/features/settings';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { SegmentedControl, SetupRow } from '@/shared/ui';

type AssessRowProps = {
  category: Category;
  value: SelfAssessment;
  onChange: (categoryId: string, level: SelfAssessment) => void;
};

/** One area: Nou / Junior / Mid / Senior. */
function AssessRowBase({ category, value, onChange }: AssessRowProps) {
  const { levels, onboarding } = useStrings();
  const language = useLanguage();
  const title = resolveText(category.title, language).text;
  const options = useMemo(
    () => [
      { id: 'none' as const, label: onboarding.assess.none },
      { id: 'junior' as const, label: levels.junior },
      { id: 'mid' as const, label: levels.mid },
      { id: 'senior' as const, label: levels.senior },
    ],
    [levels, onboarding],
  );
  const change = useCallback(
    (level: SelfAssessment) => onChange(category.id, level),
    [onChange, category.id],
  );
  return (
    <SetupRow label={title}>
      <SegmentedControl
        options={options}
        value={value}
        onChange={change}
        accessibilityLabel={title}
      />
    </SetupRow>
  );
}

export const AssessRow = memo(AssessRowBase);
