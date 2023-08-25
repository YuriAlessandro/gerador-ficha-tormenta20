import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedRace } from 't20-sheet-builder';
import { syncSheetBuilder } from './sheetBuilderActions';
import { RootState } from '../..';

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
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.race = action.payload.sheet.sheet.race;
    });
  },
});

export const { resetRace, submitRace } =
  sheetBuilderSliceRaceDefinition.actions;

export const selectSheetBuilderRace = (state: RootState) =>
  state.sheetBuilder.race.race;

export default sheetBuilderSliceRaceDefinition;
