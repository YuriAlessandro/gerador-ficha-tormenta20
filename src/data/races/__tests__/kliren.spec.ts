import _ from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';
import KLIREN from '../kliren';

describe('Testa habilidades da raça Elfo', () => {
  const sheet = _.cloneDeep(inventor(KLIREN));
  const received = applyRaceAbilities(sheet);

  test('Híbrido: +1 Perícia treinada', () => {
    expect(received.skills).toHaveLength(sheet.skills.length + 1);
  });
  test('Híbrido: perícias não repetidas', () => {
    expect(received.skills).toHaveUniqueElements();
  });
});
