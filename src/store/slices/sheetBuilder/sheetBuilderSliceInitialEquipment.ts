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
    resetEquipment: (state) => {
      state.armor = undefined;
      state.simpleWeapon = undefined;
      state.martialWeapon = undefined;
      state.money = 24;
    },
  },
});

export const { submitInitialEquipment, resetEquipment } =
  sheetBuilderSliceInitialEquipment.actions;

export default sheetBuilderSliceInitialEquipment;
