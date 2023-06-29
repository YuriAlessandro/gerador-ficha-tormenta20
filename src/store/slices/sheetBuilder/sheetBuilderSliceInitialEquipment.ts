import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  MartialWeaponName,
  SerializedSheetEquipment,
  SimpleWeaponName,
} from 't20-sheet-builder';

export type SheetBuilderInitialEquipmentState = {
  simpleWeapon?: SerializedSheetEquipment<SimpleWeaponName>;
  martialWeapon?: SerializedSheetEquipment<MartialWeaponName>;
  armor?: SerializedSheetEquipment;
  money: number;
};

export type SubmitInitialEquipmentAction = PayloadAction<{
  simpleWeapon: SerializedSheetEquipment<SimpleWeaponName>;
  martialWeapon?: SerializedSheetEquipment<MartialWeaponName>;
  armor?: SerializedSheetEquipment;
}>;

const initialState: SheetBuilderInitialEquipmentState = {
  money: 24,
};

export const sheetBuilderSliceInitialEquipment = createSlice({
  name: 'sheetBuilder/initialEquipment',
  initialState,
  reducers: {
    submitInitialEquipment: (state, action: SubmitInitialEquipmentAction) => {
      state.simpleWeapon = action.payload.simpleWeapon;
      state.martialWeapon = action.payload.martialWeapon;
      state.armor = action.payload.armor;
    },
  },
});

export const { submitInitialEquipment } =
  sheetBuilderSliceInitialEquipment.actions;

export default sheetBuilderSliceInitialEquipment;
