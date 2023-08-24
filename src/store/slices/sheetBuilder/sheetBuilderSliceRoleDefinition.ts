import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedRole } from 't20-sheet-builder';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

export interface SheetBuilderRoleDefinitionState {
  role?: SerializedRole;
}

const initialState: SheetBuilderRoleDefinitionState = {
  role: undefined,
};

export const sheetBuilderSliceRoleDefinition = createSlice({
  name: 'sheetBuilder/role',
  initialState,
  reducers: {
    resetRole: (state) => {
      state.role = undefined;
    },
    submitRole: (state, action: PayloadAction<SerializedRole>) => {
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.role = action.payload.sheet.sheet.role;
    });
  },
});

export const { submitRole, resetRole } =
  sheetBuilderSliceRoleDefinition.actions;

export default sheetBuilderSliceRoleDefinition;
