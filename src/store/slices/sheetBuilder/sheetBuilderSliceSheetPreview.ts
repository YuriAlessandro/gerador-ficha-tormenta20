import { Attribute } from 't20-sheet-builder';
import { RootState } from '../..';

export const selectCharacter = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id];
export const selectSheetPreview = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet;
export const selectSheetAttacks = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].attacks;
export const selectPreviewAttributes = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.attributes;
export const selectPreviewAttribute =
  (id: string, attribute: Attribute) => (state: RootState) =>
    state.sheetStorage.sheets[id].sheet.attributes[attribute];
export const selectPreviewDisplacement = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.displacement;
export const selectPreviewBuildSteps = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.buildSteps;
export const selectPreviewMaxLifePoints = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.lifePoints.max;
export const selectPreviewMaxManaPoints = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.manaPoints.max;
export const selectPreviewDefense = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.defense;
export const selectPreviewRaceName = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.race?.name;
export const selectPreviewRoleName = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.role?.name;
export const selectPreviewOriginName = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.origin?.name;
export const selectPreviewLevel = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.level;
export const selectPreviewProficiencies = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.proficiencies;
export const selectPreviewSkills = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.skills.skills;
export const selectPreviewRaceAbilities = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.race?.abilities;
export const selectPreviewRoleAbilities = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.role?.abilities;
export const selectPreviewSpells = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.spells;
export const selectPreviewGeneralPowers = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.generalPowers;
export const selectPreviewOriginPowers = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.originPowers;
export const selectPreviewGrantedPowers = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.grantedPowers;
export const selectPreviewGrantedPowersCount =
  (id: string) => (state: RootState) =>
    state.sheetStorage.sheets[id].sheet.grantedPowersCount;
export const selectPreviewInventory = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.equipments;
export const selectPreviewDevotion = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.devotion;
export const selectPreviewResistances = (id: string) => (state: RootState) =>
  state.sheetStorage.sheets[id].sheet.resistencies;
