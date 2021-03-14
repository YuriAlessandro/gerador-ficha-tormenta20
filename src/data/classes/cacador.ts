import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const CACADOR: ClassDescription = {
  name: 'Caçador',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.SOBREVIVENCIA],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.FORTITUDE,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INVESTIGACAO,
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
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Marca da Presa',
      text:
        'Você pode gastar uma ação de movimento e 1 PM para analisar uma criatura em alcance curto. Até o fim da cena, você recebe +1d4 nas rolagens de dano contra essa criatura. A cada quatro níveis, você pode gastar +1 PM para aumentar o bônus de dano (veja a tabela da classe).',
      nivel: 1,
    },
    {
      name: 'Rastreador',
      text:
        'Você recebe +2 em Sobrevivência. Além disso, pode se mover com seu deslocamento normal enquanto rastreia sem sofrer penalidades no teste de Sobrevivência.',
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ALLIHANNA: 1,
    AZGHER: 1,
    MEGALOKK: 1,
    OCEANO: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.DESTREZA, Atributo.SABEDORIA],
};

export default CACADOR;
