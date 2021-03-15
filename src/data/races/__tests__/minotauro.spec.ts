import _ from 'lodash';
import { applyRaceHabilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';
import MINOTAURO from '../minotauro';

describe('Testa habilidades da raça Minotauro', () => {
  const sheet = _.cloneDeep(inventor(MINOTAURO));
  const received = applyRaceHabilities(sheet);

  test('Chifres: adiciona arma "Chifres"', () => {
    const foundChifres = received.bag.equipments.Arma.some(
      (weapon) => weapon.nome === 'Chifres'
    );

    expect(foundChifres).toBe(true);
  });
});
