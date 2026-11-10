import { useCallback, useMemo } from 'react';
import { languages, useStrings } from '@/shared/i18n';
import { knowledgeTestLengths, logicTestLengths } from '../model/userSettings';
import { useSettings } from './useSettings';

const asOptions = (values: readonly number[]) =>
  values.map(value => ({ id: String(value), label: String(value) }));

/** Language, test lengths and timer as segmented-control options, with their handlers. */
export function usePreferences() {
  const { settings, update } = useSettings();
  const { settings: strings } = useStrings();
  const options = useMemo(
    () => ({
      language: languages.map(id => ({ id, label: strings.languageNames[id] })),
      knowledge: asOptions(knowledgeTestLengths),
      logic: asOptions(logicTestLengths),
      timer: [
        { id: 'off', label: strings.off },
        { id: 'on', label: strings.on },
      ],
    }),
    [strings],
  );
  const handlers = {
    language: useCallback(
      (id: string) => {
        const language = languages.find(item => item === id);
        if (language) {
          update({ language });
        }
      },
      [update],
    ),
    knowledge: useCallback(
      (id: string) => {
        const length = knowledgeTestLengths.find(value => String(value) === id);
        if (length) {
          update({ knowledgeTestLength: length });
        }
      },
      [update],
    ),
    logic: useCallback(
      (id: string) => {
        const length = logicTestLengths.find(value => String(value) === id);
        if (length) {
          update({ logicTestLength: length });
        }
      },
      [update],
    ),
    timer: useCallback((id: string) => update({ timerEnabled: id === 'on' }), [update]),
  };
  const values = {
    language: settings.language,
    knowledge: String(settings.knowledgeTestLength),
    logic: String(settings.logicTestLength),
    timer: settings.timerEnabled ? 'on' : 'off',
  };
  return { options, values, handlers };
}
