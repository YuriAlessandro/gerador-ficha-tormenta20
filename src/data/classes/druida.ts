import { pickFromArray } from '../../functions/randomUtils';
import { ClassDescription } from '../../interfaces/Class';
import { allSpellSchools } from '../../interfaces/Spells';
import { Atributo } from '../atributos';
import PERICIAS from '../pericias';
import PROFICIENCIAS from '../proficiencias';

const DRUIDA: ClassDescription = {
  name: 'Druida',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [PERICIAS.SOBREVIVENCIA, PERICIAS.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      PERICIAS.ADESTRAMENTO,
      PERICIAS.ATLESTISMO,
      PERICIAS.CAVALGAR,
      PERICIAS.CONHECIMENTO,
      PERICIAS.CURA,
      PERICIAS.FORIITUDE,
      PERICIAS.INICIATIVA,
      PERICIAS.INTUICAO,
      PERICIAS.LUTA,
      PERICIAS.MISTICISMO,
      PERICIAS.OFICIO,
      PERICIAS.PERCEPCAO,
      PERICIAS.RELIGIAO,
    ],
  },
  proeficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  habilities: [
    {
      name: 'Devoto',
      text:
        'Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. O nome desta habilidade muda de acordo com a divindade escolhida: Devoto de Allihanna, Devoto de Megalokk ou Devoto de Oceano.',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text:
        'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).',
      effect: null,
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      effect: null,
      nivel: 1,
    },
  ],
  probDevoto: 1,
  qtdPoderesConcedidos: 'all',
  faithProbability: {
    AHARADAK: 1,
    OCEANO: 1,
    TENEBRA: 0,
    VALKARIA: 0,
    WYNNA: 0,
    LENA: 0,
    SSZZAAS: 0,
    THYATIS: 0,
    ARSENAL: 0,
    TANNATOH: 0,
    ALLIHANNA: 1,
    MARAH: 0,
    KALLYADRANOCH: 0,
    KHALMYR: 0,
    THWOR: 0,
    HYNINN: 0,
    AZGHER: 0,
    LINWU: 0,
    MEGALOKK: 0,
    NIMB: 0,
  },
  setup: (classe) => {
    const modifiedClasse = { ...classe };
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default DRUIDA;
