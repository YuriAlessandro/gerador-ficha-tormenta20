import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../..';

export type SheetBuilderFormState = {
  alert?: {
    message: string;
    type: 'error' | 'success';
  };
};

const initialState: SheetBuilderFormState = {
  alert: undefined,
};

export const sheetBuilderSliceForm = createSlice({
  name: 'sheetBuilder',
  initialState,
  reducers: {
    setFormError: (state, action: PayloadAction<string>) => {
      state.alert = {
        message: action.payload,
        type: 'error',
      };
    },
    setFormSuccess: (state, action: PayloadAction<string>) => {
      state.alert = {
        message: action.payload,
        type: 'success',
      };
    },
    resetFormAlert: (state) => {
      state.alert = undefined;
    },
  },
});

export const { setFormError, resetFormAlert, setFormSuccess } =
  sheetBuilderSliceForm.actions;

export const selectFormAlert = (state: RootState) =>
  state.sheetBuilder.form.alert;

export default sheetBuilderSliceForm;
