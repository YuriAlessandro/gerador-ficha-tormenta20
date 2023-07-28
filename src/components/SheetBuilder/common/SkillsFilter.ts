import { SerializedSheetSkill } from 't20-sheet-builder';

export const getSkills = (skills: [string, SerializedSheetSkill][]) =>
  skills.filter(([_, skill]) => skill.trainingPoints >= 2).map(([key]) => key);
