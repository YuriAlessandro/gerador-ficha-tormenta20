import {
  GeneralPower,
  GeneralPowers,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';

/**
 * Poderes do suplemento Heróis de Arton - Tormenta 20
 */

// Poderes de Combate
const HEROIS_ARTON_COMBAT_POWERS: GeneralPower[] = [];

// Poderes de Destino
const HEROIS_ARTON_DESTINY_POWERS: GeneralPower[] = [];

// Poderes de Magia
const HEROIS_ARTON_MAGIC_POWERS: GeneralPower[] = [];

// Poderes Concedidos
const HEROIS_ARTON_GRANTED_POWERS: GeneralPower[] = [];

// Poderes de Tormenta
const HEROIS_ARTON_TORMENTA_POWERS: GeneralPower[] = [];

const HEROIS_ARTON_POWERS: GeneralPowers = {
  [GeneralPowerType.COMBATE]: HEROIS_ARTON_COMBAT_POWERS,
  [GeneralPowerType.DESTINO]: HEROIS_ARTON_DESTINY_POWERS,
  [GeneralPowerType.MAGIA]: HEROIS_ARTON_MAGIC_POWERS,
  [GeneralPowerType.CONCEDIDOS]: HEROIS_ARTON_GRANTED_POWERS,
  [GeneralPowerType.TORMENTA]: HEROIS_ARTON_TORMENTA_POWERS,
};

export default HEROIS_ARTON_POWERS;
