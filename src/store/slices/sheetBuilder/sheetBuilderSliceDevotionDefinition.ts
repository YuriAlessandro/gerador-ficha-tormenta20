import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Devotion } from 't20-sheet-builder';

export interface SheetBuilderDevotionDefinitionState {
  deity?: Devotion;
}

const initialState: SheetBuilderDevotionDefinitionState = {
  deity: undefined,
};

export const sheetBuilderSliceDevotionDefinition = createSlice({
  name: 'sheetBuilder/devotion',
  initialState,
  reducers: {
    resetRace: (state) => {
      state.deity = undefined;
    },
    submitDevotion: (
      state,
      action: PayloadAction<{
        deity: Devotion;
      }>
    ) => {
      state.deity = action.payload.deity;
    },
  },
});

export const { resetRace, submitDevotion } =
  sheetBuilderSliceDevotionDefinition.actions;

export default sheetBuilderSliceDevotionDefinition;
