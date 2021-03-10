import { getRandomItemFromArray } from '../../functions/randomUtils';
import { ClassDescription, SpellPath } from '../../interfaces/Class';
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
  habilities: [
    {
      name: 'Caminho do Arcanista',
      text: 'A FAZER MELHOR',
      effect: null,
      nivel: 1,
    },
  ],
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
    const modifiedClasse = { ...classe };
    const subtype = getRandomItemFromArray(allArcanistaSubtypes);
    modifiedClasse.subname = subtype;
    modifiedClasse.spellPath = spellPaths[subtype];

    return modifiedClasse;
  },
};

export default ARCANISTA;
