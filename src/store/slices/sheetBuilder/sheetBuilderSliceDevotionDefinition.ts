import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedDevotion } from 't20-sheet-builder';
import { RootState } from '@/store';
import { syncSheetBuilder } from './sheetBuilderActions';

export interface SheetBuilderDevotionDefinitionState {
  devotion?: SerializedDevotion;
}

const initialState: SheetBuilderDevotionDefinitionState = {
  devotion: undefined,
};

export const sheetBuilderSliceDevotionDefinition = createSlice({
  name: 'sheetBuilder/devotion',
  initialState,
  reducers: {
    resetDevotion: (state) => {
      state.devotion = undefined;
    },
    submitDevotion: (state, action: PayloadAction<SerializedDevotion>) => {
      state.devotion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.devotion = action.payload.sheet.sheet.devotion.devotion;
    });
  },
});

export const { resetDevotion, submitDevotion } =
  sheetBuilderSliceDevotionDefinition.actions;

export const getStoredDevotion = (state: RootState) =>
  state.sheetBuilder.devotion;

export default sheetBuilderSliceDevotionDefinition;
