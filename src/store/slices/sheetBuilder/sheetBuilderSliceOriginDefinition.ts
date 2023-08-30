import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SheetBuilderStateOrigin } from './types';
import { syncSheetBuilder } from './sheetBuilderActions';

export interface SheetBuilderOriginDefinitionState {
  origin?: SheetBuilderStateOrigin;
}

const initialState: SheetBuilderOriginDefinitionState = {
  origin: undefined,
};

export const sheetBuilderSliceOriginDefinition = createSlice({
  name: 'sheetBuilder/origin',
  initialState,
  reducers: {
    resetOrigin: (state) => {
      state.origin = undefined;
    },
    submitOrigin: (state, action: PayloadAction<SheetBuilderStateOrigin>) => {
      state.origin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.origin = action.payload.sheet.sheet.origin;
    });
  },
});

export const { submitOrigin, resetOrigin } =
  sheetBuilderSliceOriginDefinition.actions;

export default sheetBuilderSliceOriginDefinition;
