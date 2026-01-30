/**
 * Exporta todos os dados do suplemento: Deuses de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import { GeneralPowerType } from '../../../../interfaces/Poderes';
import DEUSES_ARTON_RACES from './races';
import DEUSES_ARTON_CLASSES from './classes';
import DEUSES_ARTON_POWERS from './powers';
import DEUSES_ARTON_EQUIPMENT from './equipment';
import DEUSES_ARTON_IMPROVEMENTS from './improvements';
import DEUSES_ARTON_SPELLS from './spells';

export const TORMENTA20_DEUSES_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_DEUSES_ARTON,
  races: DEUSES_ARTON_RACES,
  classes: DEUSES_ARTON_CLASSES,
  powers: {
    [GeneralPowerType.COMBATE]: DEUSES_ARTON_POWERS[GeneralPowerType.COMBATE],
    [GeneralPowerType.DESTINO]: DEUSES_ARTON_POWERS[GeneralPowerType.DESTINO],
    [GeneralPowerType.MAGIA]: DEUSES_ARTON_POWERS[GeneralPowerType.MAGIA],
    [GeneralPowerType.CONCEDIDOS]:
      DEUSES_ARTON_POWERS[GeneralPowerType.CONCEDIDOS],
    [GeneralPowerType.TORMENTA]: DEUSES_ARTON_POWERS[GeneralPowerType.TORMENTA],
    [GeneralPowerType.RACA]: DEUSES_ARTON_POWERS[GeneralPowerType.RACA],
  },
  equipment: DEUSES_ARTON_EQUIPMENT,
  improvements: DEUSES_ARTON_IMPROVEMENTS,
  spells: DEUSES_ARTON_SPELLS,
};
