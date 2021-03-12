import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import PROFICIENCIAS from '../proficiencias';

const INVENTOR: ClassDescription = {
  name: 'Inventor',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.OFICIO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INVESTIGACAO,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.OFICIO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
      Skill.PERCEPCAO,
    ],
  },
  proeficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Engenhosidade',
      text:
        'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Protótipo',
      text:
        'Você começa o jogo com um item superior com uma modificação ou 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.',
      effect: null,
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
};

export default INVENTOR;
