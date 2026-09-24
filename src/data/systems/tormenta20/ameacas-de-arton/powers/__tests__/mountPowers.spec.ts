import { describe, expect, it } from 'vitest';
import {
  GeneralPowerType,
  RequirementType,
} from '../../../../../../interfaces/Poderes';
import AMEACAS_ARTON_POWERS from '..';
import DEUSES_MENORES_POWERS from '../../../deuses-menores/powers';

/**
 * Ameaças de Arton publica quatro poderes de montaria que nunca haviam sido
 * cadastrados. Este teste guarda a presença deles no balde certo e a cadeia de
 * pré-requisitos — inclusive o elo com "Ginete Altivo", o concedido de Hippion
 * que "conta como o poder Ginete".
 */
const allPowers = Object.values(AMEACAS_ARTON_POWERS).flat();
const find = (name: string) => allPowers.find((p) => p.name === name);

describe('poderes de montaria (Ameaças de Arton)', () => {
  it('cadastra os quatro poderes no tipo do livro', () => {
    expect(find('Combate Montado')?.type).toBe(GeneralPowerType.COMBATE);
    expect(find('Resistência Montada')?.type).toBe(GeneralPowerType.COMBATE);
    expect(find('Adestrar Montaria')?.type).toBe(GeneralPowerType.DESTINO);
    expect(find('Dois Como Um')?.type).toBe(GeneralPowerType.DESTINO);
  });

  it('Combate Montado e Dois Como Um exigem Ginete', () => {
    ['Combate Montado', 'Dois Como Um'].forEach((name) => {
      expect(find(name)?.requirements).toEqual([
        [{ type: RequirementType.PODER, name: 'Ginete' }],
      ]);
    });
  });

  it('Resistência Montada pende de Combate Montado, não de Ginete', () => {
    expect(find('Resistência Montada')?.requirements).toEqual([
      [{ type: RequirementType.PODER, name: 'Combate Montado' }],
    ]);
  });

  it('Adestrar Montaria automatiza o +2 em Adestramento', () => {
    const power = find('Adestrar Montaria');
    expect(power?.sheetBonuses).toHaveLength(1);
    expect(power?.sheetBonuses?.[0].modifier).toEqual({
      type: 'Fixed',
      value: 2,
    });
  });

  it('Ginete Altivo (Hippion) conta como Ginete para essa cadeia', () => {
    const gineteAltivo = DEUSES_MENORES_POWERS[
      GeneralPowerType.CONCEDIDOS
    ].find((p) => p.name === 'Ginete Altivo');

    expect(gineteAltivo?.grantsPowerRequirements).toEqual(['Ginete']);
  });
});
