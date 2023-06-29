import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SheetBuilderStateRole } from './types';

export interface SheetBuilderRoleDefinitionState {
  role?: SheetBuilderStateRole;
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
    submitRole: (state, action: PayloadAction<SheetBuilderStateRole>) => {
      state.role = action.payload;
    },
  },
});

export const { submitRole, resetRole } =
  sheetBuilderSliceRoleDefinition.actions;

export default sheetBuilderSliceRoleDefinition;
