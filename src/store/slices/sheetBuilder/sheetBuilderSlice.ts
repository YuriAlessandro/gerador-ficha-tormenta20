import { combineReducers } from 'redux';
import { sheetBuilderSliceInitialAttributes } from './sheetBuilderSliceInitialAttributes';
import { sheetBuilderSliceRaceDefinition } from './sheetBuilderSliceRaceDefinition';
import { sheetBuilderSliceRoleDefinition } from './sheetBuilderSliceRoleDefinition';
import { sheetBuilderSliceSheetPreview } from './sheetBuilderSliceSheetPreview';
import { sheetBuilderSliceForm } from './sheetBuilderSliceForm';
import { sheetBuilderSliceOriginDefinition } from './sheetBuilderSliceOriginDefinition';
import { sheetBuilderSliceInitialEquipment } from './sheetBuilderSliceInitialEquipment';
import { sheetBuilderSliceStepConfirmed } from './sheetBuilderSliceStepConfirmed';
import { sheetBuilderSliceintelligenceSkills } from './sheetBuilderSliceIntelligenceSkills';
import { sheetBuilderSliceDevotionDefinition } from './sheetBuilderSliceDevotionDefinition';

export const sheetBuilderReducer = combineReducers({
  initialAttributes: sheetBuilderSliceInitialAttributes.reducer,
  race: sheetBuilderSliceRaceDefinition.reducer,
  role: sheetBuilderSliceRoleDefinition.reducer,
  origin: sheetBuilderSliceOriginDefinition.reducer,
  initialEquipment: sheetBuilderSliceInitialEquipment.reducer,
  sheet: sheetBuilderSliceSheetPreview.reducer,
  form: sheetBuilderSliceForm.reducer,
  devotion: sheetBuilderSliceDevotionDefinition.reducer,
  stepConfirmed: sheetBuilderSliceStepConfirmed.reducer,
  intelligenceSkills: sheetBuilderSliceintelligenceSkills.reducer,
});
