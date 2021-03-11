import _ from 'lodash';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import {
  ClassDescription,
  ClassHability,
  SpellPath,
} from '../../interfaces/Class';
import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

type ArcanistaSubtypes = 'Bruxo' | 'Mago' | 'Feiticeiro';
const allArcanistaSubtypes: ArcanistaSubtypes[] = [
  'Bruxo',
  'Mago',
  'Feiticeiro',
];

const spellPaths: Record<ArcanistaSubtypes, SpellPath> = {
  Bruxo: {
    initialSpells: 3,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: () => 1,
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
  },
  Mago: {
    initialSpells: 4,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: (level) => ([5, 9, 13, 17].includes(level) ? 2 : 1),
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
  },
  Feiticeiro: {
    initialSpells: 3,
    spellType: 'Arcane',
    qtySpellsLearnAtLevel: (level) => (level % 2 === 1 ? 1 : 0),
    spellCircleAvailableAtLevel: (level) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
  },
};

const classHabilities: Record<ArcanistaSubtypes, ClassHability> = {
  Bruxo: {
    name: 'Caminho do Arcanista',
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um bruxo, capaz de lançar magias através de um foco como uma varinha, cajado, chapéu, etc.',
    nivel: 1,
  },
  Mago: {
    name: 'Caminho do Arcanista',
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um mago, capaz de lançar magia através de todo o seu estudo mágico. Seu livro de magias contém todas as suas magias, e a cada dia você pode preparar até metade de suas magias para usar durante o dia.',
    nivel: 1,
  },
  Feiticeiro: {
    name: 'Caminho do Arcanista',
    text:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um feiticeiro, capaz de lançar magias atráves de um poder inato que corre no seu sangue.',
    nivel: 1,
  },
};

const feiticeiroPaths: ClassHability[] = [
  {
    name: 'Linhagem Dracônica',
    text:
      'Um de seus antepassados foi um majestoso dragão. Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio. Básica: Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
  },
  {
    name: 'Linhagem Feérica',
    text:
      'Seu sangue foi tocado pelas fadas. Básica: Você se torna treinado em Enganação e aprende uma magia de 1º círculo de encantamento ou ilusão, arcana ou divina, a sua escolha. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
  },
  {
    name: 'Linhagem Rubra',
    text:
      'Seu sangue foi corrompido pela Tormenta. Básica: Você recebe um poder da Tormenta. Quando adquire um poder da Tormenta, você pode aplicar a penalidade em Carisma a outro atributo. Sua relação com a invasão aberrante lhe permite sacrificar partes específicas de seu ser. (ADICIONE VOCÊ MESMO)',
    nivel: 1,
  },
];

const ARCANISTA: ClassDescription = {
  name: 'Arcanista',
  pv: 8,
  addpv: 2,
  pm: 6,
  addpm: 6,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.MISTICISMO, PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 1,
    list: [
      PERICIAS.CONHECIMENTO,
      PERICIAS.INICIATIVA,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
    ],
  },
  proeficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  habilities: [],
  probDevoto: 0.3,
  faithProbability: {
    AZGHER: 1,
    KALLYADRANOCH: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    TENEBRA: 1,
    VALKARIA: 1,
    WYNNA: 1,
  },
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    const subtype = getRandomItemFromArray(allArcanistaSubtypes);
    modifiedClasse.subname = subtype;
    modifiedClasse.spellPath = spellPaths[subtype];
    modifiedClasse.habilities.push(classHabilities[subtype]);
    if (subtype === 'Feiticeiro') {
      modifiedClasse.habilities.push(getRandomItemFromArray(feiticeiroPaths));
    }

    return modifiedClasse;
  },
};

export default ARCANISTA;
