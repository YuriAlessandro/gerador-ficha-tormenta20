import { recalculateSheet } from '../recalculateSheet';
import { applyManualLevelUp, applyPower } from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, { SheetAction } from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { RaceNames } from '../../interfaces/Race';
import { Spell } from '../../interfaces/Spells';
import { LevelUpSelections } from '../../interfaces/WizardSelections';

/**
 * Cobre o replay de escolhas `chooseFromOptions` (estilo homebrew) através de
 * `recalculateSheet` e os picks aditivos de subida de nível. Como `optionChoices`
 * é a fonte persistida (não deduplicada), tanto multi-pick quanto picks
 * acumulados por nível precisam sobreviver a recálculos.
 */
describe('chooseFromOptions optionChoices replay', () => {
  const OPTION_KEY = 'homebrew:TestRace:Versatilidade';

  const buildAbilityWithPick = (
    pick: number,
    levelUp?: { pickPerLevelUp: number; substitutes: 'none' }
  ): SheetAction => ({
    source: { type: 'race', raceName: 'TestRace' },
    action: {
      type: 'chooseFromOptions',
      optionKey: OPTION_KEY,
      pick,
      levelUp,
      options: [
        {
          name: 'Força Bruta',
          text: '+1 Força',
          sheetBonuses: [
            {
              source: { type: 'race', raceName: 'TestRace' },
              target: { type: 'Attribute', attribute: Atributo.FORCA },
              modifier: { type: 'Fixed', value: 1 },
            },
          ],
          repeatable: true,
        },
        {
          name: 'Agilidade',
          text: '+1 Destreza',
          sheetBonuses: [
            {
              source: { type: 'race', raceName: 'TestRace' },
              target: { type: 'Attribute', attribute: Atributo.DESTREZA },
              modifier: { type: 'Fixed', value: 1 },
            },
          ],
          repeatable: true,
        },
      ],
    },
  });

  const makeSheet = (
    pick: number,
    chosen: string[],
    levelUp?: { pickPerLevelUp: number; substitutes: 'none' }
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [];
    sheet.classPowers = [];
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    sheet.raca = {
      ...sheet.raca,
      name: 'TestRace' as RaceNames,
      abilities: [
        {
          name: 'Versatilidade',
          description: 'Escolha bônus de atributo.',
          sheetActions: [buildAbilityWithPick(pick, levelUp)],
        },
      ],
    };
    sheet.optionChoices = { [OPTION_KEY]: chosen };
    return sheet;
  };

  const countAttrBonuses = (sheet: CharacterSheet, attr: Atributo) =>
    sheet.sheetBonuses.filter(
      (b) =>
        b.target.type === 'Attribute' &&
        b.target.attribute === attr &&
        b.modifier.type === 'Fixed'
    ).length;

  it('replays a multi-pick (repeated option) across recalc', () => {
    // pick = 2, both into Força Bruta → 2 bônus de Força.
    const sheet = makeSheet(2, ['Força Bruta', 'Força Bruta']);

    const result = recalculateSheet(sheet);

    // Both picks should be re-applied (not collapsed by history dedup).
    expect(countAttrBonuses(result, Atributo.FORCA)).toBe(2);
  });

  it('keeps choices stable across repeated recalcs (no re-randomize)', () => {
    const sheet = makeSheet(1, ['Agilidade']);
    const once = recalculateSheet(sheet);
    const twice = recalculateSheet(once);

    expect(twice.optionChoices?.[OPTION_KEY]).toEqual(['Agilidade']);
    const dexBonus = twice.sheetBonuses.filter(
      (b) =>
        b.target.type === 'Attribute' &&
        b.target.attribute === Atributo.DESTREZA
    );
    expect(dexBonus).toHaveLength(1);
  });

  it('accumulates additive level-up picks into optionChoices and applies them', () => {
    // Inicial: 1 pick (Agilidade). Level-up aditivo: +1 pick (Força Bruta).
    const sheet = makeSheet(1, ['Agilidade'], {
      pickPerLevelUp: 1,
      substitutes: 'none',
    });

    const selection: LevelUpSelections = {
      level: sheet.nivel + 1,
      powerChoice: 'class',
      levelUpOptionPicks: { [OPTION_KEY]: ['Força Bruta'] },
    };

    const leveled = applyManualLevelUp(sheet, selection);
    // optionChoices acumulou inicial + level-up.
    expect(leveled.optionChoices?.[OPTION_KEY]).toEqual([
      'Agilidade',
      'Força Bruta',
    ]);

    // O recálculo final (como o caller faz) aplica o conjunto acumulado:
    // 1 bônus de Força (level-up) + 1 bônus de Destreza (inicial).
    const result = recalculateSheet(leveled);
    expect(countAttrBonuses(result, Atributo.FORCA)).toBe(1);
    expect(countAttrBonuses(result, Atributo.DESTREZA)).toBe(1);
  });

  it('grants player-choice spells from the chosen pick option', () => {
    const sheet = createMockCharacterSheet();
    sheet.spells = [];
    sheet.sheetActionHistory = [];
    const bolaDeFogo = { nome: 'Bola de Fogo' } as unknown as Spell;
    const relampago = { nome: 'Relâmpago' } as unknown as Spell;

    const ability = {
      name: 'Dádiva Arcana',
      sheetActions: [
        {
          source: { type: 'race', raceName: 'TestRace' },
          action: {
            type: 'chooseFromOptions',
            optionKey: 'homebrew:TestRace:Dadiva',
            pick: 1,
            options: [
              {
                name: 'Mago',
                text: 'Escolha uma magia arcana.',
                grantedSpellsAction: {
                  type: 'learnSpell',
                  availableSpells: [bolaDeFogo, relampago],
                  pick: 1,
                },
              },
              { name: 'Guerreiro', text: 'Sem magias.' },
            ],
          },
        },
      ] as SheetAction[],
    };

    const [result] = applyPower(sheet, ability, {
      chosenOption: ['Mago'],
      optionSpells: { Mago: [bolaDeFogo] },
    });

    expect(result.spells.some((s) => s.nome === 'Bola de Fogo')).toBe(true);
    expect(result.spells.some((s) => s.nome === 'Relâmpago')).toBe(false);
  });
});
