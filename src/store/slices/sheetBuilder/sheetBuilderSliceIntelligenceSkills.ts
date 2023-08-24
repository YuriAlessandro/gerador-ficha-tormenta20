import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SkillName } from 't20-sheet-builder';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

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
    resetInteligenceSkills: (state) => {
      state.skills = [];
    },
    submitintelligenceSkills: (
      state,
      action: SubmitintelligenceSkillsAction
    ) => {
      state.skills = action.payload.skills;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.skills = action.payload.sheet.sheet.skills.intelligenceSkills;
    });
  },
});

export const { submitintelligenceSkills, resetInteligenceSkills } =
  sheetBuilderSliceintelligenceSkills.actions;

export default sheetBuilderSliceintelligenceSkills;
