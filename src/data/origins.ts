import { getRandomItemFromArray } from '../functions/randomUtils';
import Origin from '../interfaces/Origin';
import PERICIAS from './pericias';
import originPowers from './poderes/origem';
import { DestinyPowers } from './poderes/destino';
import { GeneralPower, OriginPower } from '../interfaces/Poderes';

const origins: Origin[] = [
  {
    name: 'Acólito',
    itens: [],
    pericias: [PERICIAS.CURA],
    poderes: [originPowers.MEMBRODAIGREJA],
  },
  {
    name: 'Amigo dos Animais',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.CAVAKGAR],
    poderes: [originPowers.AMIGOESPECIAL],
  },
  {
    name: 'Amnésico',
    itens: [],
    pericias: [getRandomItemFromArray(Object.values(PERICIAS))],
    poderes: [
      originPowers.LEMBRANCASGRADUAIS,
      getRandomItemFromArray(Object.values(originPowers)),
    ],
  },
  {
    name: 'Aristocrata',
    itens: [],
    pericias: [PERICIAS.DIPLOMACIA, PERICIAS.ENGANACAO, PERICIAS.NOBREZA],
    poderes: [originPowers.SANGUEAZUL],
  },
  {
    name: 'Artesão',
    itens: [],
    pericias: [PERICIAS.OFICIO, PERICIAS.VONTADE],
    poderes: [originPowers.FRUTOSDETRABALHO],
  },
  {
    name: 'Artista',
    itens: [],
    pericias: [PERICIAS.ATUACAO, PERICIAS.ENGANACAO],
    poderes: [originPowers.DOMARTISTICO],
  },
  {
    name: 'Assistente de Laboratório',
    itens: [],
    pericias: [PERICIAS.OFICIO],
    poderes: [originPowers.ESSECHEIRO],
  },
  {
    name: 'Batedor',
    itens: [],
    pericias: [PERICIAS.PERCEPCAO, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.PROVADETUDO],
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
      getRandomItemFromArray<OriginPower | GeneralPower>([
        originPowers.PODER,
        DestinyPowers.APARENCIAINOFENSIVA,
        DestinyPowers.SORTUDO,
      ]),
    ],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
  {
    name: '',
    itens: [],
    pericias: [],
    poderes: [originPowers.PODER],
  },
];

export default origins;
