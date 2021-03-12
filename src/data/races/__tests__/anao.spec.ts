import _ from 'lodash';
import { applyRaceHabilities } from '../../../functions/general';
import { CharacterStats } from '../../../interfaces/Race';
import ANAO from '../anao';
import { inventor } from '../__mocks__/CharacterStats';

describe('Testa habilidades da raça Anões', () => {
  const stats: CharacterStats = _.cloneDeep(inventor);
  const received = applyRaceHabilities(ANAO, stats);

  test('Duro como Pedra: +3 pv', () => {
    expect(received.pv).toBe(stats.pv + 3);
  });
  test('Duro como Pedra: +1 pv por nível', () => {
    expect(received.classDescription.addpv).toBe(
      stats.classDescription.addpv + 1
    );
  });
});
