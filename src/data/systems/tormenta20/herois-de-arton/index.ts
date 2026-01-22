/**
 * Exporta todos os dados do suplemento: Heróis de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import { GeneralPowerType } from '../../../../interfaces/Poderes';
import HEROIS_ARTON_RACES from './races';
import HEROIS_ARTON_CLASSES from './classes';
import HEROIS_ARTON_POWERS from './powers';
import HEROIS_ARTON_EQUIPMENT from './equipment';

export const TORMENTA20_HEROIS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_HEROIS_ARTON,
  races: HEROIS_ARTON_RACES,
  classes: HEROIS_ARTON_CLASSES,
  powers: {
    [GeneralPowerType.COMBATE]: HEROIS_ARTON_POWERS[GeneralPowerType.COMBATE],
    [GeneralPowerType.DESTINO]: HEROIS_ARTON_POWERS[GeneralPowerType.DESTINO],
    [GeneralPowerType.MAGIA]: HEROIS_ARTON_POWERS[GeneralPowerType.MAGIA],
    [GeneralPowerType.CONCEDIDOS]:
      HEROIS_ARTON_POWERS[GeneralPowerType.CONCEDIDOS],
    [GeneralPowerType.TORMENTA]: HEROIS_ARTON_POWERS[GeneralPowerType.TORMENTA],
  },
  equipment: HEROIS_ARTON_EQUIPMENT,
};
