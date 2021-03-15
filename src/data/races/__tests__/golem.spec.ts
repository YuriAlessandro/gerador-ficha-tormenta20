import _ from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { inventor } from '../../../__mocks__/classes/inventor';
import GOLEM from '../golem';

describe('Testa habilidades da raça Golem', () => {
  const sheet = _.cloneDeep(inventor(GOLEM));
  const received = applyRaceAbilities(sheet);

  test('Chassi: +2 defesa', () => {
    expect(received.defesa).toBe(sheet.defesa + 2);
  });
  test('Chassi: -2 penalidade de armadura extra', () => {
    const extraArmorPenalty = sheet.extraArmorPenalty || 0;
    expect(received.extraArmorPenalty).toBe(extraArmorPenalty + 2);
  });
});
