import _ from 'lodash';
import { applyRaceAbilities } from '../../../../../functions/general';
import { recalculateSheet } from '../../../../../functions/recalculateSheet';
import { inventor } from '../../../../../__mocks__/classes/inventor';
import ANAO from '../anao';

describe('Testa habilidades da raça Anão', () => {
  const sheet = _.cloneDeep(inventor(ANAO));
  const sheetWithRaceAbilities = applyRaceAbilities(sheet);
  const received = recalculateSheet(sheetWithRaceAbilities);

  test('Duro como Pedra: +3 PV total no nível 1', () => {
    // Formula: {level} + 2 = 1 + 2 = 3 bonus PV
    expect(received.pv).toBe(sheet.pv + 3);
  });
});
