import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import Bag, { getItemSpaces } from '../../../../interfaces/Bag';
import Equipment, {
  BagEquipments,
  DefenseEquipment,
} from '../../../../interfaces/Equipment';
import {
  filterCarried,
  getContainerCapacity,
  getLocationLabel,
  getStorageUsage,
  STASH_LOCATION,
} from '../../../../functions/bagStorage';
import {
  addItemToEquipments,
  BackpackStagedState,
  reducer,
} from '../useBackpackState';
import { WORN_ARMOR_NONE } from '../wielding';

/**
 * Locais da mochila: com você, recipiente (Alforje, Carroça) ou guardado. Só o
 * que está com o personagem conta na carga — JdA, Alforje: "permitem que um
 * parceiro montaria carregue até 10 espaços de item para você".
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

const alforje = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'alforje',
  nome: 'Alforje',
  group: 'Animal',
  spaces: 0,
  ...over,
});

const carroca = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'carroca',
  nome: 'Carroça',
  group: 'Veículo',
  spaces: 0,
  ...over,
});

const racao = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'racao',
  nome: 'Ração de viagem',
  group: 'Alimentação',
  spaces: 0.5,
  preco: 0.5,
  ...over,
});

const espada = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'espada',
  nome: 'Espada longa',
  group: 'Arma',
  spaces: 1,
  ...over,
});

const couro = (over: Partial<DefenseEquipment> = {}): DefenseEquipment => ({
  id: 'couro',
  nome: 'Couro',
  group: 'Armadura',
  spaces: 2,
  defenseBonus: 2,
  armorPenalty: 0,
  ...over,
});

function toEquipments(items: Equipment[]): BagEquipments {
  const equipments = emptyBag();
  items.forEach((item) => {
    (equipments[item.group] as Equipment[]).push(item);
  });
  return equipments;
}

function makeState(
  items: Equipment[] = [],
  over: Partial<BackpackStagedState> = {}
): BackpackStagedState {
  return {
    equipments: toEquipments(items),
    displayOrder: items.map((it) => it.id as string),
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

const all = (state: BackpackStagedState): Equipment[] =>
  Object.values(state.equipments).flat() as Equipment[];
const byId = (state: BackpackStagedState, id: string) =>
  all(state).find((it) => it.id === id);

describe('bagStorage', () => {
  test('capacidade dos recipientes do catálogo sai do nome (ficha legada)', () => {
    expect(getContainerCapacity(alforje())).toBe(10);
    expect(getContainerCapacity(carroca())).toBe(80);
    expect(getContainerCapacity(espada())).toBeUndefined();
  });

  test('capacidade multiplica pela quantidade e aceita item do usuário', () => {
    expect(getContainerCapacity(alforje({ quantity: 2 }))).toBe(20);
    expect(
      getContainerCapacity({
        nome: 'Baú encantado',
        group: 'Item Geral',
        containerCapacity: 15,
      })
    ).toBe(15);
  });

  test('item no Alforje e guardado não contam; recipiente apagado devolve', () => {
    const items = [
      alforje(),
      espada({ storedIn: 'alforje' }),
      racao({ storedIn: STASH_LOCATION, quantity: 4 }),
      couro(),
    ];
    expect(filterCarried(items).map((it) => it.id)).toEqual([
      'alforje',
      'couro',
    ]);
    // Sem o Alforje, a espada volta para a carga em vez de sumir.
    expect(filterCarried(items.slice(1)).map((it) => it.id)).toEqual([
      'espada',
      'couro',
    ]);
  });

  test('Bag.getSpaces conta só o que está com o personagem', () => {
    const bag = new Bag(
      toEquipments([
        alforje(),
        espada({ storedIn: 'alforje' }),
        couro(),
        racao({ storedIn: STASH_LOCATION, quantity: 4 }),
      ]),
      true
    );
    expect(bag.getSpaces()).toBe(2);
  });

  test('recipiente não vai dentro de recipiente', () => {
    const items = [alforje({ storedIn: 'carroca' }), carroca()];
    expect(filterCarried(items).map((it) => it.id)).toEqual([
      'alforje',
      'carroca',
    ]);
  });

  test('uso por local e rótulo', () => {
    const items = [
      alforje(),
      espada({ storedIn: 'alforje' }),
      racao({ storedIn: STASH_LOCATION, quantity: 4 }),
    ];
    const usage = getStorageUsage(items, getItemSpaces);
    expect(usage.map((u) => [u.label, u.used, u.capacity])).toEqual([
      ['Alforje', 1, 10],
      ['Guardado', 2, undefined],
    ]);
    expect(getLocationLabel(items[1], items)).toBe('Alforje');
    expect(getLocationLabel(items[0], items)).toBeUndefined();
  });
});

describe('MOVE_ITEM', () => {
  test('move a pilha inteira mantendo o id', () => {
    const state = makeState([alforje(), racao({ quantity: 4 })]);
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'racao',
      location: 'alforje',
      newId: 'novo',
    });
    expect(byId(next, 'racao')?.storedIn).toBe('alforje');
    expect(byId(next, 'racao')?.quantity).toBe(4);
  });

  test('move parte da pilha criando uma entrada nova', () => {
    const state = makeState([alforje(), racao({ quantity: 4 })]);
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'racao',
      location: 'alforje',
      units: 3,
      newId: 'novo',
    });
    expect(byId(next, 'racao')).toMatchObject({ quantity: 1 });
    expect(byId(next, 'racao')?.storedIn).toBeUndefined();
    expect(byId(next, 'novo')).toMatchObject({
      quantity: 3,
      storedIn: 'alforje',
    });
    expect(next.displayOrder).toEqual(['alforje', 'racao', 'novo']);
  });

  test('soma numa pilha igual que já está no destino', () => {
    const state = makeState([
      alforje(),
      racao({ quantity: 2 }),
      racao({ id: 'racao-alforje', quantity: 1, storedIn: 'alforje' }),
    ]);
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'racao',
      location: 'alforje',
      newId: 'novo',
    });
    expect(byId(next, 'racao')).toBeUndefined();
    expect(byId(next, 'racao-alforje')?.quantity).toBe(3);
    expect(next.displayOrder).not.toContain('racao');
  });

  test('crédito de compra acompanha a pilha absorvida', () => {
    const state = makeState(
      [
        alforje(),
        racao({ quantity: 2 }),
        racao({ id: 'racao-alforje', quantity: 1, storedIn: 'alforje' }),
      ],
      { paidUnits: { racao: 2 } }
    );
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'racao',
      location: 'alforje',
      newId: 'novo',
    });
    expect(next.paidUnits).toEqual({ 'racao-alforje': 2 });
  });

  test('tirar do personagem solta a arma e a armadura', () => {
    const state = makeState([alforje(), espada(), couro()], {
      mainHandItemId: 'espada',
      wornArmorId: 'couro',
    });
    const s1 = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'espada',
      location: 'alforje',
      newId: 'x',
    });
    expect(s1.mainHandItemId).toBeUndefined();
    const s2 = reducer(s1, {
      type: 'MOVE_ITEM',
      id: 'couro',
      location: STASH_LOCATION,
      newId: 'y',
    });
    expect(s2.wornArmorId).toBe(WORN_ARMOR_NONE);
  });

  test('armadura única vestida pelo fallback legado também deixa de valer', () => {
    const state = makeState([couro()]);
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'couro',
      location: STASH_LOCATION,
      newId: 'y',
    });
    expect(next.wornArmorId).toBe(WORN_ARMOR_NONE);
  });

  test('peça de vestuário guardada deixa de estar vestida', () => {
    const state = makeState([
      { id: 'capa', nome: 'Capa esvoaçante', group: 'Vestuário', spaces: 1 },
    ]);
    const next = reducer(state, {
      type: 'MOVE_ITEM',
      id: 'capa',
      location: STASH_LOCATION,
      newId: 'y',
    });
    expect(next.unwornClothingIds).toEqual(['capa']);
  });

  test('recusa recipiente dentro de recipiente e destino inexistente', () => {
    const state = makeState([alforje(), carroca(), espada()]);
    expect(
      reducer(state, {
        type: 'MOVE_ITEM',
        id: 'alforje',
        location: 'carroca',
        newId: 'x',
      })
    ).toBe(state);
    expect(
      reducer(state, {
        type: 'MOVE_ITEM',
        id: 'espada',
        location: 'nao-existe',
        newId: 'x',
      })
    ).toBe(state);
  });

  test('empunhar um item do Alforje o traz de volta', () => {
    const state = makeState([alforje(), espada({ storedIn: 'alforje' })]);
    const next = reducer(state, {
      type: 'SET_WIELDING',
      itemId: 'espada',
      slot: 'main',
    });
    expect(byId(next, 'espada')?.storedIn).toBeUndefined();
    expect(next.mainHandItemId).toBe('espada');
  });

  test('soltar a arma não funde com a pilha igual que está no Alforje', () => {
    const machadinha = (over: Partial<Equipment>): Equipment => ({
      nome: 'Machadinha',
      group: 'Arma',
      spaces: 1,
      ...over,
    });
    const state = makeState(
      [
        alforje(),
        machadinha({ id: 'mao' }),
        machadinha({ id: 'no-alforje', storedIn: 'alforje' }),
      ],
      { mainHandItemId: 'mao' }
    );
    const next = reducer(state, {
      type: 'SET_WIELDING',
      itemId: 'mao',
      slot: null,
    });
    expect(byId(next, 'no-alforje')).toMatchObject({ storedIn: 'alforje' });
    expect(byId(next, 'mao')?.quantity ?? 1).toBe(1);
  });

  test('apagar o recipiente devolve o conteúdo ao personagem', () => {
    const state = makeState([alforje(), espada({ storedIn: 'alforje' })]);
    const next = reducer(state, { type: 'REMOVE_ITEM', id: 'alforje' });
    expect(byId(next, 'espada')?.storedIn).toBeUndefined();
  });
});

describe('ADD_ITEM com locais', () => {
  test('compra empilha na pilha que está com você, não na do Alforje', () => {
    const equipments = toEquipments([
      alforje(),
      racao({ quantity: 2, storedIn: 'alforje' }),
    ]);
    const out = addItemToEquipments(
      equipments,
      ['alforje', 'racao'],
      racao({ id: undefined }),
      1
    );
    const racoes = out.equipments.Alimentação;
    expect(racoes).toHaveLength(2);
    expect(racoes[0]).toMatchObject({ quantity: 2, storedIn: 'alforje' });
    expect(racoes[1].storedIn).toBeUndefined();
  });
});
