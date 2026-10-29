/**
 * Empunhadura das bestas e do arco longo (Tormenta20, Tabela 3-3: Armas,
 * p. 144–145).
 *
 * A Besta leve está em "Armas Simples › Ataque à Distância — Uma Mão"; o Arco
 * longo e a Besta pesada, em "Armas Marciais › Ataque à Distância — Duas
 * Mãos". O commit 42006dff marcou as três como de duas mãos; só as duas
 * marciais são.
 */
import { describe, it, expect } from 'vitest';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import { isTwoHanded } from '../../components/SheetResult/BackpackModal/wielding';
import { convertToFoundry } from '../../2foundry';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';

describe('Besta leve é arma de uma mão', () => {
  it('não é marcada como de duas mãos no catálogo', () => {
    expect(Armas.BESTALEVE.twoHanded).toBeFalsy();
    expect(isTwoHanded(Armas.BESTALEVE)).toBe(false);
  });

  it('sai com empunhadura de uma mão no export do Foundry', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.getEquipments().Arma.push({ ...Armas.BESTALEVE });

    const besta = convertToFoundry(sheet).items.find(
      (item) => item.type === 'arma' && item.name === 'Besta Leve'
    );

    expect(besta?.system.empunhadura).toBe('uma');
  });

  it('Arco longo e Besta pesada continuam de duas mãos', () => {
    expect(isTwoHanded(Armas.ARCO_LONGO)).toBe(true);
    expect(isTwoHanded(Armas.BESTA_PESADA)).toBe(true);
  });
});
