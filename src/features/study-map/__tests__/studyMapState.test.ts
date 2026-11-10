import { configureStore } from '@reduxjs/toolkit';
import { fixedClock } from '@/shared/utils/clock';
import type { TopicProgress } from '../model/topicProgress';
import type { TopicProgressRepository } from '../repository/TopicProgressRepository';
import { changeTopicStatus } from '../services/changeTopicStatus.service';
import { selectStudyMapStatus, selectTopicStatus } from '../state/selectors';
import { studyMapReducer } from '../state/slice';
import { loadTopicProgress, setTopicStatus } from '../state/thunks';

const NOW = '2026-11-10T08:00:00.000Z';
const EARLIER = '2026-11-01T08:00:00.000Z';

describe('changeTopicStatus', () => {
  it('stamps updatedAt and the first studiedAt', () => {
    expect(changeTopicStatus({ topicId: 't', status: 'studied', now: new Date(NOW) })).toEqual({
      topicId: 't',
      status: 'studied',
      studiedAt: NOW,
      updatedAt: NOW,
    });
  });

  it('keeps the original studiedAt and the notes', () => {
    const previous: TopicProgress = {
      topicId: 't',
      status: 'studied',
      studiedAt: EARLIER,
      notes: 'De recitit',
      updatedAt: EARLIER,
    };
    expect(
      changeTopicStatus({ topicId: 't', status: 'studied', previous, now: new Date(NOW) }),
    ).toEqual({
      ...previous,
      updatedAt: NOW,
    });
  });

  it('clears studiedAt when the topic goes back to in progress', () => {
    const previous: TopicProgress = {
      topicId: 't',
      status: 'studied',
      studiedAt: EARLIER,
      updatedAt: EARLIER,
    };
    expect(
      changeTopicStatus({ topicId: 't', status: 'in_progress', previous, now: new Date(NOW) }),
    ).toEqual({ topicId: 't', status: 'in_progress', updatedAt: NOW });
  });
});

describe('study map state', () => {
  function setup(stored: TopicProgress[] = [], getAll?: TopicProgressRepository['getAll']) {
    const saved: TopicProgress[] = [];
    const topicProgress: TopicProgressRepository = {
      getAll: getAll ?? (async () => stored),
      get: async () => null,
      save: async entry => {
        saved.push(entry);
      },
    };
    const store = configureStore({
      reducer: { studyMap: studyMapReducer },
      middleware: getDefault =>
        getDefault({
          thunk: { extraArgument: { clock: fixedClock(NOW), repositories: { topicProgress } } },
        }),
    });
    return { store, saved };
  }

  it('loads stored progress; untouched topics are not started', async () => {
    const { store } = setup([{ topicId: 'a', status: 'in_progress', updatedAt: EARLIER }]);
    expect(selectStudyMapStatus(store.getState())).toBe('idle');
    await store.dispatch(loadTopicProgress());
    expect(selectStudyMapStatus(store.getState())).toBe('ready');
    expect(selectTopicStatus(store.getState(), 'a')).toBe('in_progress');
    expect(selectTopicStatus(store.getState(), 'b')).toBe('not_started');
  });

  it('saves a status change and reflects it in the state', async () => {
    const { store, saved } = setup();
    await store.dispatch(setTopicStatus({ topicId: 'b', status: 'studied' }));
    expect(saved).toEqual([{ topicId: 'b', status: 'studied', studiedAt: NOW, updatedAt: NOW }]);
    expect(selectTopicStatus(store.getState(), 'b')).toBe('studied');
  });

  it('marks the load as failed when the repository throws', async () => {
    const { store } = setup([], () => Promise.reject(new Error('disk')));
    await store.dispatch(loadTopicProgress());
    expect(selectStudyMapStatus(store.getState())).toBe('error');
  });
});
