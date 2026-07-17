import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';

/**
 * Cobre o bônus passivo "conceder proficiência" (target `Proficiency`),
 * aplicado pelo recálculo adicionando à lista `classe.proficiencias`.
 */
describe('homebrew Proficiency bonus', () => {
  const mk = (proficiency: string): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.classe = {
      ...sheet.classe,
      proficiencias: [PROFICIENCIAS.SIMPLES],
      originalAbilities: undefined,
      abilities: [
        {
          name: 'Treinamento Marcial',
          text: 'concede proficiência',
          nivel: 1,
          sheetBonuses: [
            {
              source: { type: 'class', className: sheet.classe.name },
              target: { type: 'Proficiency', proficiency },
              modifier: { type: 'Fixed', value: 1 },
            },
          ],
        },
      ],
    };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  it('grants the proficiency to classe.proficiencias', () => {
    const result = recalculateSheet(mk(PROFICIENCIAS.MARCIAIS));
    expect(result.classe.proficiencias).toContain(PROFICIENCIAS.MARCIAIS);
    // Preserva as proficiências de base.
    expect(result.classe.proficiencias).toContain(PROFICIENCIAS.SIMPLES);
  });

  it('does not duplicate an already-present proficiency', () => {
    const result = recalculateSheet(mk(PROFICIENCIAS.SIMPLES));
    const count = result.classe.proficiencias.filter(
      (p) => p === PROFICIENCIAS.SIMPLES
    ).length;
    expect(count).toBe(1);
  });

  it('stays stable across two recalcs (no accumulation)', () => {
    const once = recalculateSheet(mk(PROFICIENCIAS.PESADAS));
    const twice = recalculateSheet(once);
    const count = twice.classe.proficiencias.filter(
      (p) => p === PROFICIENCIAS.PESADAS
    ).length;
    expect(count).toBe(1);
  });
});
