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
import HEROIS_ARTON_ORIGINS from './origins';
import HEROIS_ARTON_CLASS_POWERS from './classPowers';
import HEROIS_ARTON_GOLPE_PESSOAL_EFFECTS from './golpePessoalEffects';
import HEROIS_ARTON_VARIANT_CLASSES from './variantClasses';
import { HEROIS_ARTON_SPELLS } from './spells';

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
    [GeneralPowerType.RACA]: HEROIS_ARTON_POWERS[GeneralPowerType.RACA],
  },
  equipment: HEROIS_ARTON_EQUIPMENT,
  origins: HEROIS_ARTON_ORIGINS,
  classPowers: HEROIS_ARTON_CLASS_POWERS,
  golpePessoalEffects: HEROIS_ARTON_GOLPE_PESSOAL_EFFECTS,
  variantClasses: HEROIS_ARTON_VARIANT_CLASSES,
  spells: HEROIS_ARTON_SPELLS,
};
