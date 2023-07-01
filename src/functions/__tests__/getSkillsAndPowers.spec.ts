import attributes from '../../__mocks__/attributes';
import { inventor } from '../../__mocks__/classes/inventor';
import INVENTOR from '../../data/classes/inventor';
import { ORIGINS } from '../../data/origins';
import { getClassBaseSkills, getRemainingSkills } from '../../data/pericias';
import RACAS from '../../data/racas';
import HUMANO from '../../data/races/humano';
import Skill from '../../interfaces/Skills';
import {
  getAttributesSkills,
  getSkillsAndPowersByClassAndOrigin,
} from '../general';
import { getRandomItemFromArray } from '../randomUtils';

describe('Teste geração de perícias e poderes para Goblin Inventor Assistente de Laboratório', () => {
  Array(5)
    .fill(0)
    .forEach(() => {
      const sheet = inventor(HUMANO);
      const origin = ORIGINS['Assistente de Laboratório'];

      test('Função deve retornar perícias e poderes sem repetição', () => {
        const {
          powers: { origin: originPowers, general: originGeneralPowers },
          skills,
        } = getSkillsAndPowersByClassAndOrigin(
          sheet.classe,
          origin,
          attributes,
          []
        );
        originGeneralPowers.Origem.forEach((getPower) => getPower(sheet, []));

        expect(skills).toHaveUniqueElements();
        expect(originPowers).toHaveUniqueElements();
        expect(sheet.generalPowers).toHaveUniqueElements();
      });

      test('Perícias base devem ser adicionadas sem repetições', () => {
        const used = [Skill.OFICIO_ALQUIMIA];
        const received = getClassBaseSkills(INVENTOR);
        used.push(...received);
        expect(used).toHaveUniqueElements();
      });

      test('Perícias restantes devem ser adicionadas sem repetições', () => {
        const used = [Skill.OFICIO_ALQUIMIA];
        const received = getRemainingSkills(used, INVENTOR);
        used.push(...received);
        expect(used).toHaveUniqueElements();
      });
      test('Perícias de atributo devem ser adicionadas sem repetições', () => {
        const used = [Skill.OFICIO_ALQUIMIA];
        const received = getAttributesSkills(attributes, [
          Skill.OFICIO_ALQUIMIA,
        ]);
        used.push(...received);
        expect(received).toHaveUniqueElements();
      });
    });
});

describe('Teste geração de perícias e poderes para personagem aleatório', () => {
  Array(20)
    .fill(0)
    .forEach(() => {
      const sheet = inventor(getRandomItemFromArray(RACAS));

      const origin = getRandomItemFromArray(Object.values(ORIGINS));

      const {
        powers: { origin: originPowers, general: powersGetters },
        skills,
      } = getSkillsAndPowersByClassAndOrigin(
        sheet.classe,
        origin,
        attributes,
        []
      );

      test('Função deve retornar perícias não repitidas', () => {
        expect(skills).toHaveUniqueElements();
      });
      test('Função deve retornar poderes não repetidos', () => {
        powersGetters.Origem.forEach((getPower) => getPower(sheet, []));
        expect(originPowers).toHaveUniqueElements();
        expect(sheet.generalPowers).toHaveUniqueElements();
      });
    });
});
