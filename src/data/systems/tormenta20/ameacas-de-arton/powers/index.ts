/**
 * Poderes do Suplemento: Ameaças de Arton
 */
import { GeneralPowers } from '../../../../../interfaces/Poderes';
import DRACONIC_BLESSINGS from './draconicBlessings';
import KOBOLDS_TALENTS from './koboldsTalents';
import MECHANICAL_MARVELS from './mechanicalMarvels';

const AMEACAS_ARTON_POWERS: GeneralPowers = {
  COMBATE: [],
  CONCEDIDOS: [],
  DESTINO: [...DRACONIC_BLESSINGS, ...KOBOLDS_TALENTS, ...MECHANICAL_MARVELS],
  MAGIA: [],
  TORMENTA: [],
  RACA: [],
};

export default AMEACAS_ARTON_POWERS;
