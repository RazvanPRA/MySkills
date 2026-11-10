import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { SessionPlayerState } from './slice';
import type { SessionPlayerDependencies } from './thunks';

type WithSessionPlayer = { sessionPlayer: SessionPlayerState };

/** Typed hooks for this feature's slice; features never import the app's store types. */
export const useSessionPlayerDispatch =
  useDispatch.withTypes<
    ThunkDispatch<WithSessionPlayer, SessionPlayerDependencies, UnknownAction>
  >();
export const useSessionPlayerSelector = useSelector.withTypes<WithSessionPlayer>();

export const selectPlayer = (state: WithSessionPlayer) => state.sessionPlayer;
