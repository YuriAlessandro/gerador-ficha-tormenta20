/**
 * Poderes do Suplemento: Ameaças de Arton
 */
import { GeneralPowers } from '../../../../../interfaces/Poderes';
import DRACONIC_BLESSINGS from './draconicBlessings';
import KOBOLDS_TALENTS from './koboldsTalents';
import MECHANICAL_MARVELS from './mechanicalMarvels';
import AMEACAS_ARTON_DESTINY_POWERS from './destinyPowers';
import {
  AMEACAS_ARTON_MOUNT_COMBAT_POWERS,
  AMEACAS_ARTON_MOUNT_DESTINY_POWERS,
} from './mountPowers';

const AMEACAS_ARTON_POWERS: GeneralPowers = {
  COMBATE: [...AMEACAS_ARTON_MOUNT_COMBAT_POWERS],
  CONCEDIDOS: [],
  DESTINO: [
    ...DRACONIC_BLESSINGS,
    ...KOBOLDS_TALENTS,
    ...MECHANICAL_MARVELS,
    ...AMEACAS_ARTON_MOUNT_DESTINY_POWERS,
    ...AMEACAS_ARTON_DESTINY_POWERS,
  ],
  MAGIA: [],
  TORMENTA: [],
  RACA: [],
};

export default AMEACAS_ARTON_POWERS;
