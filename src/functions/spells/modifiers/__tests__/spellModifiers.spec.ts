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
import { getRollDamageType } from '../../damageTypes';
import { GeneralPowerType } from '../../../../interfaces/Poderes';
import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import { applyPower } from '../../../general';
import {
  applySpellEffectModifiers,
  applySpellRollModifiers,
  EffectOptionLike,
  computeSpellPmCost,
  getSpellDisplayPmCost,
  resolveSpellCast,
  toggleSpellModifierChoice,
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

describe('fase C: escolhas de escola (chooseFromOptions)', () => {
  const power = (name: string) => {
    const found = ARCANISTA.powers.find((p) => p.name === name);
    if (!found) throw new Error(name);
    return found;
  };

  it('Mestre em Escola: aplicar o poder grava a escola e reduz o custo nela', () => {
    const MESTRE = power('Mestre em Escola');
    const base = createMockCharacterSheet();
    base.classPowers = [MESTRE];
    const [sheet] = applyPower(base, MESTRE, { chosenOption: ['Evocação'] });
    expect(sheet.optionChoices?.mestreEmEscola).toEqual(['Evocação']);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(1);
    expect(resolveSpellCast(sheet, spellsCircle1.sono).pmReduction).toBe(0);
  });

  it('Especialista em Escola: +2 na CD só da escola escolhida', () => {
    const sheet = withClassPowers(['Especialista em Escola']);
    sheet.optionChoices = { especialistaEmEscola: ['Encantamento'] };
    expect(resolveSpellCast(sheet, spellsCircle1.sono).dcBonus).toBe(2);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).dcBonus).toBe(0);
  });

  it('sem escolha gravada (ficha antiga) não aplica nada', () => {
    const sheet = withClassPowers(['Mestre em Escola']);
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(0);
  });
});

describe('um esotérico por magia (JdA)', () => {
  const item = (id: string, nome: string): Equipment =>
    ({ id, nome, group: 'Esotérico' } as Equipment);
  const sheet = (): CharacterSheet => {
    const s = createMockCharacterSheet();
    s.bag.equipments.Esotérico = [
      item('varinha', 'Varinha arcana'),
      item('medalhao', 'Medalhão de prata'),
    ];
    s.mainHandItemId = 'varinha';
    s.offHandItemId = 'medalhao';
    return s;
  };
  const ARMADURA_ARCANA = spellsCircle1.armaduraArcana;

  it('dois esotéricos empunhados: só um vale, e os dois viram opção', () => {
    const profile = resolveSpellCast(sheet(), ARMADURA_ARCANA);
    expect(profile.esotericOptions).toEqual([
      'Varinha arcana',
      'Medalhão de prata',
    ]);
    expect(profile.esoterics).toEqual(['Varinha arcana']);
    expect(profile.dcBonus).toBe(1);
    expect(profile.pmReduction).toBe(0);
  });

  it('o escolhido no lançamento substitui o outro', () => {
    const profile = resolveSpellCast(sheet(), ARMADURA_ARCANA, {
      esoterics: ['Medalhão de prata'],
    });
    expect(profile.pmReduction).toBe(1);
    expect(profile.dcBonus).toBe(0);
  });

  it('esotérico que não afeta a magia nem entra como opção', () => {
    // Bola de Fogo não é pessoal: o Medalhão de prata não se aplica.
    const profile = resolveSpellCast(sheet(), BOLA_DE_FOGO);
    expect(profile.esotericOptions).toEqual(['Varinha arcana']);
  });
});

describe('fase C: escolher magias (spellChoice)', () => {
  const foco = (picks: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = Array.from({ length: picks }, () => ({
      name: 'Foco em Magia',
      description: '',
      type: 'MAGIA',
      requirements: [],
    })) as unknown as CharacterSheet['generalPowers'];
    return sheet;
  };

  it('magia elegível mostra a vaga; marcar aplica a redução', () => {
    const sheet = foco(1);
    const before = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(before.spellChoices).toEqual([
      {
        key: 'Foco em Magia',
        source: 'Foco em Magia',
        chosen: false,
        of: 'spell',
        value: 'Bola de Fogo',
        used: 0,
        max: 1,
      },
    ]);
    expect(before.pmReduction).toBe(0);

    sheet.spellModifierChoices = toggleSpellModifierChoice(
      sheet,
      'Foco em Magia',
      BOLA_DE_FOGO
    );
    const after = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(after.spellChoices[0]).toMatchObject({ chosen: true, used: 1 });
    expect(after.pmReduction).toBe(1);
    // Outra magia não é afetada e a vaga já está cheia.
    expect(
      toggleSpellModifierChoice(sheet, 'Foco em Magia', CURAR_FERIMENTOS)
    ).toBeUndefined();
  });

  it('uma vaga por vez que o poder foi escolhido', () => {
    const sheet = foco(2);
    sheet.spellModifierChoices = { 'Foco em Magia': ['Bola de Fogo'] };
    expect(resolveSpellCast(sheet, CURAR_FERIMENTOS).spellChoices[0]).toEqual({
      key: 'Foco em Magia',
      source: 'Foco em Magia',
      chosen: false,
      of: 'spell',
      value: 'Curar Ferimentos',
      used: 1,
      max: 2,
    });
  });

  it('Foco em Magia acumula com a redução não cumulativa (Mago Branco)', () => {
    const sheet = foco(1);
    sheet.classPowers = [{ name: 'Mago Branco', text: '' }];
    sheet.spellModifierChoices = { 'Foco em Magia': ['Sopro da Salvação'] };
    expect(resolveSpellCast(sheet, SOPRO_DA_SALVACAO).pmReduction).toBe(2);
  });

  it('desmarcar libera a vaga', () => {
    const sheet = foco(1);
    sheet.spellModifierChoices = { 'Foco em Magia': ['Bola de Fogo'] };
    expect(
      toggleSpellModifierChoice(sheet, 'Foco em Magia', BOLA_DE_FOGO)
    ).toEqual({ 'Foco em Magia': [] });
  });

  it('elegibilidade: Acólito Escudeiro só em magia de 1º círculo', () => {
    const sheet = withClassPowers(['Acólito Escudeiro']);
    expect(resolveSpellCast(sheet, CURAR_FERIMENTOS).spellChoices).toHaveLength(
      1
    );
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices).toHaveLength(0);
  });

  it('Aspecto da Primavera: vagas = Carisma (mínimo 1)', () => {
    const sheet = withClassPowers(['Aspecto da Primavera']);
    sheet.atributos.Carisma = { name: 'Carisma', value: 3 } as never;
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices[0].max).toBe(3);
    sheet.atributos.Carisma = { name: 'Carisma', value: -1 } as never;
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices[0].max).toBe(1);
  });
});

describe('escolha de escola em item (Tomo hermético)', () => {
  it('marcar a partir de uma magia escolhe a escola dela', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Esotérico = [
      { id: 'tomo', nome: 'Tomo hermético', group: 'Esotérico' } as Equipment,
    ];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).dcBonus).toBe(0);
    sheet.spellModifierChoices = toggleSpellModifierChoice(
      sheet,
      'Tomo hermético',
      BOLA_DE_FOGO
    );
    expect(sheet.spellModifierChoices).toEqual({ 'Tomo hermético': ['Evoc'] });
    // Outra magia de evocação também ganha; outra escola, não.
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).dcBonus).toBe(2);
    expect(resolveSpellCast(sheet, spellsCircle1.sono).dcBonus).toBe(0);
    expect(
      resolveSpellCast(sheet, spellsCircle1.sono).spellChoices[0]
    ).toMatchObject({ chosen: false, used: 1, max: 1 });
  });
});

describe('fase D: opções de lançamento (CastOption)', () => {
  it('Magia Pungente: aparece desmarcada; marcada soma +1 PM e +2 na CD', () => {
    const sheet = withClassPowers(['Magia Pungente']);
    const idle = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(idle.castOptions).toEqual([
      expect.objectContaining({
        key: 'Magia Pungente:pungente',
        addPm: 1,
        active: false,
      }),
    ]);
    expect(idle.dcBonus).toBe(0);
    const on = resolveSpellCast(sheet, BOLA_DE_FOGO, {
      castOptions: ['Magia Pungente:pungente'],
    });
    expect(on.castOptionPm).toBe(1);
    expect(on.dcBonus).toBe(2);
  });

  it('Urro Divino: soma a Constituição (mínimo +1) no dano', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { name: 'Urro Divino', description: '', requirements: [] },
    ] as unknown as CharacterSheet['generalPowers'];
    sheet.atributos.Constituição = { name: 'Constituição', value: 3 } as never;
    const on = { castOptions: ['Urro Divino:urro'] };
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO, on).damage.flat).toBe(3);
    sheet.atributos.Constituição = { name: 'Constituição', value: -1 } as never;
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO, on).damage.flat).toBe(1);
    // Magia sem dano não oferece a opção.
    expect(resolveSpellCast(sheet, spellsCircle1.sono).castOptions).toEqual([]);
  });

  it('Espírito dos Solstícios: Curar Ferimentos 5d8+5 maximizado cura 45', () => {
    const sheet = createMockCharacterSheet();
    sheet.classPowers = [{ name: 'Espírito dos Solstícios', text: '' }];
    const aprimoramento = CURAR_FERIMENTOS.aprimoramentos?.find((a) =>
      a.text.startsWith('aumenta a cura')
    );
    if (!aprimoramento) throw new Error('aprimoramento não encontrado');
    const profile = resolveSpellCast(sheet, CURAR_FERIMENTOS, {
      castOptions: ['Espírito dos Solstícios:solsticios'],
    });
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(CURAR_FERIMENTOS.rolls ?? [], [
        { aprimoramento, count: 3 },
      ]),
      profile
    );
    expect(rolls.find((r) => r.label === 'Recuperar vida')?.dice).toBe('45');
    expect(profile.castOptionPm).toBe(4);
  });

  it('Magia Sagrada/Profana segue a energia canalizada', () => {
    const sheet = withClassPowers(['Magia Sagrada/Profana']);
    sheet.devoto = {
      divindade: { name: 'Teste', energy: 'positiva' },
      poderes: [],
    } as unknown as CharacterSheet['devoto'];
    const DIVINE_DAMAGE: Spell = {
      ...BOLA_DE_FOGO,
      nome: 'Teste Divino',
      rolls: [{ id: 'd', label: 'Dano', dice: '2d6', damageType: 'fogo' }],
    };
    const profile = resolveSpellCast(sheet, CURAR_FERIMENTOS);
    // Curar Ferimentos é divina e tem rolagem de dano (truque).
    expect(profile.castOptions.map((o) => o.key)).toEqual([
      'Magia Sagrada/Profana:sagrada',
    ]);
    const on = resolveSpellCast(sheet, CURAR_FERIMENTOS, {
      castOptions: ['Magia Sagrada/Profana:sagrada'],
    });
    expect(on.damageTypeOverride).toBe('luz');
    // Magia fora do catálogo não tem tradição conhecida: não é "divina".
    expect(resolveSpellCast(sheet, DIVINE_DAMAGE).castOptions).toEqual([]);
  });

  it('Magia Acelerada só em magia de movimento, padrão ou completa', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { name: 'Magia Acelerada', description: '', requirements: [] },
    ] as unknown as CharacterSheet['generalPowers'];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).castOptions).toHaveLength(1);
    expect(
      resolveSpellCast(sheet, { ...BOLA_DE_FOGO, execucao: 'Reação' })
        .castOptions
    ).toHaveLength(0);
  });
});

describe('opção de lançamento que oferece efeito ativo', () => {
  it('Barreira Mística: +1 PM e oferece o efeito magic:barreira-mistica', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      { name: 'Barreira Mística', description: '', requirements: [] },
    ] as unknown as CharacterSheet['generalPowers'];
    const [option] = resolveSpellCast(sheet, BOLA_DE_FOGO, {
      castOptions: ['Barreira Mística:barreira'],
    }).castOptions;
    expect(option).toMatchObject({
      addPm: 1,
      active: true,
      activeEffectKey: 'magic:barreira-mistica',
    });
  });
});

describe('Esoterismo: dois esotéricos ao mesmo tempo', () => {
  const item = (id: string, nome: string): Equipment =>
    ({ id, nome, group: 'Esotérico' } as Equipment);
  const ARMADURA_ARCANA = spellsCircle1.armaduraArcana;
  const sheetWith = (withPower: boolean): CharacterSheet => {
    const s = createMockCharacterSheet();
    s.bag.equipments.Esotérico = [
      item('varinha', 'Varinha arcana'),
      item('medalhao', 'Medalhão de prata'),
    ];
    s.mainHandItemId = 'varinha';
    s.offHandItemId = 'medalhao';
    if (withPower) {
      s.generalPowers = [
        { name: 'Esoterismo', description: '', requirements: [] },
      ] as unknown as CharacterSheet['generalPowers'];
    }
    return s;
  };
  const ON = { castOptions: ['Esoterismo:esoterismo'] };

  it('a opção só aparece com dois esotéricos que afetam a magia', () => {
    expect(
      resolveSpellCast(sheetWith(true), ARMADURA_ARCANA).castOptions.map(
        (o) => o.key
      )
    ).toEqual(['Esoterismo:esoterismo']);
    // Bola de Fogo não é pessoal: só a Varinha afeta.
    expect(resolveSpellCast(sheetWith(true), BOLA_DE_FOGO).castOptions).toEqual(
      []
    );
  });

  it('marcada: +2 PM e os dois esotéricos valem juntos', () => {
    const profile = resolveSpellCast(sheetWith(true), ARMADURA_ARCANA, ON);
    expect(profile.esotericLimit).toBe(2);
    expect(profile.esoterics).toEqual(['Varinha arcana', 'Medalhão de prata']);
    expect(profile.castOptionPm).toBe(2);
    expect(profile.dcBonus).toBe(1);
    expect(profile.pmReduction).toBe(1);
  });

  it('sem o poder, a opção não existe e o limite fica em 1', () => {
    const profile = resolveSpellCast(sheetWith(false), ARMADURA_ARCANA, ON);
    expect(profile.castOptions).toEqual([]);
    expect(profile.esoterics).toHaveLength(1);
  });
});

describe('tipo de dano das rolagens', () => {
  const SOPRO_DAS_UIVANTES = spellsCircle2.soproDasUivantes;
  const esoterico = (nome: string): Equipment =>
    ({ id: nome, nome, group: 'Esotérico' } as Equipment);

  it('lê o tipo do campo ou do rótulo; rótulo com dois tipos fica sem', () => {
    expect(getRollDamageType({ label: 'Dano de Fogo' })).toBe('fogo');
    expect(getRollDamageType({ label: 'Dano Psíquico' })).toBe('psíquico');
    expect(
      getRollDamageType({ label: 'Dano de Ácido por rodada (aprimoramento)' })
    ).toBe('ácido');
    expect(getRollDamageType({ label: 'Dano', damageType: 'Trevas' })).toBe(
      'trevas'
    );
    expect(
      getRollDamageType({ label: 'Dano Misto (fogo/eletricidade)' })
    ).toBeUndefined();
    expect(getRollDamageType({ label: 'Cura' })).toBeUndefined();
  });

  it('Aspecto do Inverno: +1 por dado só na rolagem de frio', () => {
    const sheet = withClassPowers(['Aspecto do Inverno']);
    const profile = resolveSpellCast(sheet, SOPRO_DAS_UIVANTES);
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(SOPRO_DAS_UIVANTES.rolls ?? [], []),
      profile
    );
    expect(rolls.find((r) => /frio/i.test(r.label))?.dice).toBe('4d6+4');
    expect(rolls.find((r) => /impacto/i.test(r.label))?.dice).toBe('2d6');
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).typedDamage).toEqual([]);
  });

  it('Cetro elemental: a pedra é escolhida por uma magia e soma um dado', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Esotérico = [esoterico('Cetro elemental')];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices[0]).toMatchObject(
      { of: 'damageType', value: 'fogo', chosen: false }
    );
    // Magia sem dano dos quatro tipos não oferece a escolha.
    expect(
      resolveSpellCast(sheet, spellsCircle1.sono).spellChoices
    ).toHaveLength(0);

    sheet.spellModifierChoices = toggleSpellModifierChoice(
      sheet,
      'Cetro elemental',
      BOLA_DE_FOGO
    );
    expect(sheet.spellModifierChoices).toEqual({ 'Cetro elemental': ['fogo'] });
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(BOLA_DE_FOGO.rolls ?? [], []),
      resolveSpellCast(sheet, BOLA_DE_FOGO)
    );
    expect(rolls[0].dice).toBe('7d6');
    // Frio não ganha com a pedra de fogo.
    expect(
      resolveSpellCast(sheet, SOPRO_DAS_UIVANTES).typedDamage
    ).toHaveLength(0);
  });

  it('Proeminência Solar: aprimoramento novo em magia de fogo com resistência', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      {
        name: 'Proeminência Solar',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [],
      },
    ];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).extraAprimoramentos).toEqual([
      expect.objectContaining({ addPm: 1, source: 'Proeminência Solar' }),
    ]);
    expect(
      resolveSpellCast(sheet, SOPRO_DAS_UIVANTES).extraAprimoramentos
    ).toEqual([]);
  });
});

describe('limite de PM (JdA p. 224)', () => {
  const arcanista = (nivel: number): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classLevels = undefined;
    sheet.classe = {
      ...sheet.classe,
      name: 'Arcanista',
      spellPath: {
        initialSpells: 3,
        spellType: 'Arcane',
        qtySpellsLearnAtLevel: () => 1,
        spellCircleAvailableAtLevel: () => 1,
        keyAttribute: Atributo.INTELIGENCIA,
      },
    };
    sheet.atributos[Atributo.INTELIGENCIA] = {
      name: Atributo.INTELIGENCIA,
      value: 4,
    };
    return sheet;
  };

  it('é o nível na classe da magia', () => {
    expect(resolveSpellCast(arcanista(5), BOLA_DE_FOGO).pmLimit).toBe(5);
  });

  it('sem ficha não há limite', () => {
    expect(resolveSpellCast(undefined, BOLA_DE_FOGO).pmLimit).toBeUndefined();
  });

  it('Magia Ilimitada soma o atributo-chave (exemplo do livro: 5 + Int 4 = 9)', () => {
    const sheet = arcanista(5);
    sheet.generalPowers = [
      {
        name: 'Magia Ilimitada',
        description: '',
        type: GeneralPowerType.MAGIA,
        requirements: [],
      },
    ];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmLimit).toBe(9);
  });

  it('Orbe cristalina: +1 só em magia arcana', () => {
    const sheet = arcanista(5);
    sheet.bag.equipments.Esotérico = [
      { id: 'orbe', nome: 'Orbe cristalina', group: 'Esotérico' } as Equipment,
    ];
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmLimit).toBe(6);
    expect(resolveSpellCast(sheet, CURAR_FERIMENTOS).pmLimit).toBe(5);
  });

  it('Celebrar Ritual: opção de lançamento que dobra o limite', () => {
    const sheet = arcanista(8);
    sheet.generalPowers = [
      {
        name: 'Celebrar Ritual',
        description: '',
        type: GeneralPowerType.MAGIA,
        requirements: [],
      },
    ];
    const profile = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(profile.pmLimit).toBe(8);
    const ritual = profile.castOptions[0];
    expect(ritual.addPm).toBe(0);
    expect(
      resolveSpellCast(sheet, BOLA_DE_FOGO, { castOptions: [ritual.key] })
        .pmLimit
    ).toBe(16);
  });
});
