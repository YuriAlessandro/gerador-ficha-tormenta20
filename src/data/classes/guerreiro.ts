import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import PROFICIENCIAS from '../proficiencias';

const GUERREIRO: ClassDescription = {
  name: 'Guerreiro',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.PESADAS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Ataque Especial',
      text:
        'Quando faz um ataque, você pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +4. Você pode dividir os bônus igualmente. Por exemplo, no 17º nível, pode gastar 5 PM para receber +20 no ataque, +20 no dano ou +10 no ataque e +10 no dano.',
      effect: null,
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ARSENAL: 1,
    AZGHER: 1,
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LINWU: 1,
    THYATIS: 1,
    VALKARIA: 1,
  },
};

export default GUERREIRO;
