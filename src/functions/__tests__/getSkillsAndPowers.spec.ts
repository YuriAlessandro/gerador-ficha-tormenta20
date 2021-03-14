import INVENTOR from '../../data/classes/inventor';
import { ORIGINS } from '../../data/origins';
import GOBLIN from '../../data/races/goblin';
import { getSkillsAndPowers, selectClass } from '../general';
import attributes from '../../__mocks__/attributes';

describe('Teste geração de perícias e poderes', () => {
  const classe = selectClass({
    classe: INVENTOR.name,
    nivel: 1,
    raca: GOBLIN.name,
  });

  const origin = ORIGINS['Assistente de Laboratório'];

  Array(20)
    .fill(0)
    .forEach(() => {
      const {
        powers: { origin: originPowers, general: originGeneralPowers },
        skills,
      } = getSkillsAndPowers(classe, origin, attributes);

      console.log(originPowers);

      test('Função deve retornar perícias não repitidas', () => {
        expect(skills).toHaveUniqueElements();
      });
      test('Função deve retornar poderes não repetidos', () => {
        expect(originPowers).toHaveUniqueElements();
        expect(originGeneralPowers).toHaveUniqueElements();
      });
    });
});
