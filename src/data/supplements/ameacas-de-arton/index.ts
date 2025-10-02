/**
 * Exporta todos os dados do suplemento: Ameaças de Arton
 */
import { SupplementId } from '../../../types/supplement.types';
import { SupplementData } from '../core';
import AMEACAS_ARTON_RACES from './races';
import AMEACAS_ARTON_CLASSES from './classes';
import AMEACAS_ARTON_POWERS from './powers';

export const AMEACAS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.AMEACAS_ARTON,
  races: AMEACAS_ARTON_RACES,
  classes: AMEACAS_ARTON_CLASSES,
  powers: AMEACAS_ARTON_POWERS,
};

export default AMEACAS_ARTON_SUPPLEMENT;
