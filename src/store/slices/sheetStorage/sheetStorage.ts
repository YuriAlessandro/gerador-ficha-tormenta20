import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SerializedCharacter,
  SerializedSheetInterface,
} from 't20-sheet-builder';

export type AttributesDefinitionType = 'dice' | 'points' | 'free';

export type SavedSheet = {
  id: string;
  date: number;
  name: string;
  image: string;
  form: {
    initialAttributes: {
      method: AttributesDefinitionType;
      remainingPoints?: number;
    };
  };
  sheet: SerializedCharacter['sheet'];
} & Partial<SerializedCharacter>;

export interface SheetStorageDefinition {
  sheets: Record<string, SavedSheet>;
  activeSheetId: string;
}

const initialState: SheetStorageDefinition = {
  sheets: {},
  activeSheetId: '',
};

export const sheetStorageSlice = createSlice({
  name: 'sheetBuilder/storage',
  initialState,
  reducers: {
    createNewSheet: (
      state,
      action: PayloadAction<{ id: string; sheet: SerializedSheetInterface }>
    ) => {
      state.sheets[action.payload.id] = {
        id: action.payload.id,
        sheet: action.payload.sheet,
        date: new Date().getTime(),
        name: '',
        image: '',
        form: {
          initialAttributes: {
            method: 'dice',
          },
        },
      };
    },
    storeCharacter: (state, action: PayloadAction<SavedSheet>) => {
      state.sheets[action.payload.id] = action.payload;
    },
    storeSheet: (state, action: PayloadAction<SavedSheet>) => {
      state.sheets[action.payload.id] = action.payload;
    },
    setActiveSheet: (state, action: PayloadAction<string>) => {
      state.activeSheetId = action.payload;
      if (state.sheets[action.payload]) {
        state.sheets[action.payload].date = new Date().getTime();
      }
    },
    removeSheet: (state, action: PayloadAction<string>) => {
      state.activeSheetId = '';
      delete state.sheets[action.payload];
    },
    updateSheetDate: (
      state,
      action: PayloadAction<{ id: string; date: number }>
    ) => {
      state.sheets[action.payload.id].date = action.payload.date;
    },
  },
});

export const {
  storeSheet,
  storeCharacter,
  setActiveSheet,
  removeSheet,
  updateSheetDate,
  createNewSheet,
} = sheetStorageSlice.actions;

export const selectStoredSheets = (state: RootState) =>
  state.sheetStorage.sheets;

export const selectStoredSheet = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id];

export const selectActiveSheetId = (state: RootState) =>
  state.sheetStorage.activeSheetId;

export const selectActiveSheet = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId];

export default sheetStorageSlice;
