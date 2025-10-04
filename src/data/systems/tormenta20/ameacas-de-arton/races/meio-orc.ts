import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const meioOrcAbilities: RaceAbility[] = [
  {
    name: 'Adaptável',
    description:
      'Você recebe +2 em Intimidação e se torna treinado em uma perícia a sua escolha.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Adaptável' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
    sheetActions: [
      {
        source: { type: 'power', name: 'Adaptável' },
        action: {
          type: 'learnSkill',
          availableSkills: Object.values(Skill).filter(
            (skill) => skill !== Skill.OFICIO
          ),
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Criatura das Profundezas',
    description:
      'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Criatura das Profundezas' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Criatura das Profundezas' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Sangue Orc',
    description:
      'Você recebe +1 em rolagens de dano com armas corpo a corpo e de arremesso e é considerado um orc para efeitos relacionados a raça.',
  },
];

const MEIO_ORC: Race = {
  name: 'Meio-Orc',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 2 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {},
  abilities: meioOrcAbilities,
};

export default MEIO_ORC;
