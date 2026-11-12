import type { Category } from '@/features/content';
import type { SelfAssessment } from '@/features/settings';
import { useStrings } from '@/shared/i18n';
import { AppText, Card } from '@/shared/ui';
import { AssessRow } from './AssessRow';

type AssessStepProps = {
  categories: readonly Category[];
  assessment: Readonly<Record<string, SelfAssessment>>;
  onAssess: (categoryId: string, level: SelfAssessment) => void;
};

/** Self-assessment per knowledge area (brief §9.1). */
export function AssessStep({ categories, assessment, onAssess }: AssessStepProps) {
  const { onboarding } = useStrings();
  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {onboarding.assess.title}
      </AppText>
      <AppText variant="small" tone="muted">
        {onboarding.assess.body}
      </AppText>
      {categories.map(category => (
        <AssessRow
          key={category.id}
          category={category}
          value={assessment[category.id] ?? 'none'}
          onChange={onAssess}
        />
      ))}
    </Card>
  );
}
