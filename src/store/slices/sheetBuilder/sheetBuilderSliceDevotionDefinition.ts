import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedDevotion } from 't20-sheet-builder';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

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
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.devotion = action.payload.sheet.sheet.devotion.devotion;
    });
  },
});

export const { resetDevotion, submitDevotion } =
  sheetBuilderSliceDevotionDefinition.actions;

export default sheetBuilderSliceDevotionDefinition;
