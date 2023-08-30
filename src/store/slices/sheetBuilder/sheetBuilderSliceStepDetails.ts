import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { syncSheetBuilder } from './sheetBuilderActions';

export interface SheetBuilderDetailsState {
  name: string;
  image: string;
}

const initialState: SheetBuilderDetailsState = {
  name: '',
  image: '',
};

export const sheetBuilderSliceDetails = createSlice({
  name: 'sheetBuilder/details',
  initialState,
  reducers: {
    setDetails: (
      state,
      action: PayloadAction<{
        name: string;
        image: string;
      }>
    ) => {
      state.name = action.payload.name;
      state.image = action.payload.image;
    },
    resetDetails: (state) => {
      state.name = '';
      state.image = '';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.name = action.payload.sheet.name;
      state.image = action.payload.sheet.image;
    });
  },
});

export const selectPreviewName = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId].name;

export const selectPreviewImage = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId].image;

export const { setDetails, resetDetails } = sheetBuilderSliceDetails.actions;

export default sheetBuilderSliceDetails;
