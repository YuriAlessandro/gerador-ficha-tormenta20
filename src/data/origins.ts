import Origin from '../interfaces/Origin';
import PERICIAS from './pericias';
import originPowers from './poderes/origem';

const origins: Origin[] = [
  {
    name: 'Acólito',
    itens: [],
    pericias: [PERICIAS.CURA],
    poder: originPowers.MEMBRODAIGREJA,
  },
];

export default origins;
