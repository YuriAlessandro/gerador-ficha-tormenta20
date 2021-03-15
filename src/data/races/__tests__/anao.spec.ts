import _ from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';

describe('Testa habilidades da raça Anão', () => {
  const sheet = _.cloneDeep(inventor);
  const received = applyRaceAbilities(sheet);

  test('Duro como Pedra: +3 pv', () => {
    expect(received.pv).toBe(sheet.pv + 3);
  });
  test('Duro como Pedra: +1 pv por nível', () => {
    expect(received.classe.addpv).toBe(sheet.classe.addpv + 1);
  });
});
