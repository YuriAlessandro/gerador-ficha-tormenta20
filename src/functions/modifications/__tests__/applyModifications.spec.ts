import {
  adjustCriticoMult,
  adjustCriticoThreat,
  adjustDanoBonus,
  applyModificationsToEquipment,
} from '../applyModifications';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';

describe('adjustDanoBonus', () => {
  test('appends a positive bonus when dano has none', () => {
    expect(adjustDanoBonus('1d6', 1)).toBe('1d6+1');
  });

  test('sums with an existing positive bonus', () => {
    expect(adjustDanoBonus('1d6+1', 2)).toBe('1d6+3');
  });

  test('cancels a negative bonus to zero', () => {
    expect(adjustDanoBonus('1d8-1', 1)).toBe('1d8');
  });

  test('produces a negative bonus when delta exceeds existing positive', () => {
    expect(adjustDanoBonus('1d8+1', -2)).toBe('1d8-1');
  });
});

describe('adjustCriticoMult', () => {
  test('increments multiplier on a no-threat critico', () => {
    expect(adjustCriticoMult('x2', 1)).toBe('x3');
  });

  test('preserves threat range when incrementing multiplier', () => {
    expect(adjustCriticoMult('18/x2', 1)).toBe('18/x3');
  });

  test('does not drop below x2', () => {
    expect(adjustCriticoMult('x2', -5)).toBe('x2');
  });
});

describe('adjustCriticoThreat', () => {
  test('widens threat range from default 20 to 19', () => {
    expect(adjustCriticoThreat('x2', 1)).toBe('19/x2');
  });

  test('widens an explicit threat range', () => {
    expect(adjustCriticoThreat('18/x2', 1)).toBe('17/x2');
  });
});

describe('applyModificationsToEquipment', () => {
  const baseSword: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
  };

  test('returns the item untouched when there are no modifications', () => {
    const result = applyModificationsToEquipment(baseSword);
    expect(result).toBe(baseSword);
  });

  test('applies Cruel (+1 damage) and persists base values', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Cruel' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.dano).toBe('1d8+1');
    expect(result.baseDano).toBe('1d8');
    expect(result.atkBonus).toBe(0);
  });

  test('stacks Cruel + Atroz (+3 damage total)', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Cruel' }, { mod: 'Atroz' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.dano).toBe('1d8+3');
  });

  test('stacks Certeira + Pungente (+3 attack total)', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Certeira' }, { mod: 'Pungente' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.atkBonus).toBe(3);
  });

  test('Maciça raises critical multiplier', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Maciça' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.critico).toBe('x3');
  });

  test('Precisa widens critical threat range', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Precisa' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.critico).toBe('19/x2');
  });

  test('Discreta reduces space and adds Furtividade bonus', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Discreta' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.spaces).toBe(0);
    expect(result.baseSpaces).toBe(1);
    const skillBonus = (result.sheetBonuses ?? []).find(
      (b) => b.target.type === 'Skill'
    );
    expect(skillBonus).toBeDefined();
    if (skillBonus && skillBonus.target.type === 'Skill') {
      expect(skillBonus.target.name).toBe(Skill.FURTIVIDADE);
    }
  });

  test('removing modifications restores base stats', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Cruel' }],
    };
    const modified = applyModificationsToEquipment(item);
    const reset: Equipment = { ...modified, modifications: [] };
    expect(reset.modifications).toEqual([]);
    // applyModificationsToEquipment returns early for empty modifications,
    // so consumers should themselves restore from base. Simulate that.
    const restored: Equipment = {
      ...reset,
      dano: reset.baseDano ?? reset.dano,
      atkBonus: reset.baseAtkBonus ?? reset.atkBonus,
      critico: reset.baseCritico ?? reset.critico,
      spaces: reset.baseSpaces ?? reset.spaces,
      sheetBonuses: reset.baseSheetBonuses ?? [],
    };
    expect(restored.dano).toBe('1d8');
  });

  test('is idempotent: applying twice yields the same result', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Cruel' }, { mod: 'Maciça' }],
    };
    const first = applyModificationsToEquipment(item);
    const second = applyModificationsToEquipment(first);
    expect(second.dano).toBe(first.dano);
    expect(second.critico).toBe(first.critico);
    expect(second.baseDano).toBe(first.baseDano);
    expect(second.baseCritico).toBe(first.baseCritico);
  });

  test('applies Reforçada to defense equipment', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Couro batido',
      group: 'Armadura',
      defenseBonus: 3,
      armorPenalty: 1,
      spaces: 2,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      modifications: [{ mod: 'Reforçada' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.defenseBonus).toBe(4);
    expect(result.armorPenalty).toBe(2);
    expect(result.baseDefenseBonus).toBe(3);
    expect(result.baseArmorPenalty).toBe(1);
  });

  test('Sob medida + Ajustada cumulatively reduce armor penalty', () => {
    const baseArmor: DefenseEquipment = {
      nome: 'Cota de malha',
      group: 'Armadura',
      defenseBonus: 4,
      armorPenalty: 4,
      spaces: 3,
    };
    const item: DefenseEquipment = {
      ...baseArmor,
      modifications: [{ mod: 'Ajustada' }, { mod: 'Sob medida' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.armorPenalty).toBe(1);
  });

  test('preserves existing sheetBonuses as base and merges with mod-derived ones', () => {
    const item: Equipment = {
      ...baseSword,
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: 'Espada Longa' },
          target: { type: 'Skill', name: Skill.LUTA },
          modifier: { type: 'Fixed', value: 1 },
        },
      ],
      modifications: [{ mod: 'Banhada a ouro' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.sheetBonuses).toHaveLength(2);
    const skills = (result.sheetBonuses ?? [])
      .map((b) => (b.target.type === 'Skill' ? b.target.name : null))
      .filter(Boolean);
    expect(skills).toContain(Skill.LUTA);
    expect(skills).toContain(Skill.DIPLOMACIA);
  });

  test('text-only modifications do not alter numeric stats', () => {
    const item: Equipment = {
      ...baseSword,
      modifications: [{ mod: 'Material especial', specialMaterial: 'mitral' }],
    };
    const result = applyModificationsToEquipment(item);
    expect(result.dano).toBe('1d8');
    expect(result.atkBonus).toBe(0);
    expect(result.critico).toBe('x2');
  });
});
