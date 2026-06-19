import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet, { StatModifier } from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';

/**
 * Cobre o modificador genérico `ScaledValue` (fonte + caps) avaliado pelo
 * recálculo. Usa um alvo de Perícia (LUTA) para isolar o valor do modificador
 * sem o maquinário de armas — a aplicação em arma reusa o mesmo
 * `calculateBonusValue` já existente.
 */
describe('homebrew ScaledValue modifier', () => {
  // Monta uma ficha com um bônus em LUTA vindo de uma habilidade de classe.
  const mk = (
    modifier: StatModifier,
    opts?: {
      nivel?: number;
      spellCircle?: number;
      forca?: number;
      destreza?: number;
    }
  ): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = opts?.nivel ?? 4;
    sheet.atributos.Força.value = opts?.forca ?? 4;
    sheet.atributos.Destreza.value = opts?.destreza ?? 2;
    sheet.classe = {
      ...sheet.classe,
      originalAbilities: undefined,
      abilities: [
        {
          name: 'Dano',
          text: 'dano',
          nivel: 1,
          sheetBonuses: [
            {
              source: { type: 'class', className: sheet.classe.name },
              target: { type: 'Skill', name: Skill.LUTA },
              modifier,
            },
          ],
        },
      ],
    };
    if (opts?.spellCircle !== undefined) {
      sheet.classe.spellPath = {
        initialSpells: 0,
        spellType: 'Arcane',
        keyAttribute: Atributo.INTELIGENCIA,
        qtySpellsLearnAtLevel: () => 0,
        spellCircleAvailableAtLevel: () => opts.spellCircle as number,
      };
    }
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  const others = (sheet: CharacterSheet) =>
    recalculateSheet(sheet).completeSkills?.find((s) => s.name === Skill.LUTA)
      ?.others ?? 0;

  it('spellCircle source is capped by level (min)', () => {
    // Nível 4, círculo 5: sem cap = 5; com cap pelo nível = 4. Mesma ficha/nível
    // isola a diferença do modificador.
    const uncapped = others(
      mk(
        { type: 'ScaledValue', base: { kind: 'spellCircle' } },
        { nivel: 4, spellCircle: 5 }
      )
    );
    const capped = others(
      mk(
        {
          type: 'ScaledValue',
          base: { kind: 'spellCircle' },
          capByLevel: true,
        },
        { nivel: 4, spellCircle: 5 }
      )
    );
    expect(uncapped - capped).toBe(1); // 5 vs 4
  });

  it('non-caster spellCircle is 0', () => {
    const noCaster = others(
      mk({ type: 'ScaledValue', base: { kind: 'spellCircle' } }, { nivel: 4 })
    );
    const fixed3 = others(
      mk(
        { type: 'ScaledValue', base: { kind: 'fixed', value: 3 } },
        { nivel: 4 }
      )
    );
    expect(fixed3 - noCaster).toBe(3); // 3 vs 0
  });

  it('attribute source capped by another attribute (min)', () => {
    // Força 4, Destreza 2: sem cap = 4; limitado por Destreza = 2.
    const uncapped = others(
      mk(
        {
          type: 'ScaledValue',
          base: { kind: 'attribute', attribute: Atributo.FORCA },
        },
        {
          forca: 4,
          destreza: 2,
        }
      )
    );
    const capped = others(
      mk(
        {
          type: 'ScaledValue',
          base: { kind: 'attribute', attribute: Atributo.FORCA },
          capByAttribute: Atributo.DESTREZA,
        },
        { forca: 4, destreza: 2 }
      )
    );
    expect(uncapped - capped).toBe(2); // 4 vs 2
  });

  it('level source equals character level', () => {
    const lvl = others(
      mk({ type: 'ScaledValue', base: { kind: 'level' } }, { nivel: 6 })
    );
    const fixed1 = others(
      mk(
        { type: 'ScaledValue', base: { kind: 'fixed', value: 1 } },
        { nivel: 6 }
      )
    );
    expect(lvl - fixed1).toBe(5); // 6 vs 1
  });
});
