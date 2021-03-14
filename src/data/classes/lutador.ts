import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import PROFICIENCIAS from '../proficiencias';

const LUTADOR: ClassDescription = {
  name: 'Lutador',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ACROBACIA,
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  proeficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Briga',
      text:
        'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades). A cada quatro níveis, seu dano desarmado aumenta, conforme a tabela. O dano na tabela é para criaturas Pequenas e Médias. Criaturas Minúsculas diminuem esse dano em um passo, Grandes e Enormes aumentam em um passo e Colossais aumentam em dois passos.',
      nivel: 1,
    },
    {
      name: 'Golpe Relâmpago',
      text:
        'Quando usa a ação atacar para fazer um ataque desarmado, você pode gastar 1 PM para realizar um ataque desarmado adicional.',
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ARSENAL: 1,
    KALLYADRANOCH: 1,
    MEGALOKK: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
};

export default LUTADOR;
