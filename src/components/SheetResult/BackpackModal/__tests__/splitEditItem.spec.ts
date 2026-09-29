import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '../../../../interfaces/Equipment';
import { BackpackStagedState, reducer } from '../useBackpackState';

/**
 * Editar uma unidade de uma pilha (duas Couraças agrupadas pelo nome) separa
 * essa unidade num item novo, em vez de alterar a pilha inteira.
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

const couraca = (over: Partial<DefenseEquipment> = {}): DefenseEquipment => ({
  id: 'couraca',
  nome: 'Couraça',
  group: 'Armadura',
  defenseBonus: 5,
  armorPenalty: 4,
  spaces: 2,
  preco: 500,
  ...over,
});

function makeState(
  items: Equipment[],
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
    displayOrder: [...displayOrder, 'outro-item'],
    money: { dinheiro: 1000, dinheiroTC: 0, dinheiroTO: 0 },
    maxSpacesAttribute: Atributo.FORCA,
    customMaxSpaces: undefined,
    autoDeductMoney: true,
    paidUnits: {},
    mainHandItemId: undefined,
    offHandItemId: undefined,
    wornArmorId: undefined,
    groupByCategory: false,
    ...over,
  };
}

const edited = couraca({
  quantity: 2,
  armorPenalty: 2,
  modifications: [{ mod: 'Ajustada' }, { mod: 'Sob medida' }],
});

describe('editar uma unidade de uma pilha', () => {
  test('a unidade editada vira item novo e a pilha perde uma', () => {
    const state = makeState([couraca({ quantity: 2 })]);

    const next = reducer(state, {
      type: 'SPLIT_EDIT_ITEM',
      id: 'couraca',
      next: edited,
      newId: 'couraca-2',
    });

    const armors = next.equipments.Armadura as DefenseEquipment[];
    expect(armors).toHaveLength(2);
    expect(armors[0]).toMatchObject({
      id: 'couraca',
      quantity: 1,
      armorPenalty: 4,
    });
    expect(armors[0].modifications).toBeUndefined();
    expect(armors[1]).toMatchObject({
      id: 'couraca-2',
      quantity: 1,
      armorPenalty: 2,
    });
    // A cópia entra logo depois da pilha na ordem de exibição.
    expect(next.displayOrder).toEqual(['couraca', 'couraca-2', 'outro-item']);
  });

  test('o crédito de compra excedente passa para a cópia', () => {
    const state = makeState([couraca({ quantity: 2 })], {
      paidUnits: { couraca: 2 },
    });

    const next = reducer(state, {
      type: 'SPLIT_EDIT_ITEM',
      id: 'couraca',
      next: edited,
      newId: 'couraca-2',
    });

    expect(next.paidUnits).toEqual({ couraca: 1, 'couraca-2': 1 });

    // Remover a pilha devolve só a unidade paga que sobrou nela.
    const removed = reducer(next, { type: 'REMOVE_ITEM', id: 'couraca' });
    expect(removed.money.dinheiro).toBe(1500);
  });

  test('crédito que cabe na pilha fica nela', () => {
    const state = makeState([couraca({ quantity: 3 })], {
      paidUnits: { couraca: 1 },
    });

    const next = reducer(state, {
      type: 'SPLIT_EDIT_ITEM',
      id: 'couraca',
      next: edited,
      newId: 'couraca-2',
    });

    expect(next.paidUnits).toEqual({ couraca: 1 });
  });

  test('item de uma unidade só é atualizado no lugar', () => {
    const state = makeState([couraca({ quantity: 1 })]);

    const next = reducer(state, {
      type: 'SPLIT_EDIT_ITEM',
      id: 'couraca',
      next: couraca({ quantity: 1, armorPenalty: 2 }),
      newId: 'couraca-2',
    });

    const armors = next.equipments.Armadura as DefenseEquipment[];
    expect(armors).toHaveLength(1);
    expect(armors[0]).toMatchObject({ id: 'couraca', armorPenalty: 2 });
    expect(next.displayOrder).toEqual(['couraca', 'outro-item']);
  });
});
