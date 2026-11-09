import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import type { CatalogBuildResult, ExerciseTypeLookup } from '@/features/content';
import { useStrings } from '@/shared/i18n';
import { AppText, Button, Card, ScreenContainer, ScreenHeader } from '@/shared/ui';
import type { AppDependencies } from '../dependencyTypes';
import type { AppDispatch } from '../store';
import { useBootstrap } from './useBootstrap';

type BootstrapGateProps = {
  dependencies: AppDependencies;
  exerciseTypes: ExerciseTypeLookup;
  children: (content: CatalogBuildResult) => ReactNode;
};

/** Renders the app only after storage, settings and content are ready. */
export function BootstrapGate({ dependencies, exerciseTypes, children }: BootstrapGateProps) {
  const dispatch = useDispatch<AppDispatch>();
  const strings = useStrings().bootstrap;
  const { state, retry } = useBootstrap({ dependencies, dispatch, exerciseTypes });

  if (state.status === 'ready') {
    return children(state.content);
  }
  const failed = state.status === 'error';
  return (
    <ScreenContainer>
      <ScreenHeader title={failed ? strings.errorTitle : strings.loadingTitle} />
      <Card>
        <AppText tone="muted" accessibilityLiveRegion="polite">
          {failed ? strings.errorBody(state.message) : strings.loadingBody}
        </AppText>
        {failed ? <Button label={strings.retry} onPress={retry} /> : null}
      </Card>
    </ScreenContainer>
  );
}
