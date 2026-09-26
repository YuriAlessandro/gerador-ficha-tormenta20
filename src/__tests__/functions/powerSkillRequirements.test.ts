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

const trainReligiao = (sheet: ReturnType<typeof buildCavaleiroSheet>): void => {
  sheet.completeSkills = sheet.completeSkills?.map((skill) =>
    skill.name === Skill.RELIGIAO ? { ...skill, training: 2 } : skill
  );
};

const setDevotion = (
  sheet: ReturnType<typeof buildCavaleiroSheet>,
  deityName: string
): void => {
  sheet.devoto = {
    divindade: { name: deityName, poderes: [] },
    poderes: [],
  };
};

const powerNames = (sheet: ReturnType<typeof buildCavaleiroSheet>) =>
  getAllowedClassPowers(sheet, { classLevel: 4 }).map((power) => power.name);

describe('pré-requisitos de perícia em poderes', () => {
  it('não libera Cavaleiro Sagrado sem Religião treinada', () => {
    expect(powerNames(buildCavaleiroSheet())).not.toContain(
      'Cavaleiro Sagrado'
    );
  });

  it('libera Cavaleiro Sagrado com Religião treinada e devoção válida', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Valkaria');

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

describe('Cavaleiro Sagrado: devoção em divindade que aceita paladinos', () => {
  it('não libera sem devoção', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);

    expect(sheet.devoto).toBeUndefined();
    expect(powerNames(sheet)).not.toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Azgher', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Azgher');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Khalmyr', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Khalmyr');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Lena', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Lena');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Lin-Wu', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Lin-Wu');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Marah', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Marah');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Tanna-Toh', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Tanna-Toh');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Thyatis', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Thyatis');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Valkaria', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Valkaria');
    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('não libera para devoção a Arsenal (não aceita paladinos)', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Arsenal');
    expect(powerNames(sheet)).not.toContain('Cavaleiro Sagrado');
  });

  it('não libera para devoção a Kallyadranoch (não aceita paladinos)', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Kallyadranoch');
    expect(powerNames(sheet)).not.toContain('Cavaleiro Sagrado');
  });

  it('libera para devoção a Nimb com Devoções Abertas', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Nimb');
    sheet.optionalRules = { ...sheet.optionalRules, openDeities: true };

    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });

  it('libera para deus de suplemento/homebrew (fora do panteão)', () => {
    const sheet = buildCavaleiroSheet();
    trainReligiao(sheet);
    setDevotion(sheet, 'Cette');

    expect(powerNames(sheet)).toContain('Cavaleiro Sagrado');
  });
});
