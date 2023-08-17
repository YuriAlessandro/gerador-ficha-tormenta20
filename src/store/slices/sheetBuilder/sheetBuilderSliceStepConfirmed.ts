import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ReadyTypes = 'confirmed' | 'pending' | 'idle';

export interface SheetBuilderStepConfirmedState {
  isAttrReady: ReadyTypes;
  isRaceReady: ReadyTypes;
  isRoleReady: ReadyTypes;
  isOriginReady: ReadyTypes;
  isDevotionReady: ReadyTypes;
  isIntelligenceSkillsReady: ReadyTypes;
  isEquipmentReady: ReadyTypes;
  isFinalTouchesReady: ReadyTypes;
}

const initialState: SheetBuilderStepConfirmedState = {
  isAttrReady: 'idle',
  isRaceReady: 'idle',
  isRoleReady: 'idle',
  isOriginReady: 'idle',
  isDevotionReady: 'idle',
  isIntelligenceSkillsReady: 'idle',
  isEquipmentReady: 'idle',
  isFinalTouchesReady: 'idle',
};

export const sheetBuilderSliceStepConfirmed = createSlice({
  name: 'sheetBuilder/stepConfirmed',
  initialState,
  reducers: {
    resetOptionsReady: (state) => {
      state.isAttrReady = initialState.isAttrReady;
      state.isRaceReady = initialState.isRaceReady;
      state.isRoleReady = initialState.isRoleReady;
      state.isOriginReady = initialState.isOriginReady;
      state.isDevotionReady = initialState.isDevotionReady;
      state.isIntelligenceSkillsReady = initialState.isIntelligenceSkillsReady;
      state.isEquipmentReady = initialState.isEquipmentReady;
      state.isFinalTouchesReady = initialState.isFinalTouchesReady;
    },
    setOptionReady: (
      state,
      action: PayloadAction<{
        value: ReadyTypes;
        key: keyof SheetBuilderStepConfirmedState;
      }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const selectStepConfirmed =
  (key: keyof SheetBuilderStepConfirmedState) => (state: RootState) =>
    state.sheetBuilder.stepConfirmed[key];

export const { setOptionReady, resetOptionsReady } =
  sheetBuilderSliceStepConfirmed.actions;

export default sheetBuilderSliceStepConfirmed;
