import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BUCANEIRO: ClassDescription = {
  name: 'Bucaneiro',
  pv: 16,
  addpv: 4,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Audácia',
      text:
        'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Carisma no teste. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Insolência',
      text:
        'Você soma seu bônus de Carisma na Defesa, limitado pelo seu nível. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 1,
    },
  ],
  powers: [],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    OCEANO: 1,
    SSZZAAS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.DESTREZA, Atributo.INTELIGENCIA],
};

export default BUCANEIRO;
