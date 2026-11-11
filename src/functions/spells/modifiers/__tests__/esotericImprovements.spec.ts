import { vi } from 'vitest';
import { createMockCharacterSheet } from '../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '../../../../interfaces/Equipment';
import {
  spellsCircle1,
  spellsCircle2,
} from '../../../../data/systems/tormenta20/magias/generalSpells';
import { dataRegistry } from '../../../../data/registry';
import { Atributo } from '../../../../data/systems/tormenta20/atributos';
import { SupplementId } from '../../../../types/supplement.types';
import generateRandomSheet from '../../../general';
import { recalculateSheet } from '../../../recalculateSheet';
import { countImprovements } from '../../../itemEnhancements/pricing';
import { getInUseImprovementBonuses } from '../../../itemEnhancements/inUseImprovements';
import { augmentSpellRolls } from '../../../spellRollAugmentation';
import { rollDamage } from '../../../diceRoller';
import {
  applySpellRollModifiers,
  resolveSpellCast,
  toggleSpellModifierChoice,
} from '..';

const BOLA_DE_FOGO = spellsCircle2.bolaDeFogo;
const SOPRO_DAS_UIVANTES = spellsCircle2.soproDasUivantes;
const SONO = spellsCircle1.sono;

const esoteric = (id: string, nome: string, mods: string[] = []): Equipment =>
  ({
    id,
    nome,
    group: 'Esotérico',
    modifications: mods.length ? mods.map((mod) => ({ mod })) : undefined,
  } as Equipment);

const withEsoterics = (
  items: Equipment[],
  mainHand?: string,
  offHand?: string
): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.bag.equipments.Esotérico = items;
  sheet.mainHandItemId = mainHand;
  sheet.offHandItemId = offHand;
  return sheet;
};

describe('catálogo de melhorias de esotérico', () => {
  it('o livro básico traz as melhorias de esotérico; Heróis de Arton, o Potencializador', () => {
    const core = dataRegistry
      .getImprovementsBySupplements([SupplementId.TORMENTA20_CORE])
      .esoterics.map((mod) => mod.mod);
    expect(core).toEqual(
      expect.arrayContaining([
        'Canalizador',
        'Energético',
        'Harmonizado',
        'Poderoso',
        'Vigilante',
        'Banhado a ouro',
      ])
    );
    expect(core).not.toContain('Potencializador');
    const withHeroes = dataRegistry
      .getImprovementsBySupplements([
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ])
      .esoterics.map((mod) => mod.mod);
    expect(withHeroes).toContain('Potencializador');
  });

  it('Potencializador é melhoria dupla (conta duas sem o Canalizador)', () => {
    expect(
      countImprovements(esoteric('a', 'Varinha arcana', ['Potencializador']))
    ).toBe(2);
    expect(
      countImprovements(
        esoteric('a', 'Varinha arcana', ['Canalizador', 'Potencializador'])
      )
    ).toBe(2);
  });
});

describe('melhorias de esotérico nas magias', () => {
  it('Poderoso soma +1 na CD, com o item e a melhoria como uma fonte só', () => {
    const plain = resolveSpellCast(
      withEsoterics([esoteric('v', 'Varinha arcana')], 'v'),
      BOLA_DE_FOGO
    );
    const powerful = resolveSpellCast(
      withEsoterics([esoteric('v', 'Varinha arcana', ['Poderoso'])], 'v'),
      BOLA_DE_FOGO
    );
    expect(powerful.dcBonus).toBe(plain.dcBonus + 1);
    expect(powerful.esotericOptions).toEqual(['Varinha arcana (Poderoso)']);
    expect(powerful.esoterics).toEqual(['Varinha arcana (Poderoso)']);
  });

  it('o item superior continua contando como UM esotérico', () => {
    const sheet = withEsoterics(
      [
        esoteric('v', 'Varinha arcana', ['Poderoso']),
        esoteric('o', 'Orbe cristalina'),
      ],
      'v',
      'o'
    );
    const viaWand = resolveSpellCast(sheet, BOLA_DE_FOGO, {
      esoterics: ['Varinha arcana (Poderoso)'],
    });
    const viaOrb = resolveSpellCast(sheet, BOLA_DE_FOGO, {
      esoterics: ['Orbe cristalina'],
    });
    expect(viaWand.esoterics).toEqual(['Varinha arcana (Poderoso)']);
    expect(viaOrb.esoterics).toEqual(['Orbe cristalina']);
    expect(viaOrb.dcBonus).toBe(viaWand.dcBonus - 2);
  });

  it('fora da mão as melhorias não valem', () => {
    const sheet = withEsoterics(
      [
        esoteric('v', 'Varinha arcana', ['Poderoso']),
        esoteric('o', 'Orbe cristalina'),
      ],
      'o'
    );
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).esotericOptions).toEqual([
      'Orbe cristalina',
    ]);
  });

  it('Canalizador +1 no limite de PM; Potencializador substitui (+2 no total)', () => {
    const base = resolveSpellCast(
      withEsoterics([esoteric('b', 'Bolsa de pó')], 'b'),
      BOLA_DE_FOGO
    ).pmLimit as number;
    expect(
      resolveSpellCast(
        withEsoterics([esoteric('b', 'Bolsa de pó', ['Canalizador'])], 'b'),
        BOLA_DE_FOGO
      ).pmLimit
    ).toBe(base + 1);
    expect(
      resolveSpellCast(
        withEsoterics(
          [esoteric('b', 'Bolsa de pó', ['Canalizador', 'Potencializador'])],
          'b'
        ),
        BOLA_DE_FOGO
      ).pmLimit
    ).toBe(base + 2);
  });

  it('Energético: +1d6 do tipo da magia; o primeiro tipo quando há dois', () => {
    const sheet = withEsoterics(
      [esoteric('b', 'Bolsa de pó', ['Energético'])],
      'b'
    );
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).extraRolls).toEqual([
      expect.objectContaining({
        label: 'Dano de fogo (Energético (Bolsa de pó))',
        dice: '1d6',
        damageType: 'fogo',
      }),
    ]);
    expect(resolveSpellCast(sheet, SOPRO_DAS_UIVANTES).extraRolls).toEqual([
      expect.objectContaining({ damageType: 'frio' }),
    ]);
    expect(resolveSpellCast(sheet, SONO).extraRolls).toEqual([]);
  });

  it('Harmonizado: escolha por item, –1 PM só na magia escolhida', () => {
    let sheet = withEsoterics(
      [
        esoteric('v1', 'Varinha arcana', ['Harmonizado']),
        esoteric('v2', 'Varinha arcana', ['Harmonizado']),
      ],
      'v1',
      'v2'
    );
    // Duas varinhas iguais, sem escolha: são a mesma fonte, uma vaga.
    let slots = resolveSpellCast(sheet, BOLA_DE_FOGO).spellChoices;
    expect(slots.map((slot) => slot.key)).toEqual(['Harmonizado@v1']);
    expect(slots[0].source).toBe('Harmonizado (Varinha arcana)');

    sheet = {
      ...sheet,
      spellModifierChoices: toggleSpellModifierChoice(
        sheet,
        'Harmonizado@v1',
        BOLA_DE_FOGO
      ),
    };
    expect(sheet.spellModifierChoices).toEqual({
      'Harmonizado@v1': ['Bola de Fogo'],
    });
    expect(resolveSpellCast(sheet, BOLA_DE_FOGO).pmReduction).toBe(1);
    expect(resolveSpellCast(sheet, SONO).pmReduction).toBe(0);

    // Escolhida a primeira, a segunda vira outra fonte e libera a vaga dela.
    slots = resolveSpellCast(sheet, SONO).spellChoices;
    expect(slots.map((slot) => slot.key)).toEqual([
      'Harmonizado@v1',
      'Harmonizado@v2',
    ]);
    sheet = {
      ...sheet,
      spellModifierChoices: toggleSpellModifierChoice(
        sheet,
        'Harmonizado@v2',
        SONO
      ),
    };
    // A Varinha arcana vale em toda magia arcana, então as duas são opção;
    // no lançamento o jogador escolhe a harmonizada para o Sono.
    expect(
      resolveSpellCast(sheet, SONO, {
        esoterics: ['Varinha arcana (Harmonizado: Sono)'],
      }).pmReduction
    ).toBe(1);
    expect(resolveSpellCast(sheet, SONO).esotericOptions).toEqual([
      'Varinha arcana (Harmonizado: Bola de Fogo)',
      'Varinha arcana (Harmonizado: Sono)',
    ]);
  });
});

describe('Vigilante: +2 na Defesa só empunhado', () => {
  it('declara o bônus de Defesa com a fonte no item', () => {
    expect(
      getInUseImprovementBonuses(esoteric('v', 'Varinha arcana', ['Vigilante']))
    ).toEqual([
      {
        source: {
          type: 'equipment',
          equipmentName: 'Varinha arcana (Vigilante)',
        },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ]);
  });

  it('a Defesa da ficha sobe só com o esotérico na mão', () => {
    const base = recalculateSheet(
      generateRandomSheet({
        nivel: 1,
        raca: 'Humano',
        classe: 'Arcanista',
        origin: 'Aleatório',
        devocao: { label: '--', value: '--' },
        supplements: [SupplementId.TORMENTA20_CORE],
      })
    );
    const withItems = (mainHand: string): CharacterSheet => {
      const sheet = recalculateSheet({
        ...base,
        bag: base.bag,
        mainHandItemId: mainHand,
        offHandItemId: undefined,
      });
      return sheet;
    };
    base.bag.equipments.Esotérico = [
      esoteric('vig', 'Varinha arcana', ['Vigilante']),
      esoteric('outro', 'Orbe cristalina'),
    ];
    const wielded = withItems('vig');
    const stored = withItems('outro');
    expect(wielded.defesa - stored.defesa).toBe(2);
  });
});

describe('material especial em esotérico', () => {
  const withMaterial = (material: string): CharacterSheet =>
    withEsoterics(
      [
        {
          id: 'b',
          nome: 'Bolsa de pó',
          group: 'Esotérico',
          modifications: [
            { mod: 'Material especial', specialMaterial: material },
          ],
        } as Equipment,
      ],
      'b'
    );

  it('Mitral: opção de +2 PM para +2 na CD, com o material no rótulo', () => {
    const sheet = withMaterial('mitral');
    const profile = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(profile.esotericOptions).toEqual(['Bolsa de pó (Mitral)']);
    const option = profile.castOptions.find((o) => o.label.includes('CD'));
    expect(option).toMatchObject({ addPm: 2, active: false });
    const active = resolveSpellCast(sheet, BOLA_DE_FOGO, {
      castOptions: [option?.key as string],
    });
    expect(active.dcBonus).toBe(profile.dcBonus + 2);
    expect(active.castOptionPm).toBe(2);
  });

  it('Gelo eterno: rola de novo os 1 só no dano de frio', () => {
    const profile = resolveSpellCast(
      withMaterial('gelo eterno'),
      SOPRO_DAS_UIVANTES
    );
    const rolls = applySpellRollModifiers(
      augmentSpellRolls(SOPRO_DAS_UIVANTES.rolls ?? [], []),
      profile
    );
    expect(rolls.find((r) => /frio/i.test(r.label))?.rerollOnes).toBe(true);
    expect(
      rolls.find((r) => /impacto/i.test(r.label))?.rerollOnes
    ).toBeUndefined();
    expect(
      resolveSpellCast(withMaterial('gelo eterno'), BOLA_DE_FOGO).rerollOnes
    ).toEqual([]);
  });

  it('Adamante: +1 PM para rolar de novo os 1 em qualquer dano', () => {
    const sheet = withMaterial('adamante');
    const option = resolveSpellCast(sheet, BOLA_DE_FOGO).castOptions[0];
    expect(option).toMatchObject({ addPm: 1 });
    const off = applySpellRollModifiers(
      augmentSpellRolls(BOLA_DE_FOGO.rolls ?? [], []),
      resolveSpellCast(sheet, BOLA_DE_FOGO)
    );
    expect(off[0].rerollOnes).toBeUndefined();
    const on = applySpellRollModifiers(
      augmentSpellRolls(BOLA_DE_FOGO.rolls ?? [], []),
      resolveSpellCast(sheet, BOLA_DE_FOGO, { castOptions: [option.key] })
    );
    expect(on[0].rerollOnes).toBe(true);
  });

  it('Cristal de sol (Ameaças de Arton): aprimoramento de +1 PM em magia de fogo', () => {
    expect(
      resolveSpellCast(withMaterial('cristal de sol'), BOLA_DE_FOGO)
        .extraAprimoramentos
    ).toEqual([expect.objectContaining({ addPm: 1 })]);
    expect(
      resolveSpellCast(withMaterial('cristal de sol'), SOPRO_DAS_UIVANTES)
        .extraAprimoramentos
    ).toEqual([]);
  });

  it('material só com texto não vira fonte de magia', () => {
    expect(
      resolveSpellCast(withMaterial('aço rubi'), BOLA_DE_FOGO).esotericOptions
    ).toEqual([]);
    expect(
      dataRegistry.getSpecialMaterialByName('aço rubi')?.esotericEffect?.effect
    ).toMatch(/ignora 10 pontos de redução de dano/);
  });
});

describe('rolar de novo os resultados 1', () => {
  afterEach(() => vi.restoreAllMocks());

  it('o 1 é rolado de novo uma vez; sem a opção fica', () => {
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    expect(rollDamage('1d6', { rerollOnes: true })?.diceRolls).toEqual([6]);
    random.mockReturnValueOnce(0);
    expect(rollDamage('1d6')?.diceRolls).toEqual([1]);
  });
});

describe('melhorias de arma e armadura que mexem nas magias', () => {
  const sword = (deity?: string): Equipment =>
    ({
      id: 'espada',
      nome: 'Espada longa',
      group: 'Arma',
      modifications: [{ mod: 'Canônico', ...(deity ? { deity } : {}) }],
    } as Equipment);
  const devotee = (sheet: CharacterSheet, deity: string): CharacterSheet => ({
    ...sheet,
    devoto: {
      divindade: { name: deity },
      poderes: [],
    } as unknown as CharacterSheet['devoto'],
  });
  const withSword = (item: Equipment, wielded = 'espada'): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Arma = [
      item,
      { id: 'adaga', nome: 'Adaga', group: 'Arma' } as Equipment,
    ];
    sheet.mainHandItemId = wielded;
    return sheet;
  };

  it('Canônico: +1 na CD para devoto da divindade do item', () => {
    const base = resolveSpellCast(createMockCharacterSheet(), BOLA_DE_FOGO);
    const sheet = devotee(withSword(sword('Khalmyr')), 'Khalmyr');
    const profile = resolveSpellCast(sheet, BOLA_DE_FOGO);
    expect(profile.dcBonus).toBe(base.dcBonus + 1);
    expect(profile.notes).toContain('+1 na CD (Canônico (Espada longa))');
  });

  it('Canônico não vale para outro devoto, sem divindade escolhida ou fora da mão', () => {
    const base = resolveSpellCast(
      createMockCharacterSheet(),
      BOLA_DE_FOGO
    ).dcBonus;
    expect(
      resolveSpellCast(
        devotee(withSword(sword('Khalmyr')), 'Tanna-Toh'),
        BOLA_DE_FOGO
      ).dcBonus
    ).toBe(base);
    expect(
      resolveSpellCast(devotee(withSword(sword()), 'Khalmyr'), BOLA_DE_FOGO)
        .dcBonus
    ).toBe(base);
    expect(
      resolveSpellCast(
        devotee(withSword(sword('Khalmyr'), 'adaga'), 'Khalmyr'),
        BOLA_DE_FOGO
      ).dcBonus
    ).toBe(base);
  });

  it('Deslumbrante: +1 na CD das magias de Carisma, com a armadura vestida', () => {
    const charismaSpell = { ...BOLA_DE_FOGO, customKeyAttr: Atributo.CARISMA };
    const intelligenceSpell = {
      ...BOLA_DE_FOGO,
      customKeyAttr: Atributo.INTELIGENCIA,
    };
    const sheet = createMockCharacterSheet();
    sheet.bag.equipments.Armadura = [
      {
        id: 'couro',
        nome: 'Couro',
        group: 'Armadura',
        defenseBonus: 2,
        armorPenalty: 0,
        modifications: [{ mod: 'Banhada a ouro' }, { mod: 'Deslumbrante' }],
      } as DefenseEquipment,
    ];
    const base = resolveSpellCast(
      createMockCharacterSheet(),
      charismaSpell
    ).dcBonus;
    expect(resolveSpellCast(sheet, charismaSpell).dcBonus).toBe(base + 1);
    expect(resolveSpellCast(sheet, intelligenceSpell).dcBonus).toBe(base);
    expect(
      resolveSpellCast({ ...sheet, wornArmorId: 'outra' }, charismaSpell)
        .dcBonus
    ).toBe(base);
  });
});
