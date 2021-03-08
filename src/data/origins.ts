import Origin from '../interfaces/Origin';
import PERICIAS from './pericias';
import originPowers from './powers/originPowers';
import { DestinyPowers } from './powers/destinyPowers';

const origins: Origin[] = [
  // TODO: Adicionar Medicina, Vontade de Ferro
  {
    name: 'Acólito',
    itens: [],
    pericias: [PERICIAS.CURA, PERICIAS.RELIGIAO, PERICIAS.VONTADE],
    poderes: [originPowers.MEMBRO_DA_IGREJA],
  },
  {
    name: 'Amigo dos Animais',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.CAVALGAR],
    poderes: [originPowers.AMIGO_ESPECIAL],
  },
  {
    name: 'Amnésico',
    itens: [],
    pericias: [],
    poderes: [originPowers.LEMBRANCAS_GRADUAIS],
  },
  {
    name: 'Aristocrata',
    itens: [],
    pericias: [PERICIAS.DIPLOMACIA, PERICIAS.ENGANACAO, PERICIAS.NOBREZA],
    poderes: [originPowers.SANGUE_AZUL],
  },
  {
    name: 'Artesão',
    itens: [],
    pericias: [PERICIAS.OFICIO, PERICIAS.VONTADE],
    poderes: [originPowers.FRUDOS_DO_TRABALHO],
  },
  {
    name: 'Artista',
    itens: [],
    pericias: [PERICIAS.ATUACAO, PERICIAS.ENGANACAO],
    poderes: [originPowers.DOM_ARTISTICO],
  },
  {
    name: 'Assistente de Laboratório',
    itens: [],
    pericias: [PERICIAS.OFICIO],
    poderes: [originPowers.ESSE_CHEIRO],
  },
  {
    name: 'Batedor',
    itens: [],
    pericias: [PERICIAS.PERCEPCAO, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.PROVA_DE_TUDO],
  },
  {
    name: 'Capanga',
    itens: [],
    pericias: [PERICIAS.LUTA, PERICIAS.INTIMIDACAO],
    poderes: [originPowers.CONFISSAO],
  },
  {
    name: 'Charlatão',
    itens: [],
    pericias: [PERICIAS.ENGANACAO, PERICIAS.JOGATINA],
    poderes: [
      originPowers.ALPINISTA_SOCIAL,
      DestinyPowers.APARENCIAINOFENSIVA,
      DestinyPowers.SORTUDO,
    ],
  },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
  // {
  //   name: '',
  //   itens: [],
  //   pericias: [],
  //   poderes: [originPowers.PODER],
  // },
];

export default origins;
