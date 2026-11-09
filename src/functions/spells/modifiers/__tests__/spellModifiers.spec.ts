import { createMockCharacterSheet } from '../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../interfaces/CharacterSheet';
import Equipment from '../../../../interfaces/Equipment';
import { Spell } from '../../../../interfaces/Spells';
import type { SpellModifier } from '../../../../interfaces/SpellModifiers';
import {
  spellsCircle1,
  spellsCircle2,
  spellsCircle3,
} from '../../../../data/systems/tormenta20/magias/generalSpells';
import ARCANISTA from '../../../../data/systems/tormenta20/classes/arcanista';
import DRUIDA from '../../../../data/systems/tormenta20/classes/druida';
import { augmentSpellRolls } from '../../../spellRollAugmentation';
import {
  applySpellEffectModifiers,
  applySpellRollModifiers,
  EffectOptionLike,
  computeSpellPmCost,
  getSpellDisplayPmCost,
  resolveSpellCast,
} from '..';

const CURAR_FERIMENTOS = spellsCircle1.curarFerimentos;
const SOPRO_DA_SALVACAO = spellsCircle3.soproDaSalvacao;
const BOLA_DE_FOGO = spellsCircle2.bolaDeFogo;

/** Cópia "de ficha antiga": só nome e texto, sem `spellModifiers`. */
const withClassPowers = (powers: string[]): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.classPowers = powers.map((name) => ({ name, text: '' }));
  return sheet;
};

const customPower = (name: string, spellModifiers: SpellModifier[]) => ({
  id: name,
  name,
  description: '',
  spellModifiers,
});

describe('catálogo: modificadores declarados nos dados', () => {
  it('Mago Branco vale mesmo na cópia antiga do poder (sem o campo)', () => {
    const profile = resolveSpellCast(
      withClassPowers(['Mago Branco']),
      CURAR_FERIMENTOS
    );
    expect(profile.pmReduction).toBe(1);
    expect(profile.pmReductionSources).toEqual(['Mago Branco']);
    expect(profile.healing).toEqual({ perDie: 1, flat: 0 });
  });

  it('Mago Branco não afeta magia fora de "cura de luz"', () => {
    const profile = resolveSpellCast(
      withClassPowers(['Mago Branco']),
      BOLA_DE_FOGO
    );
    expect(profile.pmReduction).toBe(0);
    expect(profile.healing.perDie).toBe(0);
  });

  it('sem ficha só vale a redução gravada na magia', () => {
    const profile = resolveSpellCast(undefined, {
      ...BOLA_DE_FOGO,
      manaReduction: 1,
    });
    expect(profile.pmReduction).toBe(1);
    expect(profile.pmReductionSources).toEqual([]);
  });
});

describe('poder criado à mão (homebrew na ficha)', () => {
  it('usa os `spellModifiers` da própria cópia', () => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = [
      customPower('Foco Evocador', [
        {
          filter: { schools: ['Evoc'] },
          effect: { type: 'PmReduction', value: 1 },
        },
      ]),
    ];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(1);
    expect(resolveSpellCast(sheet, spellsCircle1.sono).pmReduction).toBe(0);
  });
});

describe('reduções de custo (JdA, Reduções de Custo)', () => {
  const sheetWith = (modifiers: SpellModifier[]): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.customPowers = modifiers.map((m, i) => customPower(`P${i}`, [m]));
    return sheet;
  };

  it('não cumulativas: vale a maior, inclusive contra a gravada na magia', () => {
    const sheet = sheetWith([
      { effect: { type: 'PmReduction', value: 1 } },
      { effect: { type: 'PmReduction', value: 2 } },
    ]);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(2);
    expect(
      resolveSpellCast(sheet, { ...BOLA_DE_FOGO, manaReduction: 3 }).pmReduction
    ).toBe(3);
  });

  it('cumulativas somam por cima da maior', () => {
    const sheet = sheetWith([
      { effect: { type: 'PmReduction', value: 1 } },
      { effect: { type: 'PmReduction', value: 1, cumulative: true } },
    ]);
    const profile = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(profile.pmReduction).toBe(2);
    expect(profile.pmReductionSources).toEqual(['P0', 'P1']);
  });

  it('metade depois das reduções e piso de 1 PM', () => {
    expect(computeSpellPmCost(10, { pmReduction: 2, pmHalve: true })).toBe(4);
    expect(computeSpellPmCost(3, { pmReduction: 1, pmHalve: false })).toBe(2);
    expect(computeSpellPmCost(1, { pmReduction: 1, pmHalve: false })).toBe(1);
    expect(computeSpellPmCost(1, { pmReduction: 0, pmHalve: true })).toBe(1);
    expect(computeSpellPmCost(0, { pmReduction: 1, pmHalve: false })).toBe(0);
  });

  it('custo exibido de 1º círculo com Mago Branco continua 1 PM', () => {
    const sheet = withClassPowers(['Mago Branco']);
    expect(getSpellDisplayPmCost(sheet, CURAR_FERIMENTOS)).toBe(1);
    expect(getSpellDisplayPmCost(sheet, SOPRO_DA_SALVACAO)).toBe(5);
  });
});

describe('rolagens', () => {
  const curarWith = (augments: number, sheet: CharacterSheet) => {
    const aprimoramento = CURAR_FERIMENTOS.aprimoramentos?.find((a) =>
      a.text.startsWith('aumenta a cura')
    );
    if (!aprimoramento) throw new Error('aprimoramento não encontrado');
    return applySpellRollModifiers(
      augmentSpellRolls(CURAR_FERIMENTOS.rolls ?? [], [
        { aprimoramento, count: augments },
      ]),
      resolveSpellCast(sheet, CURAR_FERIMENTOS)
    );
  };

  it('Curar Ferimentos +2 aprimoramentos com Mago Branco = 4d8+8 (fórum)', () => {
    const rolls = curarWith(2, withClassPowers(['Mago Branco']));
    expect(rolls.find((r) => r.label === 'Recuperar vida')?.dice).toBe('4d8+8');
    // O dano do truque não é cura.
    expect(rolls.find((r) => r.label.startsWith('Dano de Luz'))?.dice).toBe(
      '1d8'
    );
  });

  it('sem o poder a cura fica igual', () => {
    const rolls = curarWith(2, withClassPowers([]));
    expect(rolls.find((r) => r.label === 'Recuperar vida')?.dice).toBe('4d8+4');
  });
});

describe('efeito ativo da magia', () => {
  const BENCAO: Spell = spellsCircle1.bencao;
  const bencaoOption = (value: number): EffectOptionLike => ({
    bonuses: [
      {
        target: { type: 'AllAttackBonus' as const },
        modifier: { type: 'Fixed' as const, value },
      },
      {
        target: { type: 'WeaponDamage' as const },
        modifier: { type: 'Fixed' as const, value },
      },
    ],
  });

  it('Bênção Fortalecedora: 5 PV temporários por +1 em ataque', () => {
    const profile = resolveSpellCast(
      withClassPowers(['Bênção Fortalecedora']),
      BENCAO
    );
    expect(
      applySpellEffectModifiers(bencaoOption(2), profile).grantsTempPV
    ).toBe(10);
  });

  it('Medalhão afiado na mochila: +1 de margem, com o filtro do ataque', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Esotérico = [
      { nome: 'Medalhão afiado', group: 'Esotérico' } as Equipment,
    ];
    const profile = resolveSpellCast(sheet, BENCAO);
    const medalhaoInput: EffectOptionLike = {
      bonuses: [
        {
          target: { type: 'WeaponAttack' as const, meleeOnly: true },
          modifier: { type: 'Fixed' as const, value: 2 },
        },
        // Penalidade (Perdição) não é bônus.
        {
          target: { type: 'AllAttackBonus' as const },
          modifier: { type: 'Fixed' as const, value: -1 },
        },
      ],
    };
    const option = applySpellEffectModifiers(medalhaoInput, profile);
    expect(option.bonuses).toContainEqual({
      target: { type: 'WeaponThreatMargin', meleeOnly: true },
      modifier: { type: 'Fixed', value: 1 },
    });
    expect(
      option.bonuses.filter((b) => b.target.type === 'WeaponThreatMargin')
    ).toHaveLength(1);
  });

  it('sem modificadores de efeito, a opção volta intacta', () => {
    const option = bencaoOption(1);
    expect(
      applySpellEffectModifiers(option, resolveSpellCast(undefined, BENCAO))
    ).toBe(option);
  });
});

describe('esotérico precisa estar empunhado (JdA)', () => {
  const medalhao = {
    id: 'medalhao',
    nome: 'Medalhão afiado',
    group: 'Esotérico',
  } as Equipment;
  const hasThreatMargin = (sheet: CharacterSheet): boolean =>
    resolveSpellCast(sheet, spellsCircle1.bencao).effectThreatMargin.length > 0;
  const sheetWithMedalhao = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Esotérico = [medalhao];
    return sheet;
  };

  it('ficha legada (nada marcado nas mãos): vale estando na mochila', () => {
    expect(hasThreatMargin(sheetWithMedalhao())).toBe(true);
  });

  it('com outra coisa nas mãos, o esotérico guardado não vale', () => {
    const sheet = sheetWithMedalhao();
    sheet.mainHandItemId = 'espada';
    expect(hasThreatMargin(sheet)).toBe(false);
  });

  it('empunhado, vale', () => {
    const sheet = sheetWithMedalhao();
    sheet.mainHandItemId = 'espada';
    sheet.offHandItemId = 'medalhao';
    expect(hasThreatMargin(sheet)).toBe(true);
  });
});

describe('fase B: passivos de itens e poderes', () => {
  const ARMADURA_ARCANA = spellsCircle1.armaduraArcana;
  const esoterico = (nome: string): Equipment =>
    ({ id: nome, nome, group: 'Esotérico' } as Equipment);
  const withItems = (items: Equipment[], powers: string[] = []) => {
    const sheet = withClassPowers(powers);
    sheet.bag.equipments.Esotérico = items;
    return sheet;
  };

  it('Medalhão de prata: –1 PM só em magia de alcance pessoal', () => {
    const sheet = withItems([esoterico('Medalhão de prata')]);
    expect(resolveSpellCast(sheet, ARMADURA_ARCANA).pmReduction).toBe(1);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(0);
  });

  it('Varinha arcana e Recruta Arcano: CD +1 cada nas arcanas, não nas divinas', () => {
    const sheet = withItems([esoterico('Varinha arcana')]);
    sheet.origin = {
      name: 'Teste',
      powers: [{ name: 'Recruta Arcano', description: '', type: 'origem' }],
    } as unknown as CharacterSheet['origin'];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).dcBonus).toBe(2);
    expect(resolveSpellCast(sheet, CURAR_FERIMENTOS).dcBonus).toBe(0);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).damage.flat).toBe(1);
  });

  it('Costela de lich: rolagem extra de 1d6 de trevas em magia de dano', () => {
    const sheet = withItems([esoterico('Costela de lich')]);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).extraRolls).toEqual([
      expect.objectContaining({ dice: '1d6', damageType: 'trevas' }),
    ]);
    expect(resolveSpellCast(sheet, ARMADURA_ARCANA).extraRolls).toEqual([]);
  });

  it('PM para aprimoramentos não acumulam: Bolsa de pó (+2) e Magia Instintiva (+1) dão +2', () => {
    const sheet = withItems([esoterico('Bolsa de pó')]);
    sheet.raca = {
      ...sheet.raca,
      abilities: [{ name: 'Magia Instintiva', description: '' }],
    };
    expect(resolveSpellCast(sheet, spellsCircle1.sono).aprimoramentoPm).toBe(2);
    // Fora de encantamento/ilusão, só a Magia Instintiva.
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).aprimoramentoPm).toBe(1);
  });

  it('Luva de ferro: +1 no bônus de Defesa de magia arcana pessoal', () => {
    const profile = resolveSpellCast(
      withItems([esoterico('Luva de ferro')]),
      ARMADURA_ARCANA
    );
    const option = applySpellEffectModifiers(
      {
        bonuses: [
          {
            target: { type: 'Defense' as const },
            modifier: { type: 'Fixed' as const, value: 5 },
          },
        ],
      },
      profile
    );
    expect(option.bonuses).toEqual([
      { target: { type: 'Defense' }, modifier: { type: 'Fixed', value: 6 } },
    ]);
  });

  it('Lira de casco de tartaruga só vale para bardo', () => {
    const lira = {
      id: 'lira',
      nome: 'Lira de casco de tartaruga',
      group: 'Item Geral',
    } as unknown as Equipment;
    const cure = { ...CURAR_FERIMENTOS };
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments['Item Geral'] = [lira];
    expect(resolveSpellCast(sheet, cure).healing.perDie).toBe(0);
    sheet.classe = { ...sheet.classe, name: 'Bardo' };
    expect(resolveSpellCast(sheet, cure).healing.perDie).toBe(1);
  });
});

describe('habilidades de classe respeitam o nível', () => {
  const arcanistaAt = (nivel: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.classe = { ...ARCANISTA };
    sheet.nivel = nivel;
    return sheet;
  };

  it('Alta Arcana só no 20º nível', () => {
    expect(resolveSpellCast(arcanistaAt(10), BOLA_DE_FOGO).pmHalve).toBe(false);
    expect(resolveSpellCast(arcanistaAt(20), BOLA_DE_FOGO).pmHalve).toBe(true);
    // Divina não é afetada.
    expect(resolveSpellCast(arcanistaAt(20), CURAR_FERIMENTOS).pmHalve).toBe(
      false
    );
  });

  it('"Força da Natureza" de HdA (poder) não ganha o –2 PM da habilidade do druida 20', () => {
    const sheet = withClassPowers(['Força da Natureza']);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(0);
    const druida = createMockCharacterSheet();
    druida.classe = { ...DRUIDA };
    druida.nivel = 20;
    expect(resolveSpellCast(druida, BOLA_DE_FOGO).pmReduction).toBe(2);
    expect(resolveSpellCast(druida, BOLA_DE_FOGO).dcBonus).toBe(2);
  });
});
