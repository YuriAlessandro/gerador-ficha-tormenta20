import { createListenerMiddleware } from '@reduxjs/toolkit';
import { AppStartListening } from '..';

export const onActiveSheetChangeMiddleware = createListenerMiddleware();

const startListening =
  onActiveSheetChangeMiddleware.startListening as AppStartListening;

startListening({
  predicate(action) {
    if (typeof action.type !== 'string') {
      return false;
    }

    const shouldTrigger = action.type.includes('setActiveSheet');
    return shouldTrigger;
  },
  effect: async (action, api) => {
    console.log(action.type, 'trig tirg');
  },
});
