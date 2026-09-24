import { describe, expect, it } from 'vitest';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../../interfaces/Poderes';
import { Atributo } from '../../../atributos';
import AMEACAS_ARTON_POWERS from '..';
import { recalculateSheet } from '../../../../../../functions/recalculateSheet';
import { createMockCharacterSheet } from '../../../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../../../interfaces/CharacterSheet';

const find = (name: string) =>
  Object.values(AMEACAS_ARTON_POWERS)
    .flat()
    .find((p) => p.name === name);

/**
 * O poder promete +2 PV e +2 PM. Um teste que só olhasse o dado passaria com
 * `sheetBonuses` escrito errado — daí o recálculo comparativo: mede a ficha com
 * e sem o poder e cobra a diferença de 2, que é o que o jogador vê.
 */
const sheetWith = (powers: GeneralPower[]): CharacterSheet =>
  recalculateSheet({
    ...createMockCharacterSheet(),
    generalPowers: powers,
  });

describe('Coração de Dragão (Ameaças de Arton)', () => {
  const power = find('Coração de Dragão');

  it('é um poder de Destino', () => {
    expect(power?.type).toBe(GeneralPowerType.DESTINO);
  });

  it('exige Carisma 2 e 3º nível no mesmo grupo (E, não OU)', () => {
    expect(power?.requirements).toEqual([
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 2 },
        { type: RequirementType.NIVEL, value: 3 },
      ],
    ]);
  });

  it('cita a regra de limite de parceiros, que não tem automação', () => {
    expect(power?.description).toContain('dragão jovem');
    expect(power?.description).toContain('limite de parceiros');
  });

  it('soma +2 PV e +2 PM na ficha', () => {
    const semPoder = sheetWith([]);
    const comPoder = sheetWith([power as GeneralPower]);

    expect(comPoder.pv - semPoder.pv).toBe(2);
    expect(comPoder.pm - semPoder.pm).toBe(2);
  });
});
