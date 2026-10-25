/**
 * Meio-Orc (Ameaças de Arton, p. 31): "Força +2, +1 em outro atributo (exceto
 * Carisma)." O +1 livre não pode cair em Carisma, nem no sorteio nem no
 * assistente (que lê `excludeFromAny` para montar as opções).
 */
import { describe, it, expect } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { modifyAttributesBasedOnRace } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';

const meioOrc = dataRegistry.getRaceByName('Meio-Orc', [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
]);

describe('Meio-Orc: +1 em outro atributo (exceto Carisma)', () => {
  it('exclui Carisma das opções do +1 livre', () => {
    expect(meioOrc).toBeDefined();
    expect(meioOrc?.attributes.excludeFromAny).toEqual([Atributo.CARISMA]);
  });

  it('o sorteio nunca põe o +1 em Carisma, mesmo com Carisma de prioridade', () => {
    if (!meioOrc) throw new Error('Meio-Orc não encontrado');
    const { atributos } = createMockCharacterSheet();
    const carismaRolado = atributos[Atributo.CARISMA].value;

    for (let i = 0; i < 50; i += 1) {
      const result = modifyAttributesBasedOnRace(
        meioOrc,
        atributos,
        [Atributo.CARISMA],
        []
      );
      expect(result[Atributo.CARISMA].value).toBe(carismaRolado);
    }
  });
});
