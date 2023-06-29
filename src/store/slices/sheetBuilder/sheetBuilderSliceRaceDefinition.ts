import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SheetBuilderStateRace } from './types';

export interface SheetBuilderRaceDefinitionState {
  race?: SheetBuilderStateRace;
}

const initialState: SheetBuilderRaceDefinitionState = {
  race: undefined,
};

export const sheetBuilderSliceRaceDefinition = createSlice({
  name: 'sheetBuilder/race',
  initialState,
  reducers: {
    resetRace: (state) => {
      state.race = undefined;
    },
    submitRace: (state, action: PayloadAction<SheetBuilderStateRace>) => {
      state.race = action.payload;
    },
  },
});

export const { resetRace, submitRace } =
  sheetBuilderSliceRaceDefinition.actions;

export default sheetBuilderSliceRaceDefinition;
