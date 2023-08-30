import { SerializedSheetSkill } from 't20-sheet-builder';

export const getSkills = (skills: [string, SerializedSheetSkill][]) =>
  skills.filter(([_, skill]) => skill.isTrained).map(([key]) => key);
