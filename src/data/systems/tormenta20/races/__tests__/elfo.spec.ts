import _ from 'lodash';
import { applyRaceAbilities } from '../../../../../functions/general';
import { recalculateSheet } from '../../../../../functions/recalculateSheet';
import { inventor } from '../../../../../__mocks__/classes/inventor';
import ELFO from '../elfo';

describe('Testa habilidades da raça Elfo', () => {
  const sheet = _.cloneDeep(inventor(ELFO));
  const sheetWithRaceAbilities = applyRaceAbilities(sheet);
  const received = recalculateSheet(sheetWithRaceAbilities);

  test('Sangue Mágico: +1 PM por nível (nível 1)', () => {
    // For level 1: PM should be base PM + 1 (from Sangue Mágico)
    // Base PM for Inventor at level 1 = classe.pm = 4
    // Sangue Mágico bonus = level = 1
    // Expected PM = 4 + 1 = 5
    expect(received.pm).toBe(sheet.pm + sheet.nivel);
  });

  test('Sangue Mágico: sheetBonuses should contain the PM bonus', () => {
    const pmBonuses = received.sheetBonuses.filter(
      (bonus) => bonus.target.type === 'PM'
    );
    expect(pmBonuses).toHaveLength(1);
    expect((pmBonuses[0].source as { type: string; name: string }).name).toBe(
      'Sangue Mágico'
    );
    expect(pmBonuses[0].modifier.type).toBe('LevelCalc');
    expect(
      (pmBonuses[0].modifier as { type: string; formula: string }).formula
    ).toBe('{level}');
  });

  test('Sangue Mágico: +5 PM at level 5', () => {
    const sheetLevel5 = _.cloneDeep(inventor(ELFO));
    sheetLevel5.nivel = 5;
    // Recalculate PM base for level 5
    // Base PM = classe.pm + (classe.addpm * (nivel - 1)) = 4 + (4 * 4) = 20
    const expectedBasePM =
      sheetLevel5.classe.pm +
      sheetLevel5.classe.addpm * (sheetLevel5.nivel - 1);

    const sheetWithAbilities = applyRaceAbilities(sheetLevel5);
    const result = recalculateSheet(sheetWithAbilities);

    // PM should be base + Sangue Mágico bonus (5 at level 5)
    expect(result.pm).toBe(expectedBasePM + sheetLevel5.nivel);
  });

  test('Sangue Mágico: should appear in race abilities step', () => {
    // Re-create sheet to pick up the code changes
    const freshSheet = _.cloneDeep(inventor(ELFO));
    const freshWithAbilities = applyRaceAbilities(freshSheet);
    const freshResult = recalculateSheet(freshWithAbilities);

    const raceAbilitiesStep = freshResult.steps.find(
      (step) => step.label === 'Habilidades de Raça'
    );

    expect(raceAbilitiesStep).toBeDefined();
    if (raceAbilitiesStep) {
      const sangueMagicoSubstep = raceAbilitiesStep.value.find(
        (substep) =>
          typeof substep === 'object' &&
          'name' in substep &&
          substep.name === 'Sangue Mágico'
      );
      // After the fix, Sangue Mágico should now appear in the step
      expect(sangueMagicoSubstep).toBeDefined();
      expect(sangueMagicoSubstep).toHaveProperty('value', '+1 PM por nível');
    }
  });
});
