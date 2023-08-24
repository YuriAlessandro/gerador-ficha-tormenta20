import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedCharacter } from 't20-sheet-builder';

export type AttributesDefinitionType = 'dice' | 'points' | 'free';

export type SavedSheet = {
  id: string;
  date: number;
  name: string;
  image: string;
  initialAttributesMethod: AttributesDefinitionType;
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
    storeCharacter: (state, action: PayloadAction<SavedSheet>) => {
      state.sheets[action.payload.id] = action.payload;
    },
    storeSheet: (state, action: PayloadAction<SavedSheet>) => {
      state.sheets[action.payload.id] = action.payload;
    },
    setActiveSheet: (state, action: PayloadAction<string>) => {
      state.activeSheetId = action.payload;
    },
    removeSheet: (state, action: PayloadAction<string>) => {
      state.activeSheetId = '';
      delete state.sheets[action.payload];
    },
  },
});

export const { storeSheet, storeCharacter, setActiveSheet, removeSheet } =
  sheetStorageSlice.actions;

export const selectStoredSheets = (state: RootState) =>
  state.sheetStorage.sheets;

export const selectStoredSheet = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id];

export const selectActiveSheet = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId];

export const selectActiveSheetInitialAttributesMethod = (state: RootState) => {
  const activeSheet = selectActiveSheet(state);
  return activeSheet.initialAttributesMethod;
};

export default sheetStorageSlice;
