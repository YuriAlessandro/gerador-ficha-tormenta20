import _ from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import { ClassDescription } from '../../interfaces/Class';
import Skill from '../../interfaces/Skills';
import { allSpellSchools } from '../../interfaces/Spells';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BARDO: ClassDescription = {
  name: 'Bardo',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ATUACAO, Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ACROBACIA,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LADINAGEM,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.RELIGIAO,
      Skill.VONTADE,
    ],
  },
  proeficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
  ],
  abilities: [
    {
      name: 'Inspiração',
      text:
        'Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua música (ou outro tipo de arte, como dança). Você e todos os seus aliados em alcance curto ganham +1 em testes de perícia até o fim da cena. A cada quatro níveis, pode gastar +2 PM para aumentar o bônus em +1.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias arcanas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Você pode lançar essas magias vestindo armaduras leves sem precisar de testes de Misticismo. Seu atributo-chave para lançar magias é Carisma e você soma seu bônus de Carisma no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      effect: null,
      nivel: 1,
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    MARAH: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    TENEBRA: 1,
    VALKARIA: 1,
    WYNNA: 1,
  },
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Arcane',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.CARISMA,
    };

    return modifiedClasse;
  },
};

export default BARDO;
