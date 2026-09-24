import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';
import Skill from '../../../../interfaces/Skills';
import { BackpackStagedState, reducer } from '../useBackpackState';

/**
 * Estado vestido/guardado das peças de Vestuário no reducer da Mochila.
 *
 * A regra travada aqui: `unwornClothingIds` é um conjunto de OPT-OUT — ausente
 * significa "tudo vestido", que é o comportamento de toda ficha anterior à
 * feature. Peça nova nasce vestida por construção.
 *
 * Testa o reducer direto porque o projeto está em React 17 com
 * @testing-library/react v11, que não tem `renderHook`.
 */

function emptyBag(): BagEquipments {
  return {
    Arma: [],
    Armadura: [],
    Escudo: [],
    'Item Geral': [],
    Alquimía: [],
    Esotérico: [],
    Vestuário: [],
    Hospedagem: [],
    Alimentação: [],
    Animal: [],
    Veículo: [],
    Serviço: [],
  };
}

const camisa = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'camisa-catalogo',
  nome: 'Camisa bufante',
  group: 'Vestuário',
  spaces: 1,
  preco: 25,
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Camisa bufante' },
      target: { type: 'Skill', name: Skill.ATUACAO },
      modifier: { type: 'Fixed', value: 1 },
    },
  ],
  ...over,
});

const bandana = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'bandana-catalogo',
  nome: 'Bandana',
  group: 'Vestuário',
  spaces: 1,
  preco: 5,
  ...over,
});

function makeState(
  items: Equipment[] = [],
  over: Partial<BackpackStagedState> = {}
): BackpackStagedState {
  const equipments = emptyBag();
  const displayOrder: string[] = [];
  items.forEach((item) => {
    (equipments[item.group] as Equipment[]).push(item);
    if (item.id) displayOrder.push(item.id);
  });
  return {
    equipments,
    displayOrder,
    money: { dinheiro: 1000, dinheiroTC: 0, dinheiroTO: 0 },
    maxSpacesAttribute: Atributo.FORCA,
    customMaxSpaces: undefined,
    autoDeductMoney: false,
    paidUnits: {},
    mainHandItemId: undefined,
    offHandItemId: undefined,
    wornArmorId: undefined,
    groupByCategory: false,
    ...over,
  };
}

describe('SET_WORN_CLOTHING', () => {
  test('guardar uma peça a registra no conjunto', () => {
    const state = makeState([camisa({ id: 'c1' })]);
    const next = reducer(state, {
      type: 'SET_WORN_CLOTHING',
      itemId: 'c1',
      worn: false,
    });
    expect(next.unwornClothingIds).toEqual(['c1']);
  });

  test('vestir de volta colapsa o conjunto para undefined', () => {
    const state = makeState([camisa({ id: 'c1' })], {
      unwornClothingIds: ['c1'],
    });
    const next = reducer(state, {
      type: 'SET_WORN_CLOTHING',
      itemId: 'c1',
      worn: true,
    });
    expect(next.unwornClothingIds).toBeUndefined();
  });

  test('guardar uma não afeta as outras peças', () => {
    const state = makeState([camisa({ id: 'c1' }), bandana({ id: 'b1' })]);
    const next = reducer(state, {
      type: 'SET_WORN_CLOTHING',
      itemId: 'c1',
      worn: false,
    });
    expect(next.unwornClothingIds).toEqual(['c1']);
    expect(next.unwornClothingIds).not.toContain('b1');
  });
});

describe('ADD_ITEM', () => {
  test('peça nova nasce vestida (conjunto continua ausente)', () => {
    const state = makeState();
    const next = reducer(state, {
      type: 'ADD_ITEM',
      item: camisa(),
      quantity: 1,
    });
    expect(next.unwornClothingIds).toBeUndefined();
    expect(next.equipments.Vestuário).toHaveLength(1);
  });

  test('merge numa pilha GUARDADA volta a vestir a entrada', () => {
    // Bandana não carrega bônus, então empilha em vez de criar entrada nova —
    // sem este re-vestir, a peça recém-comprada nasceria sem efeito.
    const existente = bandana({ id: 'b1', quantity: 1 });
    const state = makeState([existente], { unwornClothingIds: ['b1'] });
    const next = reducer(state, {
      type: 'ADD_ITEM',
      item: bandana(),
      quantity: 1,
    });
    const lista = next.equipments.Vestuário as Equipment[];
    expect(lista).toHaveLength(1);
    expect(lista[0].quantity).toBe(2);
    expect(next.unwornClothingIds).toBeUndefined();
  });

  test('adicionar peça não desveste as outras já guardadas', () => {
    const state = makeState([camisa({ id: 'c1' })], {
      unwornClothingIds: ['c1'],
    });
    const next = reducer(state, {
      type: 'ADD_ITEM',
      item: bandana(),
      quantity: 1,
    });
    expect(next.unwornClothingIds).toEqual(['c1']);
  });
});

describe('REMOVE_ITEM', () => {
  test('remover peça guardada limpa o id do conjunto', () => {
    const state = makeState([camisa({ id: 'c1' }), bandana({ id: 'b1' })], {
      unwornClothingIds: ['c1', 'b1'],
    });
    const next = reducer(state, { type: 'REMOVE_ITEM', id: 'c1' });
    expect(next.unwornClothingIds).toEqual(['b1']);
  });

  test('remover a última peça guardada colapsa para undefined', () => {
    const state = makeState([camisa({ id: 'c1' })], {
      unwornClothingIds: ['c1'],
    });
    const next = reducer(state, { type: 'REMOVE_ITEM', id: 'c1' });
    expect(next.unwornClothingIds).toBeUndefined();
  });
});
