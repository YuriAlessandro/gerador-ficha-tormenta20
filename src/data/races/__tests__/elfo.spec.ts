import _ from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';
import ELFO from '../elfo';

describe('Testa habilidades da raça Elfo', () => {
  const sheet = _.cloneDeep(inventor(ELFO));
  const received = applyRaceAbilities(sheet);

  test('Herança Feérica: +1 PM por n´vel', () => {
    expect(received.classe.addpm).toBe(sheet.classe.addpm + 1);
  });
});
