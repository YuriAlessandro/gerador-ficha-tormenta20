import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedDevotion } from 't20-sheet-builder';

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
    resetRace: (state) => {
      state.devotion = undefined;
    },
    submitDevotion: (state, action: PayloadAction<SerializedDevotion>) => {
      state.devotion = action.payload;
    },
  },
});

export const { resetRace, submitDevotion } =
  sheetBuilderSliceDevotionDefinition.actions;

export default sheetBuilderSliceDevotionDefinition;
