import { describe, expect, it } from 'vitest';
import { getAllowedClassPowers } from '../../functions/powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CAVALEIRO from '../../data/systems/tormenta20/classes/cavaleiro';
import CAVALEIRO_HEROIS_POWERS from '../../data/systems/tormenta20/herois-de-arton/classPowers/cavaleiro';
import Skill from '../../interfaces/Skills';

const buildCavaleiroSheet = () => {
  const sheet = createMockCharacterSheet();

  sheet.nivel = 3;
  sheet.classe = {
    ...CAVALEIRO,
    powers: [...CAVALEIRO.powers, ...CAVALEIRO_HEROIS_POWERS],
  };
  sheet.skills = sheet.skills.filter((skill) => skill !== Skill.RELIGIAO);
  sheet.completeSkills = sheet.completeSkills?.map((skill) =>
    skill.name === Skill.RELIGIAO ? { ...skill, training: 0 } : skill
  );

  return sheet;
};

const powerNames = (sheet: ReturnType<typeof buildCavaleiroSheet>) =>
  getAllowedClassPowers(sheet, { classLevel: 4 }).map((power) => power.name);

describe('pré-requisitos de perícia em poderes', () => {
  it('não libera Cavaleiro Sagrado sem Religião treinada', () => {
    expect(powerNames(buildCavaleiroSheet())).not.toContain(
      'Cavaleiro Sagrado'
    );
  });

  it('libera Cavaleiro Sagrado quando Religião foi treinada manualmente', () => {
    const sheet = buildCavaleiroSheet();
    sheet.completeSkills = sheet.completeSkills?.map((skill) =>
      skill.name === Skill.RELIGIAO ? { ...skill, training: 2 } : skill
    );

    expect(sheet.skills).not.toContain(Skill.RELIGIAO);
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('não libera pré-requisito quando a perícia base foi destreinada manualmente', () => {
    const sheet = buildCavaleiroSheet();
    sheet.skills = [...sheet.skills, Skill.RELIGIAO];
    sheet.completeSkills = sheet.completeSkills?.map((skill) =>
      skill.name === Skill.RELIGIAO
        ? { ...skill, training: 0, manuallyUntrained: true }
        : skill
    );

    expect(powerNames(sheet)).not.toContain('Cavaleiro Sagrado');
  });
});
