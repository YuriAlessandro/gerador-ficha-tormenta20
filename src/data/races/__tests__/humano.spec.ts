import { cloneDeep } from 'lodash';
import { applyRaceAbilities } from '../../../functions/general';
import { druida } from '../../../__mocks__/classes/druida';
import HUMANO from '../humano';

describe('Testa habilidades da raça Humano', () => {
  test('Versátil: soma uma pericia e um poder geral, ou duas perícias', () => {
    Array(20)
      .fill(0)
      .forEach(() => {
        const sheet = cloneDeep(druida(HUMANO));

        const received = applyRaceAbilities(sheet);

        expect(received.skills.length).toBeGreaterThan(8);
        expect(received.skills.length).toBeLessThan(11);
        expect(received.skills).toHaveUniqueElements();

        if (received.skills.length > 2) {
          expect(received.skills[1]).not.toBe(received.skills[2]);
        } else {
          expect(received.generalPowers).toHaveLength(1);
        }
      });
  });
});
