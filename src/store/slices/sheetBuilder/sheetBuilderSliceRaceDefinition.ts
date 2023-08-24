import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedRace } from 't20-sheet-builder';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

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
  extraReducers: (builder) => {
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.race = action.payload.sheet.sheet.race;
    });
  },
});

export const { resetRace, submitRace } =
  sheetBuilderSliceRaceDefinition.actions;

export default sheetBuilderSliceRaceDefinition;
