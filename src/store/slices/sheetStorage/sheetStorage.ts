import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SerializedCharacter,
  SerializedSheetInterface,
} from 't20-sheet-builder';

export type AttributesDefinitionType = 'dice' | 'points' | 'free';

export const MAX_CHARACTERS_LIMIT = 100;

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
      const currentCount = Object.keys(state.sheets).length;
      const isUpdating = action.payload.id in state.sheets;

      if (!isUpdating && currentCount >= MAX_CHARACTERS_LIMIT) {
        // Se não está atualizando e já atingiu o limite, não adiciona
        return;
      }

      state.sheets[action.payload.id] = action.payload;
    },
    storeSheet: (state, action: PayloadAction<SavedSheet>) => {
      const currentCount = Object.keys(state.sheets).length;
      const isUpdating = action.payload.id in state.sheets;

      if (!isUpdating && currentCount >= MAX_CHARACTERS_LIMIT) {
        // Se não está atualizando e já atingiu o limite, não adiciona
        return;
      }

      state.sheets[action.payload.id] = action.payload;
    },
    setActiveSheet: (state, action: PayloadAction<string>) => {
      state.activeSheetId = action.payload;
      // Only update date if sheet exists in local storage
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
    updateSheetData: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<SerializedSheetInterface>;
      }>
    ) => {
      const sheet = state.sheets[action.payload.id];
      if (sheet && sheet.sheet) {
        sheet.sheet = { ...sheet.sheet, ...action.payload.updates };
        sheet.date = new Date().getTime();
      }
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
  updateSheetData,
} = sheetStorageSlice.actions;

export const selectStoredSheets = (state: RootState) =>
  state.sheetStorage.sheets;

export const selectStoredSheet = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id];

export const selectActiveSheetId = (state: RootState) =>
  state.sheetStorage.activeSheetId;

export const selectActiveSheet = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId];

export const selectSheetsCount = (state: RootState) =>
  Object.keys(state.sheetStorage.sheets).length;

export const selectCanCreateNewSheet = (state: RootState) =>
  Object.keys(state.sheetStorage.sheets).length < MAX_CHARACTERS_LIMIT;

export default sheetStorageSlice;
