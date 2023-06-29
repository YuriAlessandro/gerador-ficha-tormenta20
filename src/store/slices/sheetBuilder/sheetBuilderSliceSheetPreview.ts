import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BuildingSheet,
  OutOfGameContext,
  SerializedSheetInterface,
  SheetSerializer,
} from 't20-sheet-builder';
import { RootState } from '../..';

export interface SheetBuilderSheetPreviewState {
  preview: SerializedSheetInterface;
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
    updatePreview(state, action: PayloadAction<SerializedSheetInterface>) {
      state.preview = action.payload;
    },
  },
});

export const { updatePreview } = sheetBuilderSliceSheetPreview.actions;

export const selectPreviewAttributes = (state: RootState) =>
  state.sheetBuilder.sheet.preview.attributes;
export const selectPreviewDisplacement = (state: RootState) =>
  state.sheetBuilder.sheet.preview.displacement;
export const selectPreviewBuildSteps = (state: RootState) =>
  state.sheetBuilder.sheet.preview.buildSteps;
export const selectPreviewMaxLifePoints = (state: RootState) =>
  state.sheetBuilder.sheet.preview.lifePoints.max;
export const selectPreviewMaxManaPoints = (state: RootState) =>
  state.sheetBuilder.sheet.preview.manaPoints.max;
export const selectPreviewDefense = (state: RootState) =>
  state.sheetBuilder.sheet.preview.defense;
export const selectPreviewRaceName = (state: RootState) =>
  state.sheetBuilder.sheet.preview.race?.name;
export const selectPreviewRoleName = (state: RootState) =>
  state.sheetBuilder.sheet.preview.role?.name;
export const selectPreviewOriginName = (state: RootState) =>
  state.sheetBuilder.sheet.preview.origin?.name;
export const selectPreviewLevel = (state: RootState) =>
  state.sheetBuilder.sheet.preview.level;
export const selectPreviewProficiencies = (state: RootState) =>
  state.sheetBuilder.sheet.preview.proficiencies;
export const selectPreviewSkills = (state: RootState) =>
  state.sheetBuilder.sheet.preview.skills;
export const selectPreviewRaceAbilities = (state: RootState) =>
  state.sheetBuilder.sheet.preview.race?.abilities;
export const selectPreviewRoleAbilities = (state: RootState) =>
  state.sheetBuilder.sheet.preview.role?.abilities;
export const selectPreviewSpells = (state: RootState) =>
  state.sheetBuilder.sheet.preview.spells;
export const selectPreviewGeneralPowers = (state: RootState) =>
  state.sheetBuilder.sheet.preview.generalPowers;
export const selectPreviewOriginPowers = (state: RootState) =>
  state.sheetBuilder.sheet.preview.originPowers;
export const selectPreviewInventory = (state: RootState) =>
  state.sheetBuilder.sheet.preview.equipments;

export default sheetBuilderSliceSheetPreview;
