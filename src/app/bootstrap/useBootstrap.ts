import { useCallback, useEffect, useState } from 'react';
import type { CatalogBuildResult, ExerciseTypeLookup } from '@/features/content';
import type { AppDependencies } from '../dependencyTypes';
import type { AppDispatch } from '../store';
import { bootstrapApp } from './bootstrapApp';

export type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready'; content: CatalogBuildResult }
  | { status: 'error'; message: string };

type Options = {
  dependencies: AppDependencies;
  dispatch: AppDispatch;
  exerciseTypes: ExerciseTypeLookup;
};

/** Runs the startup sequence once, and again on `retry`. */
export function useBootstrap({ dependencies, dispatch, exerciseTypes }: Options) {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    bootstrapApp({ dependencies, dispatch, exerciseTypes })
      .then(content => active && setState({ status: 'ready', content }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
      );
    return () => {
      active = false;
    };
  }, [dependencies, dispatch, exerciseTypes, attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);
  return { state, retry };
}
