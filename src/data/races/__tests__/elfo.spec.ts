import _ from 'lodash';
import { applyRaceHabilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';
import ELFO from '../elfo';

describe('Testa habilidades da raça Anão', () => {
  const sheet = _.cloneDeep(inventor(ELFO));
  const received = applyRaceHabilities(sheet);

  test('Herança Feérica: +1 PM por n´vel', () => {
    expect(received.classe.addpm).toBe(sheet.classe.addpm + 1);
  });
});
