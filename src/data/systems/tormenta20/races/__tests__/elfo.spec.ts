import _ from 'lodash';
import { applyRaceAbilities } from '../../../../../functions/general';
import { recalculateSheet } from '../../../../../functions/recalculateSheet';
import { inventor } from '../../../../../__mocks__/classes/inventor';
import ELFO from '../elfo';

describe('Testa habilidades da raça Elfo', () => {
  const sheet = _.cloneDeep(inventor(ELFO));
  const sheetWithRaceAbilities = applyRaceAbilities(sheet);
  const received = recalculateSheet(sheetWithRaceAbilities);

  test('Herança Feérica: +1 PM por nível', () => {
    expect(received.pm).toBe(sheet.pm + sheet.nivel);
  });
});
