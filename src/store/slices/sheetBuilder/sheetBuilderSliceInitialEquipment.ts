import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  ArmorName,
  MartialWeaponName,
  SerializedSheetEquipment,
  SimpleWeaponName,
} from 't20-sheet-builder';
import { RootState } from '@/store';
import { syncSheetBuilder } from './sheetBuilderActions';

export type SheetBuilderInitialEquipmentState = {
  simpleWeapon?: SerializedSheetEquipment<SimpleWeaponName>;
  martialWeapon?: SerializedSheetEquipment<MartialWeaponName>;
  armor?: SerializedSheetEquipment<ArmorName>;
  money: number;
};

export type SubmitInitialEquipmentAction = PayloadAction<{
  simpleWeapon: SerializedSheetEquipment<SimpleWeaponName>;
  martialWeapon?: SerializedSheetEquipment<MartialWeaponName>;
  armor?: SerializedSheetEquipment<ArmorName>;
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
  extraReducers(builder) {
    builder.addCase(syncSheetBuilder, (state, action) => {
      const { initialEquipment } = action.payload.sheet.sheet;
      state.simpleWeapon = initialEquipment?.simpleWeapon;
      state.martialWeapon = initialEquipment?.martialWeapon;
      state.armor = initialEquipment?.armor;
      state.money = initialEquipment?.money ?? 24;
    });
  },
});

export const { submitInitialEquipment, resetEquipment } =
  sheetBuilderSliceInitialEquipment.actions;

export const getSheetEquipments = (state: RootState) =>
  state.sheetBuilder.initialEquipment;

export default sheetBuilderSliceInitialEquipment;
