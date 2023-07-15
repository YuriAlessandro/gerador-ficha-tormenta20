import {
  AnyAction,
  ListenerEffectAPI,
  Dispatch as ReduxDispatch,
} from '@reduxjs/toolkit';

export const takeLatest = async <
  State,
  Dispatch extends ReduxDispatch<AnyAction>,
  ExtraArgument = unknown
>(
  listenerApi: ListenerEffectAPI<State, Dispatch, ExtraArgument>
) => {
  listenerApi.cancelActiveListeners();

  // Delay before starting actual work
  await listenerApi.delay(200);
};
