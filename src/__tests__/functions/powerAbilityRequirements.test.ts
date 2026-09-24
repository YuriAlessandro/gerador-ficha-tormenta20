import { describe, expect, it } from 'vitest';
import { isPowerAvailable } from '../../functions/powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import LUTADOR from '../../data/systems/tormenta20/classes/lutador';
import combatPowers from '../../data/systems/tormenta20/herois-de-arton/powers/combatPowers';

const buildLutadorSheet = (nivel: number) => {
  const sheet = createMockCharacterSheet();

  sheet.nivel = nivel;
  sheet.classe = {
    ...LUTADOR,
    abilities: LUTADOR.abilities.filter((ability) => ability.nivel <= nivel),
  };

  return sheet;
};

describe('pré-requisitos PODER referenciando habilidades de classe', () => {
  it('libera Briga de Rua para um Lutador com Briga (habilidade automática do 1º nível)', () => {
    const sheet = buildLutadorSheet(3);

    expect(isPowerAvailable(sheet, combatPowers.BRIGA_DE_RUA)).toBe(true);
  });

  it('não libera Briga de Rua antes da habilidade Briga estar disponível', () => {
    const sheet = buildLutadorSheet(3);
    sheet.classe = { ...sheet.classe, abilities: [] };

    expect(isPowerAvailable(sheet, combatPowers.BRIGA_DE_RUA)).toBe(false);
  });
});
