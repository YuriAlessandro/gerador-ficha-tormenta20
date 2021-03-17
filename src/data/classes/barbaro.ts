import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BARBARO: ClassDescription = {
  name: 'Bárbaro',
  pv: 24,
  addpv: 6,
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
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.SOBREVIVENCIA,
      Skill.VONTADE,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Furia',
      text:
        'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode fazer nenhuma ação que exija calma e concentração (como usar a perícia Furtividade ou lançar magias). A cada cinco níveis, pode gastar +2 PM para aumentar os bônus em +1. A Fúria termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito (ataque, habilidade, magia...) hostil.',
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    AZGHER: 1,
    MEGALOKK: 1,
    NIMB: 1,
    OCEANO: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO],
};

export default BARBARO;
