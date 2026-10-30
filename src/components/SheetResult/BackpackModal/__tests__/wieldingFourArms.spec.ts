import {
  applyWielding,
  canSplitStack,
  commitWielding,
  countOccupiedHands,
  getDisabledWieldingSlots,
  getWieldedItemIds,
  getWieldingSlot,
  isItemWielded,
  isWieldedTwoHanded,
  pickDefaultWieldSlot,
  pruneWielding,
} from '../wielding';
import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';

const sword: Equipment = { id: 'sword', nome: 'Espada', group: 'Arma' };
const axe: Equipment = { id: 'axe', nome: 'Machado', group: 'Arma' };
const greatsword: Equipment = {
  id: 'gs',
  nome: 'Montante',
  group: 'Arma',
  twoHanded: true,
};
const shield = {
  id: 'shield',
  nome: 'Escudo Leve',
  group: 'Escudo',
} as unknown as Equipment;
const shield2 = {
  id: 'shield2',
  nome: 'Escudo Pesado',
  group: 'Escudo',
} as unknown as Equipment;

const ITEMS = [sword, axe, greatsword, shield, shield2];
const lookup = (id: string) => ITEMS.find((item) => item.id === id);

describe('estado com mãos extras', () => {
  const state = {
    mainHandItemId: 'gs',
    offHandItemId: 'gs',
    extraHand1ItemId: 'sword',
    extraHand2ItemId: 'axe',
  };

  test('ids distintos: arma de duas mãos conta uma vez', () => {
    expect(getWieldedItemIds(state)).toEqual(['gs', 'sword', 'axe']);
  });

  test('mãos ocupadas: arma de duas mãos conta duas', () => {
    expect(countOccupiedHands(state)).toBe(4);
  });

  test('isItemWielded enxerga as mãos extras', () => {
    expect(isItemWielded('axe', state)).toBe(true);
    expect(isItemWielded('shield', state)).toBe(false);
    expect(isItemWielded(undefined, state)).toBe(false);
  });

  test('getWieldingSlot resolve cada mão extra e o par extra', () => {
    expect(getWieldingSlot('sword', state)).toBe('extra1');
    expect(getWieldingSlot('axe', state)).toBe('extra2');
    expect(
      getWieldingSlot('gs', {
        extraHand1ItemId: 'gs',
        extraHand2ItemId: 'gs',
      })
    ).toBe('bothExtra');
  });

  test('lança em mão extra não conta como duas mãos; no par extra, conta', () => {
    const lance: Equipment = {
      ...greatsword,
      id: 'lance',
      oneHandedWhenMounted: true,
    };
    expect(isWieldedTwoHanded(lance, { extraHand1ItemId: 'lance' })).toBe(
      false
    );
    expect(
      isWieldedTwoHanded(lance, {
        extraHand1ItemId: 'lance',
        extraHand2ItemId: 'lance',
      })
    ).toBe(true);
  });

  test('pruneWielding limpa também as mãos extras', () => {
    const pruned = pruneWielding(state, new Set(['gs', 'axe']));
    expect(pruned.extraHand1ItemId).toBeUndefined();
    expect(pruned.extraHand2ItemId).toBe('axe');
    expect(pruned.mainHandItemId).toBe('gs');
  });
});

describe('applyWielding com mãos extras', () => {
  test('quatro itens diferentes, um em cada mão', () => {
    let state = applyWielding({}, 'sword', 'main', lookup);
    state = applyWielding(state, 'axe', 'off', lookup);
    state = applyWielding(state, 'shield', 'extra1', lookup);
    state = applyWielding(state, 'gs', 'bothExtra', lookup);
    // Arma de duas mãos no par extra evicta o escudo e não toca no outro par.
    expect(state).toEqual({
      mainHandItemId: 'sword',
      offHandItemId: 'axe',
      extraHand1ItemId: 'gs',
      extraHand2ItemId: 'gs',
    });
  });

  test('duas armas de duas mãos cabem, uma em cada par', () => {
    const state = applyWielding(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      'gs2',
      'bothExtra'
    );
    expect(state.mainHandItemId).toBe('gs');
    expect(state.extraHand1ItemId).toBe('gs2');
    expect(state.extraHand2ItemId).toBe('gs2');
  });

  test('null solta o item do par extra inteiro', () => {
    const state = applyWielding(
      { extraHand1ItemId: 'gs', extraHand2ItemId: 'gs' },
      'gs',
      null
    );
    expect(getWieldedItemIds(state)).toEqual([]);
  });

  test('mudar de mão extra para a principal move o item', () => {
    const state = applyWielding({ extraHand1ItemId: 'sword' }, 'sword', 'main');
    expect(state.mainHandItemId).toBe('sword');
    expect(state.extraHand1ItemId).toBeUndefined();
  });

  test('escudo em mão extra é bloqueado por arma de duas mãos no mesmo par', () => {
    const current = { extraHand1ItemId: 'gs', extraHand2ItemId: 'gs' };
    expect(applyWielding(current, 'shield', 'extra1', lookup)).toBe(current);
  });

  test('escudo em mão extra convive com arma de duas mãos no outro par', () => {
    const state = applyWielding(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      'shield',
      'extra1',
      lookup
    );
    expect(state.extraHand1ItemId).toBe('shield');
    expect(state.mainHandItemId).toBe('gs');
  });

  test('escudo não ocupa o par extra', () => {
    const current = {};
    expect(applyWielding(current, 'shield', 'bothExtra', lookup)).toBe(current);
  });
});

describe('dois escudos são proibidos', () => {
  test('segundo escudo é recusado em qualquer mão', () => {
    const current = { mainHandItemId: 'shield' };
    expect(applyWielding(current, 'shield2', 'off', lookup)).toBe(current);
    expect(applyWielding(current, 'shield2', 'extra2', lookup)).toBe(current);
  });

  test('o mesmo escudo pode trocar de mão', () => {
    const state = applyWielding(
      { mainHandItemId: 'shield' },
      'shield',
      'extra1',
      lookup
    );
    expect(state.extraHand1ItemId).toBe('shield');
    expect(state.mainHandItemId).toBeUndefined();
  });

  test('ficha que já tem dois escudos não é alterada em silêncio', () => {
    const current = { mainHandItemId: 'shield', offHandItemId: 'shield2' };
    expect(applyWielding(current, 'sword', 'extra1', lookup)).toEqual({
      ...current,
      extraHand1ItemId: 'sword',
    });
  });

  test('escudo empilhado nunca é dividido em segunda cópia', () => {
    expect(canSplitStack({ ...shield, quantity: 2 })).toBe(false);
  });
});

describe('getDisabledWieldingSlots', () => {
  test('sem nada ocupado, nada bloqueado', () => {
    expect(getDisabledWieldingSlots({}, lookup, 'sword')).toBeUndefined();
  });

  test('arma de duas mãos bloqueia só o próprio par', () => {
    const disabled = getDisabledWieldingSlots(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      lookup,
      'sword'
    );
    expect(Object.keys(disabled ?? {}).sort()).toEqual(['main', 'off']);
    expect(disabled?.main?.reason).toContain('duas mãos');
  });

  test('arma de duas mãos no par extra bloqueia só as extras', () => {
    const disabled = getDisabledWieldingSlots(
      { extraHand1ItemId: 'gs', extraHand2ItemId: 'gs' },
      lookup,
      'sword'
    );
    expect(Object.keys(disabled ?? {}).sort()).toEqual(['extra1', 'extra2']);
  });

  test('o ocupante nunca é bloqueado por si mesmo', () => {
    expect(
      getDisabledWieldingSlots(
        { mainHandItemId: 'gs', offHandItemId: 'gs' },
        lookup,
        'gs'
      )
    ).toBeUndefined();
  });

  test('escudo bloqueia a mão dele para outros itens', () => {
    const disabled = getDisabledWieldingSlots(
      { extraHand2ItemId: 'shield' },
      lookup,
      'sword'
    );
    expect(Object.keys(disabled ?? {})).toEqual(['extra2']);
    expect(disabled?.extra2?.reason).toContain('escudo');
  });

  test('segundo escudo fica bloqueado em todas as mãos', () => {
    const disabled = getDisabledWieldingSlots(
      { mainHandItemId: 'shield' },
      lookup,
      'shield2'
    );
    expect(Object.keys(disabled ?? {}).sort()).toEqual([
      'extra1',
      'extra2',
      'main',
      'off',
    ]);
    expect(disabled?.off?.reason).toContain('dois escudos');
  });
});

describe('pickDefaultWieldSlot com mãos extras', () => {
  test('sem o parâmetro, as mãos extras nunca são escolhidas', () => {
    const state = { mainHandItemId: 'sword', offHandItemId: 'axe' };
    const other: Equipment = { id: 'x', nome: 'Adaga', group: 'Arma' };
    expect(pickDefaultWieldSlot(state, other, lookup)).toBe('main');
  });

  test('uma mão: primeira livre, na ordem das mãos', () => {
    const other: Equipment = { id: 'x', nome: 'Adaga', group: 'Arma' };
    expect(pickDefaultWieldSlot({}, other, lookup, true)).toBe('main');
    expect(
      pickDefaultWieldSlot(
        { mainHandItemId: 'sword', offHandItemId: 'axe' },
        other,
        lookup,
        true
      )
    ).toBe('extra1');
    expect(
      pickDefaultWieldSlot(
        {
          mainHandItemId: 'sword',
          offHandItemId: 'axe',
          extraHand1ItemId: 'y',
        },
        other,
        lookup,
        true
      )
    ).toBe('extra2');
  });

  test('uma mão: arma de duas mãos no par principal não é derrubada', () => {
    expect(
      pickDefaultWieldSlot(
        { mainHandItemId: 'gs', offHandItemId: 'gs' },
        sword,
        lookup,
        true
      )
    ).toBe('extra1');
  });

  test('todas ocupadas: cai na regra de substituição', () => {
    const other: Equipment = { id: 'x', nome: 'Adaga', group: 'Arma' };
    expect(
      pickDefaultWieldSlot(
        {
          mainHandItemId: 'sword',
          offHandItemId: 'axe',
          extraHand1ItemId: 'a',
          extraHand2ItemId: 'b',
        },
        other,
        lookup,
        true
      )
    ).toBe('main');
  });

  test('duas mãos: vai para o par livre', () => {
    expect(pickDefaultWieldSlot({}, greatsword, lookup, true)).toBe('both');
    expect(
      pickDefaultWieldSlot(
        { mainHandItemId: 'sword' },
        greatsword,
        lookup,
        true
      )
    ).toBe('bothExtra');
  });

  test('duas mãos: já no par extra, continua nele', () => {
    expect(
      pickDefaultWieldSlot(
        { extraHand1ItemId: 'gs', extraHand2ItemId: 'gs' },
        greatsword,
        lookup,
        true
      )
    ).toBe('bothExtra');
  });

  test('duas mãos: sem par livre, usa o principal', () => {
    expect(
      pickDefaultWieldSlot(
        { mainHandItemId: 'sword', extraHand1ItemId: 'axe' },
        greatsword,
        lookup,
        true
      )
    ).toBe('both');
  });
});

describe('commitWielding com quatro mãos', () => {
  const dagger: Equipment = {
    id: 'dagger',
    nome: 'Adaga',
    group: 'Arma',
    quantity: 4,
  };
  const bag = (): BagEquipments =>
    ({
      Arma: [{ ...dagger }],
      Escudo: [],
    } as unknown as BagEquipments);

  test('quatro adagas de uma pilha viram quatro entradas, uma em cada mão', () => {
    let equipments = bag();
    let displayOrder = ['dagger'];
    let state = commitWielding({
      equipments,
      displayOrder,
      state: {},
      itemId: 'dagger',
      slot: 'main',
      newId: 'unused',
    });
    (
      [
        ['off', 'c1'],
        ['extra1', 'c2'],
        ['extra2', 'c3'],
      ] as const
    ).forEach(([slot, newId]) => {
      ({ equipments, displayOrder } = state);
      state = commitWielding({
        equipments,
        displayOrder,
        state,
        itemId: 'dagger',
        slot,
        newId,
      });
    });

    const weapons = state.equipments.Arma as Equipment[];
    expect(weapons.map((w) => w.quantity)).toEqual([1, 1, 1, 1]);
    expect(state.mainHandItemId).toBe('dagger');
    expect(state.offHandItemId).toBe('c1');
    expect(state.extraHand1ItemId).toBe('c2');
    expect(state.extraHand2ItemId).toBe('c3');
  });

  test('soltar a cópia da mão extra refunde na pilha', () => {
    const equipments = {
      Arma: [
        { ...dagger, quantity: 3 },
        { ...dagger, id: 'c1', quantity: 1 },
      ],
      Escudo: [],
    } as unknown as BagEquipments;
    const result = commitWielding({
      equipments,
      displayOrder: ['dagger', 'c1'],
      state: { mainHandItemId: 'dagger', extraHand1ItemId: 'c1' },
      itemId: 'c1',
      slot: null,
      newId: 'unused',
    });
    expect(result.extraHand1ItemId).toBeUndefined();
    expect(result.mainHandItemId).toBe('dagger');
    expect(result.equipments.Arma).toHaveLength(1);
    expect((result.equipments.Arma as Equipment[])[0].quantity).toBe(4);
    expect(result.bagChanged).toBe(true);
  });
});
