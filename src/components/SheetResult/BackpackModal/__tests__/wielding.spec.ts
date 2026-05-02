import {
  applyTwoHandedToggle,
  applyWielding,
  getWieldingSlot,
  getWornArmor,
  isTwoHanded,
  isWieldable,
  migrateLegacyEquipState,
  MigratableBagView,
  MigratableSheetView,
  pruneWielding,
} from '../wielding';
import Equipment, { DefenseEquipment } from '../../../../interfaces/Equipment';

describe('isWieldable', () => {
  test('weapons are wieldable', () => {
    const sword: Equipment = { id: 'a', nome: 'Espada', group: 'Arma' };
    expect(isWieldable(sword)).toBe(true);
  });

  test('shields are wieldable', () => {
    const shield = {
      id: 'b',
      nome: 'Escudo',
      group: 'Escudo' as const,
      defenseBonus: 2,
      armorPenalty: 0,
    };
    expect(isWieldable(shield as unknown as Equipment)).toBe(true);
  });

  test('alchemical items are wieldable', () => {
    const potion: Equipment = {
      id: 'c',
      nome: 'Poção',
      group: 'Alquimía',
    };
    expect(isWieldable(potion)).toBe(true);
  });

  test('canBeUsedAsWeapon override (e.g. Tocha)', () => {
    const torch: Equipment = {
      id: 'd',
      nome: 'Tocha',
      group: 'Item Geral',
      canBeUsedAsWeapon: true,
    };
    expect(isWieldable(torch)).toBe(true);
  });

  test('canBeWielded override for custom items', () => {
    const wand: Equipment = {
      id: 'e',
      nome: 'Varinha',
      group: 'Esotérico',
      canBeWielded: true,
    };
    expect(isWieldable(wand)).toBe(true);
  });

  test('plain general items are not wieldable', () => {
    const sack: Equipment = { id: 'f', nome: 'Saco', group: 'Item Geral' };
    expect(isWieldable(sack)).toBe(false);
  });

  test('food items are not wieldable', () => {
    const ration: Equipment = {
      id: 'g',
      nome: 'Ração',
      group: 'Alimentação',
    };
    expect(isWieldable(ration)).toBe(false);
  });
});

describe('getWieldingSlot', () => {
  test('returns null when itemId is undefined', () => {
    expect(getWieldingSlot(undefined, {})).toBeNull();
  });

  test('returns null when item not wielded', () => {
    expect(
      getWieldingSlot('a', { mainHandItemId: 'b', offHandItemId: 'c' })
    ).toBeNull();
  });

  test('returns main when item is in main hand', () => {
    expect(getWieldingSlot('a', { mainHandItemId: 'a' })).toBe('main');
  });

  test('returns off when item is in off hand', () => {
    expect(getWieldingSlot('a', { offHandItemId: 'a' })).toBe('off');
  });
});

describe('applyWielding', () => {
  test('assigns to empty main hand', () => {
    const result = applyWielding({}, 'sword-1', 'main');
    expect(result).toEqual({
      mainHandItemId: 'sword-1',
      offHandItemId: undefined,
    });
  });

  test('assigns to empty off hand', () => {
    const result = applyWielding({}, 'shield-1', 'off');
    expect(result).toEqual({
      mainHandItemId: undefined,
      offHandItemId: 'shield-1',
    });
  });

  test('assigning to main evicts previous main', () => {
    const result = applyWielding(
      { mainHandItemId: 'sword-old' },
      'sword-new',
      'main'
    );
    expect(result.mainHandItemId).toBe('sword-new');
    expect(result.offHandItemId).toBeUndefined();
  });

  test('moving an item from main to off vacates main', () => {
    const result = applyWielding(
      { mainHandItemId: 'sword-1' },
      'sword-1',
      'off'
    );
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBe('sword-1');
  });

  test('moving an item from off to main vacates off', () => {
    const result = applyWielding({ offHandItemId: 'dagger' }, 'dagger', 'main');
    expect(result.mainHandItemId).toBe('dagger');
    expect(result.offHandItemId).toBeUndefined();
  });

  test('null slot clears the item from main hand', () => {
    const result = applyWielding(
      { mainHandItemId: 'sword-1', offHandItemId: 'shield-1' },
      'sword-1',
      null
    );
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBe('shield-1');
  });

  test('null slot is a no-op when item is not wielded', () => {
    const before = { mainHandItemId: 'a', offHandItemId: 'b' };
    const result = applyWielding(before, 'c', null);
    expect(result).toEqual(before);
  });

  test('assigning the same item to the same slot is idempotent', () => {
    const before = { mainHandItemId: 'sword-1' };
    const result = applyWielding(before, 'sword-1', 'main');
    expect(result.mainHandItemId).toBe('sword-1');
    expect(result.offHandItemId).toBeUndefined();
  });
});

describe('isTwoHanded', () => {
  test('reads the dedicated twoHanded flag', () => {
    const greatsword: Equipment = {
      id: 'a',
      nome: 'Espada de Duas Mãos',
      group: 'Arma',
      twoHanded: true,
    };
    expect(isTwoHanded(greatsword)).toBe(true);
  });

  test('falls back to weaponTags', () => {
    const halberd: Equipment = {
      id: 'b',
      nome: 'Alabarda',
      group: 'Arma',
      weaponTags: ['twoHanded'],
    };
    expect(isTwoHanded(halberd)).toBe(true);
  });

  test('false for one-handed weapons', () => {
    const sword: Equipment = { id: 'c', nome: 'Espada', group: 'Arma' };
    expect(isTwoHanded(sword)).toBe(false);
  });
});

describe('applyWielding (two-handed)', () => {
  test("'both' slot occupies both hands", () => {
    const result = applyWielding({}, 'greatsword', 'both');
    expect(result.mainHandItemId).toBe('greatsword');
    expect(result.offHandItemId).toBe('greatsword');
  });

  test("'both' evicts whatever was in either slot", () => {
    const result = applyWielding(
      { mainHandItemId: 'sword', offHandItemId: 'shield' },
      'greatsword',
      'both'
    );
    expect(result.mainHandItemId).toBe('greatsword');
    expect(result.offHandItemId).toBe('greatsword');
  });

  test('null slot releases a two-handed weapon (clears both)', () => {
    const result = applyWielding(
      { mainHandItemId: 'greatsword', offHandItemId: 'greatsword' },
      'greatsword',
      null
    );
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBeUndefined();
  });

  test('assigning a one-handed item to off-hand leaves a two-handed main intact only via main move', () => {
    // When a 2H weapon owns both slots and the user assigns a different item
    // to off-hand, the main slot keeps the 2H id (caller is responsible for
    // releasing the 2H first via UI rule). This test documents the raw
    // reducer behavior — the UI prevents this case in practice.
    const result = applyWielding(
      { mainHandItemId: 'greatsword', offHandItemId: 'greatsword' },
      'shield',
      'off'
    );
    expect(result.mainHandItemId).toBe('greatsword');
    expect(result.offHandItemId).toBe('shield');
  });

  test("getWieldingSlot returns 'both' when the same id is in both slots", () => {
    expect(
      getWieldingSlot('greatsword', {
        mainHandItemId: 'greatsword',
        offHandItemId: 'greatsword',
      })
    ).toBe('both');
  });

  test('applyTwoHandedToggle empunhar=true sets both', () => {
    const result = applyTwoHandedToggle({}, 'maul', true);
    expect(result.mainHandItemId).toBe('maul');
    expect(result.offHandItemId).toBe('maul');
  });

  test('applyTwoHandedToggle empunhar=false clears both', () => {
    const result = applyTwoHandedToggle(
      { mainHandItemId: 'maul', offHandItemId: 'maul' },
      'maul',
      false
    );
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBeUndefined();
  });
});

describe('applyWielding (lookup-aware: shield vs two-handed)', () => {
  const greatsword: Equipment = {
    id: 'gs',
    nome: 'Espada de Duas Mãos',
    group: 'Arma',
    twoHanded: true,
  };
  const shield: Equipment = {
    id: 'sh',
    nome: 'Escudo Leve',
    group: 'Escudo',
    defenseBonus: 2,
    armorPenalty: 0,
  } as Equipment;
  const sword: Equipment = { id: 'sw', nome: 'Espada Longa', group: 'Arma' };
  const items: Record<string, Equipment> = {
    gs: greatsword,
    sh: shield,
    sw: sword,
  };
  const lookup = (id: string) => items[id];

  test('blocks assigning shield to off-hand when main has 2H weapon', () => {
    const result = applyWielding(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      'sh',
      'off',
      lookup
    );
    // 'both' state preserved: 2H still in both hands; shield rejected.
    expect(result).toEqual({
      mainHandItemId: 'gs',
      offHandItemId: 'gs',
    });
  });

  test('blocks assigning shield to main when off has 2H weapon', () => {
    const result = applyWielding(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      'sh',
      'main',
      lookup
    );
    expect(result).toEqual({
      mainHandItemId: 'gs',
      offHandItemId: 'gs',
    });
  });

  test('blocks assigning shield to "both" slot', () => {
    const result = applyWielding({}, 'sh', 'both', lookup);
    expect(result).toEqual({});
  });

  test('allows assigning shield to off-hand when main has 1H weapon', () => {
    const result = applyWielding({ mainHandItemId: 'sw' }, 'sh', 'off', lookup);
    expect(result.mainHandItemId).toBe('sw');
    expect(result.offHandItemId).toBe('sh');
  });

  test('2H weapon still evicts existing shield via "both" assignment', () => {
    const result = applyWielding(
      { mainHandItemId: 'sw', offHandItemId: 'sh' },
      'gs',
      'both',
      lookup
    );
    expect(result.mainHandItemId).toBe('gs');
    expect(result.offHandItemId).toBe('gs');
  });

  test('without lookup, shield-vs-2H is not enforced (legacy behavior)', () => {
    const result = applyWielding(
      { mainHandItemId: 'gs', offHandItemId: 'gs' },
      'sh',
      'off'
    );
    // Without lookup the reducer accepts the assignment as before.
    expect(result.offHandItemId).toBe('sh');
  });
});

describe('getWornArmor', () => {
  const couro: DefenseEquipment = {
    id: 'a1',
    nome: 'Couro batido',
    group: 'Armadura',
    defenseBonus: 3,
    armorPenalty: 1,
  };
  const cota: DefenseEquipment = {
    id: 'a2',
    nome: 'Cota de malha',
    group: 'Armadura',
    defenseBonus: 4,
    armorPenalty: 4,
  };

  test('returns the armor matching wornArmorId', () => {
    const result = getWornArmor([couro, cota], 'a2');
    expect(result?.id).toBe('a2');
  });

  test('legacy compat: 1 armor with no wornArmorId → that armor applies', () => {
    const result = getWornArmor([couro], undefined);
    expect(result?.id).toBe('a1');
  });

  test('ambiguous: ≥2 armors with no wornArmorId → undefined', () => {
    expect(getWornArmor([couro, cota], undefined)).toBeUndefined();
  });

  test('empty bag → undefined', () => {
    expect(getWornArmor([], undefined)).toBeUndefined();
  });

  test('stale wornArmorId (item removed) → undefined; caller is expected to prune', () => {
    const result = getWornArmor([couro, cota], 'gone');
    expect(result).toBeUndefined();
  });
});

describe('pruneWielding', () => {
  test('keeps slots whose ids are still present', () => {
    const result = pruneWielding(
      { mainHandItemId: 'a', offHandItemId: 'b' },
      new Set(['a', 'b', 'c'])
    );
    expect(result).toEqual({ mainHandItemId: 'a', offHandItemId: 'b' });
  });

  test('drops main slot when its id is gone', () => {
    const result = pruneWielding(
      { mainHandItemId: 'a', offHandItemId: 'b' },
      new Set(['b'])
    );
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBe('b');
  });

  test('drops both slots when neither id is present', () => {
    const result = pruneWielding(
      { mainHandItemId: 'a', offHandItemId: 'b' },
      new Set(['c'])
    );
    expect(result).toEqual({
      mainHandItemId: undefined,
      offHandItemId: undefined,
    });
  });
});

describe('migrateLegacyEquipState', () => {
  const armor: DefenseEquipment = {
    id: 'a1',
    nome: 'Couro batido',
    group: 'Armadura',
    defenseBonus: 3,
    armorPenalty: 1,
  };
  const shield: DefenseEquipment = {
    id: 's1',
    nome: 'Escudo Leve',
    group: 'Escudo',
    defenseBonus: 1,
    armorPenalty: 1,
  };
  const oneHandedSword: Equipment = {
    id: 'w1',
    nome: 'Espada Longa',
    group: 'Arma',
  };
  const twoHandedAxe: Equipment = {
    id: 'w2',
    nome: 'Machado Grande',
    group: 'Arma',
    twoHanded: true,
  };

  type Input = MigratableSheetView & { bag: { equipments: MigratableBagView } };

  test('legacy sheet with armor + shield + 1H weapon: seeds all three slots', () => {
    const input: Input = {
      bag: {
        equipments: {
          Armadura: [armor],
          Escudo: [shield],
          Arma: [oneHandedSword],
        },
      },
    };
    const result = migrateLegacyEquipState(input);
    expect(result.wornArmorId).toBe('a1');
    expect(result.offHandItemId).toBe('s1');
    expect(result.mainHandItemId).toBe('w1');
    expect(result.equipStateMigrated).toBe(true);
  });

  test('legacy sheet with shield + 2H weapon: shield wins (off-hand), no main hand', () => {
    const input: Input = {
      bag: { equipments: { Escudo: [shield], Arma: [twoHandedAxe] } },
    };
    const result = migrateLegacyEquipState(input);
    expect(result.offHandItemId).toBe('s1');
    expect(result.mainHandItemId).toBeUndefined();
  });

  test('legacy sheet with only 2H weapon: occupies both hands', () => {
    const input: Input = {
      bag: { equipments: { Arma: [twoHandedAxe] } },
    };
    const result = migrateLegacyEquipState(input);
    expect(result.mainHandItemId).toBe('w2');
    expect(result.offHandItemId).toBe('w2');
  });

  test('legacy sheet with empty bag: only stamps the migration flag', () => {
    const input: Input = { bag: { equipments: {} } };
    const result = migrateLegacyEquipState(input);
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBeUndefined();
    expect(result.wornArmorId).toBeUndefined();
    expect(result.equipStateMigrated).toBe(true);
  });

  test('idempotent: no-op when already migrated', () => {
    const before: Input = {
      bag: { equipments: { Armadura: [armor] } },
      equipStateMigrated: true,
    };
    const result = migrateLegacyEquipState(before);
    expect(result).toBe(before);
  });

  test('opt-in detected: any slot already set → just stamps flag, leaves slots intact', () => {
    const input: Input = {
      bag: { equipments: { Armadura: [armor], Escudo: [shield] } },
      mainHandItemId: 'something',
    };
    const result = migrateLegacyEquipState(input);
    // Sheet had explicitly chosen mainHandItemId — don't override anything.
    expect(result.mainHandItemId).toBe('something');
    expect(result.offHandItemId).toBeUndefined();
    expect(result.wornArmorId).toBeUndefined();
    expect(result.equipStateMigrated).toBe(true);
  });

  test('legacy sheet with only armor: seeds wornArmorId', () => {
    const input: Input = { bag: { equipments: { Armadura: [armor] } } };
    const result = migrateLegacyEquipState(input);
    expect(result.wornArmorId).toBe('a1');
    expect(result.mainHandItemId).toBeUndefined();
    expect(result.offHandItemId).toBeUndefined();
  });

  test('legacy sheet with mixed weapons (1H + 2H), no shield: prefers 1H for main', () => {
    const input: Input = {
      bag: { equipments: { Arma: [twoHandedAxe, oneHandedSword] } },
    };
    const result = migrateLegacyEquipState(input);
    expect(result.mainHandItemId).toBe('w1');
    expect(result.offHandItemId).toBeUndefined();
  });
});
