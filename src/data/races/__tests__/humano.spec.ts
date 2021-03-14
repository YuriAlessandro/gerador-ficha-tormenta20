import { applyRaceHabilities } from '../../../functions/general';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import Skill from '../../../interfaces/Skills';
import HUMANO from '../humano';

describe('Testa habilidades da raça Humano', () => {
  test('Versátil: soma uma pericia e um poder geral, ou duas perícias', () => {
    Array(20)
      .fill(0)
      .forEach(() => {
        const sheet: CharacterSheet = ({
          skills: [Skill.ACROBACIA],
          generalPowers: [],
          raca: HUMANO,
        } as unknown) as CharacterSheet;

        const received = applyRaceHabilities(sheet);

        expect(received.skills.length).toBeGreaterThan(1);
        expect(received.skills.length).toBeLessThan(4);
        expect(received.skills).toHaveUniqueElements();

        if (received.skills.length > 2) {
          expect(received.skills[1]).not.toBe(received.skills[2]);
        } else {
          expect(received.generalPowers).toHaveLength(1);
        }
      });
  });
});
