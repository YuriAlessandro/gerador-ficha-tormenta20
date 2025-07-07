import Skill from '@/interfaces/Skills';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const KLIREN: Race = {
  name: 'Kliren',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Híbrido',
      description:
        'Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Híbrido',
          },
          action: {
            type: 'learnSkill',
            availableSkills: Object.values(Skill),
            pick: 1,
          },
        },
      ],
    },
    {
      name: 'Engenhosidade',
      description:
        'Quando faz um teste de perícia, você pode gastar 2 PM para somar sua Inteligência no teste. Você não pode usar esta habilidade em testes de ataque. Caso receba esta habilidade novamente, seu custo é reduzido em –1 PM.',
    },
    {
      name: 'Ossos Frágeis',
      description:
        'Você sofre 1 ponto de dano adicional por dado de dano de impacto. Por exemplo, se for atingido por uma clava (dano 1d6), sofre 1d6+1 pontos de dano. Se cair de 3m de altura (dano 2d6), sofre 2d6+2 pontos de dano.',
    },
    {
      name: 'Vanguardista',
      description:
        'Você recebe proficiência em armas de fogo e +2 em testes de Ofício (um qualquer, a sua escolha).',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Vanguardista',
          },
          action: {
            type: 'addProficiency',
            availableProficiencies: [PROFICIENCIAS.FOGO],
            pick: 1,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Vanguardista',
          },
          target: {
            type: 'Skill',
            name: Skill.OFICIO,
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
  ],
};

export default KLIREN;
