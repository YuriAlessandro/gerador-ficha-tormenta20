import { applyItemEnhancements } from '../applyEnhancements';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';

describe('applyItemEnhancements — encantamentos', () => {
  const baseSword: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
  };

  test('returns the item untouched when there are no enhancements', () => {
    const result = applyItemEnhancements(baseSword);
    expect(result).toBe(baseSword);
  });

  test('Formidável adds +2 atk and +2 dmg', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Formidável' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.atkBonus).toBe(2);
    expect(result.dano).toBe('1d8+2');
    expect(result.baseDano).toBe('1d8');
    expect(result.baseAtkBonus).toBe(0);
  });

  test('Magnífica adds +4 atk and +4 dmg', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Magnífica' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.atkBonus).toBe(4);
    expect(result.dano).toBe('1d8+4');
  });

  test('legacy Magnífica* alias resolves to the same effect', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Magnífica*' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.atkBonus).toBe(4);
    expect(result.dano).toBe('1d8+4');
  });

  test('Energética adds +4 atk', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Energética' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.atkBonus).toBe(4);
    expect(result.dano).toBe('1d8');
  });

  test('Ameaçadora doubles the critical threat margin', () => {
    const xPlain: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Ameaçadora' }],
    };
    expect(applyItemEnhancements(xPlain).critico).toBe('19/x2');

    const margin2: Equipment = {
      ...baseSword,
      critico: '19/x2',
      enchantments: [{ enchantment: 'Ameaçadora' }],
    };
    expect(applyItemEnhancements(margin2).critico).toBe('17/x2');

    const margin3: Equipment = {
      ...baseSword,
      critico: '18/x2',
      enchantments: [{ enchantment: 'Ameaçadora' }],
    };
    expect(applyItemEnhancements(margin3).critico).toBe('15/x2');
  });

  test('Piedosa adds 1d8 Impacto extra damage', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Piedosa' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.extraDamage).toHaveLength(1);
    expect(result.extraDamage?.[0]).toMatchObject({
      dice: '1d8',
      damageType: 'Impacto',
      sourceName: 'Piedosa',
    });
  });

  test('Arremesso adds melee+throw special actions and sets arremesso flag', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Arremesso' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.arremesso).toBe(true);
    expect(result.specialActions).toHaveLength(2);
    expect(result.specialActions?.[0].id).toBe('ench-arremesso-melee');
    expect(result.specialActions?.[1].id).toBe('ench-arremesso-throw');
  });

  test('Arremesso preserves existing specialActions and dedupes by id', () => {
    const item: Equipment = {
      ...baseSword,
      specialActions: [
        { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      ],
      enchantments: [{ enchantment: 'Arremesso' }],
    };
    const result = applyItemEnhancements(item);
    // Original action stays + 2 derived (no dup since IDs differ).
    expect(result.specialActions?.map((a) => a.id)).toEqual([
      'corpo-a-corpo',
      'ench-arremesso-melee',
      'ench-arremesso-throw',
    ]);
  });

  test('removing Arremesso restores baseArremesso and strips derived actions', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Arremesso' }],
    };
    const enchanted = applyItemEnhancements(item);
    const cleared: Equipment = { ...enchanted, enchantments: [] };
    const restored = applyItemEnhancements(cleared);
    expect(restored.arremesso).toBeUndefined();
    expect(restored.specialActions).toBeUndefined();
  });

  test('Defensora emits a Defense SheetBonus on a weapon', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Defensora' }],
    };
    const result = applyItemEnhancements(item);
    const defenseBonus = (result.sheetBonuses ?? []).find(
      (b) => b.target.type === 'Defense'
    );
    expect(defenseBonus).toBeDefined();
    if (defenseBonus && defenseBonus.modifier.type === 'Fixed') {
      expect(defenseBonus.modifier.value).toBe(2);
    }
  });

  test('text-only enchantment (Flamejante) does not modify numeric stats', () => {
    const item: Equipment = {
      ...baseSword,
      enchantments: [{ enchantment: 'Flamejante' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.dano).toBe('1d8');
    expect(result.atkBonus).toBe(0);
    expect(result.critico).toBe('x2');
  });

  test('Defensor adds +2 to armor defenseBonus', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Couro batido',
      group: 'Armadura',
      defenseBonus: 3,
      armorPenalty: 1,
      spaces: 2,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      enchantments: [{ enchantment: 'Defensor' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.defenseBonus).toBe(5);
    expect(result.baseDefenseBonus).toBe(3);
  });

  test('Guardião (double cost) adds +4 to armor defenseBonus', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Cota de malha',
      group: 'Armadura',
      defenseBonus: 4,
      armorPenalty: 4,
      spaces: 3,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      enchantments: [{ enchantment: 'Guardião' }],
    };
    const result = applyItemEnhancements(item);
    expect(result.defenseBonus).toBe(8);
  });

  test('Acrobático adds a Skill SheetBonus on Acrobacia', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Couro batido',
      group: 'Armadura',
      defenseBonus: 3,
      armorPenalty: 1,
      spaces: 2,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      enchantments: [{ enchantment: 'Acrobático' }],
    };
    const result = applyItemEnhancements(item);
    const skillBonus = (result.sheetBonuses ?? []).find(
      (b) => b.target.type === 'Skill'
    );
    expect(skillBonus).toBeDefined();
    if (skillBonus && skillBonus.target.type === 'Skill') {
      expect(skillBonus.target.name).toBe(Skill.ACROBACIA);
    }
    if (skillBonus && skillBonus.modifier.type === 'Fixed') {
      expect(skillBonus.modifier.value).toBe(2);
    }
  });

  test('mod + ench stack on the same stat without double counting', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Certeira' }], // +1 atk
      enchantments: [{ enchantment: 'Formidável' }], // +2 atk +2 dmg
    };
    const result = applyItemEnhancements(item);
    expect(result.atkBonus).toBe(3);
    expect(result.dano).toBe('1d8+2');
    expect(result.baseAtkBonus).toBe(0);
    expect(result.baseDano).toBe('1d8');
  });

  test('is idempotent: applying twice yields the same result', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Cruel' }],
      enchantments: [{ enchantment: 'Formidável' }],
    };
    const first = applyItemEnhancements(item);
    const second = applyItemEnhancements(first);
    expect(second.dano).toBe(first.dano);
    expect(second.atkBonus).toBe(first.atkBonus);
    expect(second.baseDano).toBe(first.baseDano);
    expect(second.baseAtkBonus).toBe(first.baseAtkBonus);
  });

  test('mod Reforçada + ench Defensor stack on armor defenseBonus', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Couro batido',
      group: 'Armadura',
      defenseBonus: 3,
      armorPenalty: 1,
      spaces: 2,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      modifications: [{ mod: 'Reforçada' }], // +1 def, +1 penalty
      enchantments: [{ enchantment: 'Defensor' }], // +2 def
    };
    const result = applyItemEnhancements(item);
    expect(result.defenseBonus).toBe(6); // 3 + 1 + 2
    expect(result.armorPenalty).toBe(2); // 1 + 1
  });

  describe('extra damage pipeline', () => {
    test('Flamejante adds a derived 1d6 Fogo entry tagged as enchantment', () => {
      const item: Equipment = {
        ...baseSword,
        enchantments: [{ enchantment: 'Flamejante' }],
      };
      const result = applyItemEnhancements(item);
      expect(result.extraDamage).toBeDefined();
      expect(result.extraDamage).toHaveLength(1);
      expect(result.extraDamage?.[0]).toMatchObject({
        dice: '1d6',
        damageType: 'Fogo',
        source: 'enchantment',
        sourceName: 'Flamejante',
      });
    });

    test('Tumular adds 1d8 Trevas (different dice from 1d6 elementals)', () => {
      const item: Equipment = {
        ...baseSword,
        enchantments: [{ enchantment: 'Tumular' }],
      };
      const result = applyItemEnhancements(item);
      expect(result.extraDamage?.[0]).toMatchObject({
        dice: '1d8',
        damageType: 'Trevas',
      });
    });

    test('preserves user extra damage entries while regenerating derived', () => {
      const item: Equipment = {
        ...baseSword,
        extraDamage: [
          {
            id: 'user-1',
            dice: '1d4',
            damageType: 'Psíquico',
            source: 'user',
          },
        ],
        enchantments: [{ enchantment: 'Flamejante' }],
      };
      const result = applyItemEnhancements(item);
      expect(result.extraDamage).toHaveLength(2);
      expect(result.extraDamage?.[0]).toMatchObject({
        source: 'user',
        damageType: 'Psíquico',
      });
      expect(result.extraDamage?.[1]).toMatchObject({
        source: 'enchantment',
        sourceName: 'Flamejante',
      });
    });

    test('strips stale derived entries when source enchantment is removed', () => {
      // Item that previously had Flamejante (derived entry persisted) but the
      // enchantment was removed. Pipeline should clean it up.
      const item: Equipment = {
        ...baseSword,
        extraDamage: [
          {
            dice: '1d6',
            damageType: 'Fogo',
            source: 'enchantment',
            sourceName: 'Flamejante',
          },
        ],
      };
      const result = applyItemEnhancements(item);
      expect(result.extraDamage).toBeUndefined();
    });

    test('is idempotent for derived extra damage', () => {
      const item: Equipment = {
        ...baseSword,
        enchantments: [{ enchantment: 'Flamejante' }],
      };
      const first = applyItemEnhancements(item);
      const second = applyItemEnhancements(first);
      expect(second.extraDamage).toHaveLength(1);
      expect(second.extraDamage?.[0]).toMatchObject({
        sourceName: 'Flamejante',
      });
    });

    test('combines mod + multiple ench-derived extra damages', () => {
      const item: Equipment = {
        ...baseSword,
        modifications: [{ mod: 'Certeira' }],
        enchantments: [
          { enchantment: 'Flamejante' },
          { enchantment: 'Congelante' },
        ],
      };
      const result = applyItemEnhancements(item);
      expect(result.atkBonus).toBe(1); // Certeira
      expect(result.extraDamage).toHaveLength(2);
      const types = result.extraDamage?.map((e) => e.damageType).sort();
      expect(types).toEqual(['Fogo', 'Frio']);
    });

    test('user-only extra damage runs through pipeline without changing stats', () => {
      const item: Equipment = {
        ...baseSword,
        extraDamage: [
          {
            id: 'user-1',
            dice: '1d4',
            damageType: 'Luz',
            source: 'user',
          },
        ],
      };
      const result = applyItemEnhancements(item);
      expect(result.dano).toBe('1d8');
      expect(result.atkBonus).toBe(0);
      expect(result.extraDamage).toHaveLength(1);
      expect(result.extraDamage?.[0].source).toBe('user');
    });
  });
});
