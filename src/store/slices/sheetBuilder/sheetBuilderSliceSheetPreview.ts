import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BuildingSheet,
  EquipmentName,
  OutOfGameContext,
  SerializedAttack,
  SerializedModifier,
  SerializedSheetInterface,
  SheetSerializer,
} from 't20-sheet-builder';
import { RootState } from '../..';

export interface Attacks {
  name: EquipmentName;
  details: {
    attack: SerializedAttack;
    modifiers: SerializedModifier[];
  };
}

export interface SheetBuilderSheetPreviewState {
  preview: SerializedSheetInterface;
  attacks?: Attacks[];
}

const sheet = new BuildingSheet();
const serializer = new SheetSerializer(new OutOfGameContext());

const initialState: SheetBuilderSheetPreviewState = {
  preview: serializer.serialize(sheet),
};

export const sheetBuilderSliceSheetPreview = createSlice({
  name: 'sheetBuilder/preview',
  initialState,
  reducers: {
    resetSheet(state) {
      state.preview = serializer.serialize(sheet);
    },
    updatePreview(state, action: PayloadAction<SerializedSheetInterface>) {
      state.preview = action.payload;
    },
    updateAttacks(state, action: PayloadAction<Attacks[]>) {
      state.attacks = action.payload;
    },
  },
});

export const { updatePreview, updateAttacks, resetSheet } =
  sheetBuilderSliceSheetPreview.actions;

const selectSheetPreview = (state: RootState) =>
  state.sheetBuilder.sheet.preview;
export const selectSheetAttacks = (state: RootState) =>
  state.sheetBuilder.sheet.attacks;

export const selectPreviewAttributes = (state: RootState) =>
  selectSheetPreview(state).attributes;
export const selectPreviewDisplacement = (state: RootState) =>
  selectSheetPreview(state).displacement;
export const selectPreviewBuildSteps = (state: RootState) =>
  selectSheetPreview(state).buildSteps;
export const selectPreviewMaxLifePoints = (state: RootState) =>
  selectSheetPreview(state).lifePoints.max;
export const selectPreviewMaxManaPoints = (state: RootState) =>
  selectSheetPreview(state).manaPoints.max;
export const selectPreviewDefense = (state: RootState) =>
  selectSheetPreview(state).defense;
export const selectPreviewRaceName = (state: RootState) =>
  selectSheetPreview(state).race?.name;
export const selectPreviewRoleName = (state: RootState) =>
  selectSheetPreview(state).role?.name;
export const selectPreviewOriginName = (state: RootState) =>
  selectSheetPreview(state).origin?.name;
export const selectPreviewLevel = (state: RootState) =>
  selectSheetPreview(state).level;
export const selectPreviewProficiencies = (state: RootState) =>
  selectSheetPreview(state).proficiencies;
export const selectPreviewSkills = (state: RootState) =>
  selectSheetPreview(state).skills;
export const selectPreviewRaceAbilities = (state: RootState) =>
  selectSheetPreview(state).race?.abilities;
export const selectPreviewRoleAbilities = (state: RootState) =>
  selectSheetPreview(state).role?.abilities;
export const selectPreviewSpells = (state: RootState) =>
  selectSheetPreview(state).spells;
export const selectPreviewGeneralPowers = (state: RootState) =>
  selectSheetPreview(state).generalPowers;
export const selectPreviewOriginPowers = (state: RootState) =>
  selectSheetPreview(state).originPowers;
export const selectPreviewGrantedPowers = (state: RootState) =>
  selectSheetPreview(state).grantedPowers;
export const selectPreviewGrantedPowersCount = (state: RootState) =>
  selectSheetPreview(state).grantedPowersCount;
export const selectPreviewInventory = (state: RootState) =>
  selectSheetPreview(state).equipments;
export const selectPreviewDevotion = (state: RootState) =>
  selectSheetPreview(state).devotion;

export default sheetBuilderSliceSheetPreview;
