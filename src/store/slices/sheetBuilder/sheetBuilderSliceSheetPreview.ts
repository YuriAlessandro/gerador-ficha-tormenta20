import { RootState } from '../..';

export const selectCharacter = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId];
export const selectSheetPreview = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId].sheet;
export const selectSheetAttacks = (state: RootState) =>
  state.sheetStorage.sheets[state.sheetStorage.activeSheetId].attacks;
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
  selectSheetPreview(state).skills.skills;
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
export const selectPreviewResistances = (state: RootState) =>
  selectSheetPreview(state).resistencies;
