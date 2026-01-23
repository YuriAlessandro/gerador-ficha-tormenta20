import {
  GeneralPowers,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';
import combatPowers from './combatPowers';
import destinyPowers from './destinyPowers';
import magicPowers from './magicPowers';
import tormentaPowers from './tormentaPowers';
import racePowers from './racePowers';

/**
 * Poderes do suplemento Heróis de Arton - Tormenta 20
 */

const HEROIS_ARTON_POWERS: GeneralPowers = {
  [GeneralPowerType.COMBATE]: Object.values(combatPowers),
  [GeneralPowerType.DESTINO]: Object.values(destinyPowers),
  [GeneralPowerType.MAGIA]: Object.values(magicPowers),
  [GeneralPowerType.CONCEDIDOS]: [],
  [GeneralPowerType.TORMENTA]: Object.values(tormentaPowers),
  [GeneralPowerType.RACA]: Object.values(racePowers),
};

export default HEROIS_ARTON_POWERS;
