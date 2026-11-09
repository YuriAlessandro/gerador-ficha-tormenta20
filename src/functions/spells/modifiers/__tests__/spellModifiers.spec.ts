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
