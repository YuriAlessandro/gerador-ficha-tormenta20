import { createListenerMiddleware } from '@reduxjs/toolkit';
import { AppStartListening } from '..';
import {
  setAttributes,
  setMethod,
} from '../slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { setActiveSheetToBuilder } from '../slices/sheetBuilder/sheetBuilderActions';

export const onActiveSheetChangeMiddleware = createListenerMiddleware();

const startListening =
  onActiveSheetChangeMiddleware.startListening as AppStartListening;

startListening({
  predicate(action) {
    if (typeof action.type !== 'string') {
      return false;
    }

    const shouldTrigger = action.type === 'sheetBuilder/storage/setActiveSheet';
    return shouldTrigger;
  },
  effect: async (action, api) => {
    console.log(action.type, 'Active Sheet Change', action.payload);

    const state = api.getState();
    const { dispatch } = api;
    const activeSheet =
      state.sheetStorage.sheets[state.sheetStorage.activeSheetId];

    dispatch(setActiveSheetToBuilder({ sheet: activeSheet }));
  },
});
