import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const PALADINO: ClassDescription = {
  name: 'Paladino',
  pv: 20,
  addpv: 5,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.NOBREZA,
      Skill.PERCEPCAO,
      Skill.RELIGIAO,
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
      name: 'Abençoado',
      text:
        'Você soma seu bônus de Carisma no seu total de pontos de mana no 1º nível. Além disso, torna-se devoto de uma divindade disponível para paladinos (Azgher, Khalmyr, Lena, Lin-Wu, Marah, Tanna-Toh, Thyatis, Valkaria). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. Como alternativa, você pode ser um paladino do bem, lutando em prol da bondade e da justiça como um todo. Não recebe nenhum Poder Concedido, mas não precisa seguir nenhuma Obrigação & Restrição (além do Código do Herói, abaixo).',
      nivel: 1,
    },
    {
      name: 'Código de Héroi',
      text:
        'Você deve sempre manter sua palavra e nunca pode recusar um pedido de ajuda de alguém inocente. Além disso, nunca pode mentir, trapacear ou roubar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia.',
      nivel: 1,
    },
    {
      name: 'Golpe Divino',
      text:
        'Quando faz um ataque corpo a corpo, você pode gastar 2 PM para desferir um golpe destruidor. Você soma seu bônus de Carisma no teste de ataque e +1d8 na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o dano em +1d8.',
      nivel: 1,
    },
  ],
  probDevoto: 0.8,
  qtdPoderesConcedidos: 'all',
  faithProbability: {
    AZGHER: 1,
    KHALMYR: 1,
    LENA: 1,
    LINWU: 1,
    MARAH: 1,
    TANNATOH: 1,
    THYATIS: 1,
    VALKARIA: 1,
    AHARADAK: 0,
    ALLIHANNA: 0,
    ARSENAL: 0,
    HYNINN: 0,
    KALLYADRANOCH: 0,
    MEGALOKK: 0,
    NIMB: 0,
    OCEANO: 0,
    SSZZAAS: 0,
    TENEBRA: 0,
    THWOR: 0,
    WYNNA: 0,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO, Atributo.CARISMA],
};

export default PALADINO;
