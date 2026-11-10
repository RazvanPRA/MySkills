import { useCallback, useEffect, useRef, useState } from 'react';
import { useStudyMapDispatch, useStudyMapSelector } from '../state/hooks';
import { setTopicNotes } from '../state/thunks';

/** Notes are saved this long after the last keystroke, and when the screen closes. */
export const NOTES_SAVE_DELAY_MS = 800;

/** A topic's notes as an editable draft that saves itself (no "Save" button to forget). */
export function useTopicNotes(topicId: string) {
  const dispatch = useStudyMapDispatch();
  const stored = useStudyMapSelector(state => state.studyMap.byTopicId[topicId]?.notes ?? '');
  const [draft, setDraft] = useState(stored);
  const edited = useRef(false);
  const latest = useRef({ draft, stored });
  latest.current = { draft, stored };

  // Progress may load after the screen opens: show it until the user starts typing.
  useEffect(() => {
    if (!edited.current) {
      setDraft(stored);
    }
  }, [stored]);

  useEffect(() => {
    if (!edited.current || draft === stored) {
      return undefined;
    }
    const timer = setTimeout(
      () => dispatch(setTopicNotes({ topicId, notes: draft })),
      NOTES_SAVE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [dispatch, topicId, draft, stored]);

  // Leaving the screen before the delay must not lose the last words.
  useEffect(
    () => () => {
      const { draft: last, stored: saved } = latest.current;
      if (edited.current && last !== saved) {
        dispatch(setTopicNotes({ topicId, notes: last }));
      }
    },
    [dispatch, topicId],
  );

  const change = useCallback((text: string) => {
    edited.current = true;
    setDraft(text);
  }, []);
  return { notes: draft, change };
}
