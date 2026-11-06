import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import racePowers from '../../data/systems/tormenta20/herois-de-arton/powers/racePowers';
import MEIO_ELFO from '../../data/systems/tormenta20/herois-de-arton/races/meioElfo';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

/**
 * Citadino (Heróis de Arton): "+2 em testes de perícias baseadas em Carisma
 * (exceto Adestramento)". Era texto puro — o bônus não somava na ficha.
 */
const others = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

const buildSheet = (withCitadino: boolean): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.raca = _.cloneDeep(MEIO_ELFO);
  sheet.generalPowers = withCitadino ? [_.cloneDeep(racePowers.CITADINO)] : [];
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  return recalculateSheet(sheet);
};

describe('Citadino', () => {
  it('soma +2 nas perícias de Carisma, exceto Adestramento', () => {
    const base = buildSheet(false);
    const citadino = buildSheet(true);

    [
      Skill.ATUACAO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.INTIMIDACAO,
      Skill.JOGATINA,
    ].forEach((skill) => {
      expect(others(citadino, skill) - others(base, skill)).toBe(2);
    });
    expect(others(citadino, Skill.ADESTRAMENTO)).toBe(
      others(base, Skill.ADESTRAMENTO)
    );
  });

  it('acumula com Entre Dois Mundos do Meio-Elfo', () => {
    const sheet = buildSheet(true);
    expect(others(sheet, Skill.DIPLOMACIA)).toBe(3);
    expect(others(sheet, Skill.ADESTRAMENTO)).toBe(1);
  });

  it('ficha salva com a cópia antiga (sem bônus) é refrescada', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [_.omit(racePowers.CITADINO, 'sheetBonuses')];

    normalizeSheet(sheet);
    const power = sheet.generalPowers.find((p) => p.name === 'Citadino');
    expect(power?.sheetBonuses).toHaveLength(5);
  });
});
