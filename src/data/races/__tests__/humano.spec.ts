import { applyRaceHabilities } from '../../../functions/general';
import { CharacterStats } from '../../../interfaces/Race';
import Skill from '../../../interfaces/Skills';
import HUMANO from '../humano';

describe('Testa habilidades da raça Humanos', () => {
  test('se habilidade soma uma pericia e um poder geral, ou duas perícias', () => {
    Array(20)
      .fill(0)
      .forEach(() => {
        const stats: CharacterStats = ({
          skills: [Skill.ACROBACIA],
          powers: {
            general: [],
            origin: [],
          },
        } as unknown) as CharacterStats;

        const received = applyRaceHabilities(HUMANO, stats);

        expect(received.skills.length).toBeGreaterThan(1);
        expect(received.skills.length).toBeLessThan(4);
        expect(received.skills).toBeDistinct();

        if (received.skills.length > 2) {
          expect(received.skills[1]).not.toBe(received.skills[2]);
        } else {
          expect(received.powers.general).toHaveLength(1);
        }
      });
  });
});
