import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedRace } from 't20-sheet-builder';

export interface SheetBuilderRaceDefinitionState {
  race?: SerializedRace;
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
    submitRace: (state, action: PayloadAction<SerializedRace>) => {
      state.race = action.payload;
    },
  },
});

export const { resetRace, submitRace } =
  sheetBuilderSliceRaceDefinition.actions;

export default sheetBuilderSliceRaceDefinition;
