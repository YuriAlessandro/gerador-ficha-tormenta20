/**
 * Exporta todos os dados do suplemento: Ameaças de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import AMEACAS_ARTON_RACES from './races';
import AMEACAS_ARTON_CLASSES from './classes';
import AMEACAS_ARTON_POWERS from './powers';
import { AMEACAS_ARTON_EQUIPMENT } from './equipment';

export const TORMENTA20_AMEACAS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_AMEACAS_ARTON,
  races: AMEACAS_ARTON_RACES,
  classes: AMEACAS_ARTON_CLASSES,
  powers: AMEACAS_ARTON_POWERS,
  equipment: AMEACAS_ARTON_EQUIPMENT,
};

// Legacy export for backwards compatibility
export const AMEACAS_ARTON_SUPPLEMENT = TORMENTA20_AMEACAS_ARTON_SUPPLEMENT;
