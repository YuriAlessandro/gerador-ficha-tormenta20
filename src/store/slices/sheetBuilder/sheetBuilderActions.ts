import { createAction } from '@reduxjs/toolkit';
import { SavedSheet } from '../sheetStorage/sheetStorage';

export type SetActiveSheetToBuilderPayload = {
  sheet: SavedSheet;
};

export const syncSheetBuilder = createAction<SetActiveSheetToBuilderPayload>(
  'sheetBuilder/syncSheetBuilder'
);
