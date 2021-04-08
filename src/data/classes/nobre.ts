import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const NOBRE: ClassDescription = {
  name: 'Nobre',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.DIPLOMACIA, Skill.INTIMIDACAO],
    },
    {
      type: 'and',
      list: [Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.PESADAS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Autoconfiança',
      text:
        'Você pode somar seu bônus de Carisma em vez de Destreza na Defesa (mas continua não podendo somar um bônus de atributo na Defesa quando usa armadura pesada).',
      nivel: 1,
    },
    {
      name: 'Espólio',
      text: 'Você recebe um item a sua escolha com preço de até T$ 2.000.',
      nivel: 1,
    },
    {
      name: 'Orgulho',
      text:
        'Quando faz um teste de perícia, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu modificador de Carisma). Para cada PM que gastar, recebe +2 no teste.',
      nivel: 1,
    },
  ],
  powers: [],
  probDevoto: 0.3,
  faithProbability: {
    AZGHER: 1,
    HYNINN: 1,
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LENA: 1,
    LINWU: 1,
    MARAH: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.CARISMA],
};

export default NOBRE;
