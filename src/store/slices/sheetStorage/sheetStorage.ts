import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedSheetInterface } from 't20-sheet-builder';

export interface SavedSheet {
  id: string;
  sheet: SerializedSheetInterface;
  date: Date;
  name: string;
  image: string;
}

export interface SheetStorageDefinition {
  sheets: SavedSheet[];
  activeSheetId?: string;
}

const initialState: SheetStorageDefinition = {
  sheets: [],
  activeSheetId: undefined,
};

export const sheetStorageSlice = createSlice({
  name: 'sheetBuilder/storage',
  initialState,
  reducers: {
    setSheets: (state, action: PayloadAction<SavedSheet[]>) => {
      state.sheets = action.payload;
    },
    setActiveSheet(state, action: PayloadAction<string>) {
      state.activeSheetId = action.payload;
    },
  },
});

export const selectStoredSheets = (state: RootState) =>
  state.sheetStorage.sheets;

export const selectActiveSheet = (state: RootState) =>
  state.sheetStorage.sheets.find(
    (sheetStored) => sheetStored.id === state.sheetStorage.activeSheetId
  );

export const { setSheets, setActiveSheet } = sheetStorageSlice.actions;

export default sheetStorageSlice;
