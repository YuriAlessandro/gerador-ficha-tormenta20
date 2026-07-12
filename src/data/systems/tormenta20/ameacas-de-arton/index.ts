/**
 * Exporta todos os dados do suplemento: Ameaças de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import AMEACAS_ARTON_RACES from './races';
import AMEACAS_ARTON_CLASSES from './classes';
import AMEACAS_ARTON_POWERS from './powers';
import { AMEACAS_ARTON_EQUIPMENT } from './equipment';
import { AMEACAS_ARTON_SPELLS } from './spells';
import AMEACAS_ARTON_IMPROVEMENTS from './improvements';
import { AMEACAS_ARTON_SPECIAL_MATERIALS } from './specialMaterials';

export const TORMENTA20_AMEACAS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_AMEACAS_ARTON,
  races: AMEACAS_ARTON_RACES,
  classes: AMEACAS_ARTON_CLASSES,
  powers: AMEACAS_ARTON_POWERS,
  equipment: AMEACAS_ARTON_EQUIPMENT,
  spells: AMEACAS_ARTON_SPELLS,
  improvements: AMEACAS_ARTON_IMPROVEMENTS,
  specialMaterials: AMEACAS_ARTON_SPECIAL_MATERIALS,
};

// Legacy export for backwards compatibility
export const AMEACAS_ARTON_SUPPLEMENT = TORMENTA20_AMEACAS_ARTON_SUPPLEMENT;
