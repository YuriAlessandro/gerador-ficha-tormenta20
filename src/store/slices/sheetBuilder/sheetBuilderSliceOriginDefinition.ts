import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SheetBuilderStateOrigin } from './types';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

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
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.origin = action.payload.sheet.sheet.origin;
    });
  },
});

export const { submitOrigin, resetOrigin } =
  sheetBuilderSliceOriginDefinition.actions;

export default sheetBuilderSliceOriginDefinition;
