import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerializedRole } from 't20-sheet-builder';
import { syncSheetBuilder } from './sheetBuilderActions';
import { RootState } from '../..';

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
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.role = action.payload.sheet.sheet.role;
    });
  },
});

export const { submitRole, resetRole } =
  sheetBuilderSliceRoleDefinition.actions;

export const selectBuilderRole = (state: RootState) =>
  state.sheetBuilder.role.role;

export default sheetBuilderSliceRoleDefinition;
