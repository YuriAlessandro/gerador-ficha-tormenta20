import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';

export function addOtherBonusToSkill(
  sheet: CharacterSheet,
  skill: Skill,
  value: number
) {
  if (
    !sheet.completeSkills?.some((currentSkill) => currentSkill.name === skill)
  ) {
    sheet.completeSkills = [
      ...(sheet.completeSkills || []),
      { name: skill, others: value, countAsTormentaPower: true },
    ];
  } else {
    sheet.completeSkills = Object.values(sheet.completeSkills || {}).map(
      (currentSkill) => {
        if (currentSkill.name === skill) {
          return {
            ...currentSkill,
            others: (currentSkill.others || 0) + value,
            countAsTormentaPower: true,
          };
        }
        return currentSkill;
      }
    );
  }
}
