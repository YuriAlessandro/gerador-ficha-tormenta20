import INVENTOR from '../../data/classes/inventor';
import { getOriginBenefits, ORIGINS } from '../../data/origins';
import GOBLIN from '../../data/races/goblin';
import {
  getAttributesSkills,
  getSkillsAndPowersByClassAndOrigin,
  selectClass,
} from '../general';
import attributes from '../../__mocks__/attributes';
import { getRandomItemFromArray } from '../randomUtils';
import Skill from '../../interfaces/Skills';
import { getRemainingSkills } from '../../data/pericias';
import { OriginPower } from '../../interfaces/Poderes';

const steps = [];

describe('Teste geração de perícias e poderes para Goblin Inventor Assistente de Laboratório', () => {
  const classe = selectClass({
    classe: INVENTOR.name,
    nivel: 1,
    raca: GOBLIN.name,
  });

  const origin = ORIGINS['Assistente de Laboratório'];

  Array(20)
    .fill(0)
    .forEach(() => {
      test('Função deve retornar perícias e poderes sem repetição', () => {
        const {
          powers: { origin: originPowers, general: originGeneralPowers },
          skills,
        } = getSkillsAndPowersByClassAndOrigin(
          classe,
          origin,
          attributes,
          steps
        );
        expect(skills).toHaveUniqueElements();
        expect(originPowers).toHaveUniqueElements();
        expect(originGeneralPowers).toHaveUniqueElements();
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
      test('Origem deve retornar 2 entre o grupo permitido, sem repetições', () => {
        const used: (OriginPower | Skill)[] = [Skill.OFICIO_ALQUIMIA];
        const received = getOriginBenefits([Skill.OFICIO_ALQUIMIA], origin);
        const benefits = [
          ...received.powers.general,
          ...received.powers.origin,
          ...received.skills,
        ];
        used.push(...benefits);
        expect(used).toHaveLength(3);
        expect(used).toHaveUniqueElements();
      });
    });
});

describe('Teste geração de perícias e poderes para personagem aleatório', () => {
  const classe = selectClass({
    classe: '',
    nivel: 1,
    raca: '',
  });

  const origin = getRandomItemFromArray(Object.values(ORIGINS));

  Array(20)
    .fill(0)
    .forEach(() => {
      const {
        powers: { origin: originPowers, general: originGeneralPowers },
        skills,
      } = getSkillsAndPowersByClassAndOrigin(classe, origin, attributes, steps);

      test('Função deve retornar perícias não repitidas', () => {
        expect(skills).toHaveUniqueElements();
      });
      test('Função deve retornar poderes não repetidos', () => {
        expect(originPowers).toHaveUniqueElements();
        expect(originGeneralPowers).toHaveUniqueElements();
      });
    });
});
