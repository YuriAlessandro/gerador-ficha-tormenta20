import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { compileClassContent } from '../../premium/functions/compileClass';
import { HomebrewClassContent } from '../../premium/interfaces/Homebrew';

/**
 * Cobre o compilador de Classe homebrew e o modificador genérico
 * `LevelBreakpoints` (escala passiva por nível) avaliado pelo recálculo.
 */
describe('homebrew class', () => {
  const baseContent = (): HomebrewClassContent => ({
    pv: 16,
    addpv: 4,
    pm: 4,
    addpm: 4,
    proficiencies: ['Armas Simples'],
    skills: {
      basic: [{ mode: 'and', skills: [Skill.LUTA] }],
      remaining: { qtd: 2, list: [Skill.ATLETISMO, Skill.PERCEPCAO] },
    },
    abilities: [
      { name: 'Habilidade N1', description: 'A', nivel: 1 },
      { name: 'Habilidade N5', description: 'B', nivel: 5 },
    ],
    powers: [
      {
        name: 'Poder com requisito',
        description: 'P',
        requirements: [[{ type: 'NIVEL', value: 3 }]],
        canRepeat: true,
      },
    ],
    spellcasting: {
      keyAttribute: Atributo.INTELIGENCIA,
      spellType: 'Arcane',
      initialSpells: 3,
      circleProgression: { preset: 'full' },
      spellsPerLevel: { base: 1, extraPerLevels: 4, extraAmount: 1 },
    },
  });

  it('compiles vitals, abilities (by nivel), requirements and spellPath', () => {
    const c = compileClassContent(baseContent(), 'Feiticeiro Homebrew');
    expect(c.pv).toBe(16);
    expect(c.addpm).toBe(4);
    expect(c.abilities.map((a) => a.nivel)).toEqual([1, 5]);
    expect(c.powers[0].requirements?.[0][0].value).toBe(3);
    expect(c.powers[0].canRepeat).toBe(true);
    // spellPath construído a partir da config serializável.
    expect(c.spellPath?.keyAttribute).toBe(Atributo.INTELIGENCIA);
    expect(c.spellPath?.spellCircleAvailableAtLevel(1)).toBe(1);
    expect(c.spellPath?.spellCircleAvailableAtLevel(5)).toBe(2);
    expect(c.spellPath?.spellCircleAvailableAtLevel(9)).toBe(3);
    // base 1 + 1 a cada 4 níveis: nível 2 = 1; nível 4 = 2.
    expect(c.spellPath?.qtySpellsLearnAtLevel(2)).toBe(1);
    expect(c.spellPath?.qtySpellsLearnAtLevel(4)).toBe(2);
  });

  it('LevelBreakpoints bonus scales a skill by level on recalc', () => {
    const mk = (nivel: number): CharacterSheet => {
      const sheet = createMockCharacterSheet();
      sheet.nivel = nivel;
      // O bônus precisa vir de uma habilidade (recalc reconstrói sheetBonuses).
      sheet.classe = {
        ...sheet.classe,
        originalAbilities: undefined,
        abilities: [
          {
            name: 'Escala',
            text: 'escala',
            nivel: 1,
            sheetBonuses: [
              {
                source: { type: 'class', className: sheet.classe.name },
                target: { type: 'Skill', name: Skill.LUTA },
                modifier: {
                  type: 'LevelBreakpoints',
                  breakpoints: [
                    { fromLevel: 1, value: 1 },
                    { fromLevel: 5, value: 2 },
                  ],
                  by: 'level',
                },
              },
            ],
          },
        ],
      };
      sheet.sheetBonuses = [];
      sheet.sheetActionHistory = [];
      return sheet;
    };

    const others = (sheet: CharacterSheet) =>
      recalculateSheet(sheet).completeSkills?.find((s) => s.name === Skill.LUTA)
        ?.others ?? 0;

    const atL1 = others(mk(1));
    const atL5 = others(mk(5));
    // O bônus vai de +1 (níveis 1-4) para +2 (a partir do 5).
    expect(atL5 - atL1).toBe(1);
  });
});
