import _ from 'lodash';
import { applyRaceAbilities } from '../../../../../functions/general';
import { recalculateSheet } from '../../../../../functions/recalculateSheet';
import { inventor } from '../../../../../__mocks__/classes/inventor';
import MINOTAURO from '../minotauro';

describe('Testa habilidades da raça Minotauro', () => {
  const sheet = _.cloneDeep(inventor(MINOTAURO));
  const sheetWithRaceAbilities = applyRaceAbilities(sheet);
  const received = recalculateSheet(sheetWithRaceAbilities);

  test('Chifres: adiciona arma "Chifres"', () => {
    const foundChifres = received.bag
      .getEquipments()
      .Arma.some((weapon) => weapon.nome === 'Chifres');

    expect(foundChifres).toBe(true);
  });
  test('Couro rígido: adiciona +1 na defesa', () => {
    expect(received.defesa).toBe(sheet.defesa + 1);
  });
});
