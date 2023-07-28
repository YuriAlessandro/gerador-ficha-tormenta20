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

export const { setOptionReady } = sheetBuilderSliceStepConfirmed.actions;

export default sheetBuilderSliceStepConfirmed;
