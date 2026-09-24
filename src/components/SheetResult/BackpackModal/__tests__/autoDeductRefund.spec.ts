import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';
import {
  BackpackStagedState,
  addItemToEquipments,
  reducer,
} from '../useBackpackState';

/**
 * Contabilidade de dinheiro da mochila.
 *
 * A regra que estes testes travam: `autoDeductMoney` controla DÉBITOS,
 * `paidUnits` controla CRÉDITOS. Consumir/remover um item que o personagem já
 * possuía nunca devolve dinheiro — antes devolvia o preço de catálogo cheio, o
 * que fazia gastar uma poção parecer vendê-la.
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

const pocao = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'pocao-catalogo',
  nome: 'Poção de Cura Leve',
  group: 'Alquimía',
  spaces: 0.5,
  preco: 50,
  ...over,
});

const flechas = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'flechas-catalogo',
  nome: 'Flechas',
  group: 'Item Geral',
  spaces: 1,
  preco: 1,
  isAmmo: true,
  ammoType: 'Flechas',
  ammoPackSize: 20,
  ...over,
});

/** Estado inicial equivalente ao que `buildSnapshot` produz ao abrir o modal. */
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
    autoDeductMoney: true,
    // Sempre vazio ao abrir o modal — nada pré-existente é reembolsável.
    paidUnits: {},
    mainHandItemId: undefined,
    offHandItemId: undefined,
    wornArmorId: undefined,
    groupByCategory: false,
    ...over,
  };
}

/** Id que a pilha recebeu na mochila (o reducer clona e pode gerar id novo). */
function onlyItemId(state: BackpackStagedState, group: Equipment['group']) {
  const list = state.equipments[group] as Equipment[];
  return list[0].id as string;
}

describe('reembolso só do que foi pago', () => {
  test('remover item pré-existente NÃO devolve dinheiro (o bug do relato)', () => {
    const state = makeState([pocao({ id: 'pocao-antiga', quantity: 3 })]);

    const next = reducer(state, { type: 'REMOVE_ITEM', id: 'pocao-antiga' });

    expect(next.money.dinheiro).toBe(1000);
    expect(next.equipments.Alquimía).toHaveLength(0);
  });

  test('pilha mista devolve só as unidades compradas nesta sessão', () => {
    const state = makeState([pocao({ id: 'pocao-antiga', quantity: 3 })]);

    // Compra 2 sobre as 3 que já existiam: empilha no MESMO id.
    const bought = reducer(state, {
      type: 'ADD_ITEM',
      item: pocao(),
      quantity: 2,
    });
    expect(bought.money.dinheiro).toBe(900); // 2 × 50 debitados
    expect(bought.paidUnits['pocao-antiga']).toBe(2);
    expect((bought.equipments.Alquimía as Equipment[])[0].quantity).toBe(5);

    // Apagar a pilha inteira (5) devolve só as 2 pagas, não 5.
    const removed = reducer(bought, {
      type: 'REMOVE_ITEM',
      id: 'pocao-antiga',
    });
    expect(removed.money.dinheiro).toBe(1000);
    expect(removed.paidUnits['pocao-antiga']).toBeUndefined();
  });

  test('decremento devolve só a parte paga', () => {
    const base = makeState([pocao({ id: 'pocao-antiga', quantity: 3 })]);
    const bought = reducer(base, {
      type: 'ADD_ITEM',
      item: pocao(),
      quantity: 2,
    });

    // 5 → 1: consumiu 4, mas só 2 tinham sido pagas.
    const consumed = reducer(bought, {
      type: 'SET_QUANTITY',
      id: 'pocao-antiga',
      quantity: 1,
    });

    expect(consumed.money.dinheiro).toBe(1000); // 900 + 2 × 50
    expect(consumed.paidUnits['pocao-antiga']).toBeUndefined();
  });

  test('incremento cobra e registra a procedência', () => {
    const base = makeState([pocao({ id: 'pocao-antiga', quantity: 3 })]);

    const next = reducer(base, {
      type: 'SET_QUANTITY',
      id: 'pocao-antiga',
      quantity: 5,
    });

    expect(next.money.dinheiro).toBe(900);
    expect(next.paidUnits['pocao-antiga']).toBe(2);
  });

  test('toggle desligado: não cobra na compra nem devolve na remoção', () => {
    const state = makeState([], { autoDeductMoney: false });

    const added = reducer(state, {
      type: 'ADD_ITEM',
      item: pocao(),
      quantity: 2,
    });
    expect(added.money.dinheiro).toBe(1000);
    expect(added.paidUnits).toEqual({});

    const id = onlyItemId(added, 'Alquimía');
    const removed = reducer(added, { type: 'REMOVE_ITEM', id });
    expect(removed.money.dinheiro).toBe(1000);
  });

  test('crédito independe do toggle atual: comprar, desligar e desfazer devolve', () => {
    const bought = reducer(makeState(), {
      type: 'ADD_ITEM',
      item: pocao(),
      quantity: 1,
    });
    expect(bought.money.dinheiro).toBe(950);

    const off = reducer(bought, { type: 'SET_AUTO_DEDUCT', value: false });
    const id = onlyItemId(off, 'Alquimía');
    const removed = reducer(off, { type: 'REMOVE_ITEM', id });

    // O dinheiro saiu de fato, então tem que voltar.
    expect(removed.money.dinheiro).toBe(1000);
  });
});

describe('munição', () => {
  test('pacote parcialmente gasto não reembolsa pacote cheio', () => {
    const bought = reducer(makeState(), {
      type: 'ADD_ITEM',
      item: flechas(),
      quantity: 1,
    });
    expect(bought.money.dinheiro).toBe(999);

    const id = onlyItemId(bought, 'Item Geral');
    expect(
      (bought.equipments['Item Geral'] as Equipment[])[0].unitsRemaining
    ).toBe(20);

    // Gasta 19 flechas (como um ataque faria, mexendo em `unitsRemaining`).
    const spent: BackpackStagedState = {
      ...bought,
      equipments: {
        ...bought.equipments,
        'Item Geral': [
          {
            ...(bought.equipments['Item Geral'] as Equipment[])[0],
            unitsRemaining: 1,
          },
        ],
      },
    };

    const removed = reducer(spent, { type: 'REMOVE_ITEM', id });

    // floor(1/20) = 0 pacotes fechados: nada volta.
    expect(removed.money.dinheiro).toBe(999);
  });

  test('pacote intacto reembolsa por inteiro', () => {
    const bought = reducer(makeState(), {
      type: 'ADD_ITEM',
      item: flechas(),
      quantity: 2,
    });
    expect(bought.money.dinheiro).toBe(998);

    const id = onlyItemId(bought, 'Item Geral');
    const removed = reducer(bought, { type: 'REMOVE_ITEM', id });

    expect(removed.money.dinheiro).toBe(1000);
  });
});

describe('procedência não vaza entre entradas', () => {
  test('remover a pilha paga não credita outra pilha do mesmo item', () => {
    // Duas entradas distintas: uma custom (não empilha) e uma de catálogo.
    const custom = pocao({
      id: 'pocao-custom',
      isCustom: true,
      quantity: 1,
    });
    const state = makeState([custom]);

    const bought = reducer(state, {
      type: 'ADD_ITEM',
      item: pocao(),
      quantity: 1,
    });
    // Não empilhou com a custom: entrou como entrada nova.
    expect(bought.equipments.Alquimía).toHaveLength(2);
    expect(bought.money.dinheiro).toBe(950);

    // Apagar a CUSTOM (nunca paga) não devolve nada.
    const removed = reducer(bought, {
      type: 'REMOVE_ITEM',
      id: 'pocao-custom',
    });
    expect(removed.money.dinheiro).toBe(950);
  });
});

describe('addItemToEquipments devolve o id da pilha que recebeu a compra', () => {
  test('merge aponta para a pilha existente', () => {
    const equipments = emptyBag();
    (equipments.Alquimía as Equipment[]).push(
      pocao({ id: 'pocao-antiga', quantity: 3 })
    );

    const result = addItemToEquipments(
      equipments,
      ['pocao-antiga'],
      pocao(),
      2
    );

    expect(result.addedId).toBe('pocao-antiga');
  });
});
