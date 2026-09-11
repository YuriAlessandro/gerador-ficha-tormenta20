import { describe, expect, it } from 'vitest';
import CENTAURO from '../../../data/systems/tormenta20/ameacas-de-arton/races/centauro';
import combatPowers from '../../../data/systems/tormenta20/powers/combatPowers';
import { GeneralPower } from '../../../interfaces/Poderes';
import { createMockCharacterSheet } from '../../../__mocks__/characterSheet';
import { isPowerAvailable } from '../../powers';
import { evaluatePowerRequirements } from '../requirementEvaluation';

/**
 * `bypassPrereqForPowersNamed` passou a ser normalizado para um
 * `PrerequisiteWaiver` (ver `prerequisiteWaivers`). Estes testes usam os dados
 * REAIS do Centauro e de Carga de Cavalaria porque a suíte existente cobria só
 * o formato dos dados e o avaliador do editor — o caminho do motor
 * (`isPowerAvailable`), que é o mais reescrito, não tinha teste.
 */

const CARGA_DE_CAVALARIA = combatPowers.CARGA_DE_CAVALARIA as GeneralPower;

const centauro = () => {
  const sheet = createMockCharacterSheet();
  sheet.raca = CENTAURO as never;
  return sheet;
};

describe('bypass racial normalizado para waiver', () => {
  it('Carga de Cavalaria exige o poder Ginete, que o mock não tem', () => {
    // Guarda da premissa: se o requisito sumisse dos dados, os testes abaixo
    // passariam por motivo errado.
    expect(CARGA_DE_CAVALARIA.requirements).toEqual([
      [{ type: 'PODER', name: 'Ginete' }],
    ]);
    expect(
      isPowerAvailable(createMockCharacterSheet(), CARGA_DE_CAVALARIA)
    ).toBe(false);
  });

  it('o Centauro pega Carga de Cavalaria sem ter Ginete', () => {
    expect(isPowerAvailable(centauro(), CARGA_DE_CAVALARIA)).toBe(true);
  });

  it('o editor concorda com o motor e não lista requisito', () => {
    const result = evaluatePowerRequirements(CARGA_DE_CAVALARIA, {
      sheet: centauro(),
    });

    expect(result.available).toBe(true);
    expect(result.bypassed).toBe(true);
    expect(result.groups).toEqual([]);
  });

  it('não vaza para outros poderes do catálogo', () => {
    const sheet = centauro();
    const vazamentos = Object.values(combatPowers).filter(
      (power) =>
        power.name !== CARGA_DE_CAVALARIA.name &&
        power.requirements.length > 0 &&
        isPowerAvailable(sheet, power) &&
        !isPowerAvailable(createMockCharacterSheet(), power)
    );

    expect(vazamentos).toEqual([]);
  });
});
