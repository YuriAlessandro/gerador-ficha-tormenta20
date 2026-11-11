import { createMockCharacterSheet } from '../../../../__mocks__/characterSheet';
import CharacterSheet from '../../../../interfaces/CharacterSheet';
import Equipment from '../../../../interfaces/Equipment';
import {
  spellsCircle1,
  spellsCircle2,
} from '../../../../data/systems/tormenta20/magias/generalSpells';
import { dataRegistry } from '../../../../data/registry';
import { SupplementId } from '../../../../types/supplement.types';
import generateRandomSheet from '../../../general';
import { recalculateSheet } from '../../../recalculateSheet';
import { countImprovements } from '../../../itemEnhancements/pricing';
import { getInUseImprovementBonuses } from '../../../itemEnhancements/inUseImprovements';
import { resolveSpellCast, toggleSpellModifierChoice } from '..';

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
