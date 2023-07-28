import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SkillName } from 't20-sheet-builder';

export type SheetBuilderIntelligenceSkillsState = {
  skills: SkillName[];
};

export type SubmitintelligenceSkillsAction = PayloadAction<{
  skills: SkillName[];
}>;

const initialState: SheetBuilderIntelligenceSkillsState = {
  skills: [],
};

export const sheetBuilderSliceintelligenceSkills = createSlice({
  name: 'sheetBuilder/intelligenceSkills',
  initialState,
  reducers: {
    submitintelligenceSkills: (
      state,
      action: SubmitintelligenceSkillsAction
    ) => {
      state.skills = action.payload.skills;
    },
  },
});

export const { submitintelligenceSkills } =
  sheetBuilderSliceintelligenceSkills.actions;

export default sheetBuilderSliceintelligenceSkills;
