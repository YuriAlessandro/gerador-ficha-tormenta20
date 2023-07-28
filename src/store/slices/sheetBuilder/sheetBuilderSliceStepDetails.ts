import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SheetBuilderDetailsState {
  name: string;
  url: string;
}

const initialState: SheetBuilderDetailsState = {
  name: '',
  url: '',
};

export const sheetBuilderSliceDetails = createSlice({
  name: 'sheetBuilder/details',
  initialState,
  reducers: {
    setDetails: (
      state,
      action: PayloadAction<{
        name: string;
        url: string;
      }>
    ) => {
      state.name = action.payload.name;
      state.url = action.payload.url;
    },
  },
});

export const selectPreviewName = (state: RootState) =>
  state.sheetBuilder.details.name;

export const selectPreviewImage = (state: RootState) =>
  state.sheetBuilder.details.url;

export const { setDetails } = sheetBuilderSliceDetails.actions;

export default sheetBuilderSliceDetails;
