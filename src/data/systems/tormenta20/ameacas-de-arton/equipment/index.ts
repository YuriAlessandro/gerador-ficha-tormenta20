import { SupplementEquipment } from '../../core';
import AMEACAS_ARTON_WEAPONS from './weapons';
import AMEACAS_ARTON_ARMORS from './armors';

/**
 * Exporta todos os equipamentos (armas e armaduras) do suplemento Ameaças de Arton
 */

export const AMEACAS_ARTON_EQUIPMENT: SupplementEquipment = {
  weapons: AMEACAS_ARTON_WEAPONS,
  armors: AMEACAS_ARTON_ARMORS,
};

export default AMEACAS_ARTON_EQUIPMENT;
export { AMEACAS_ARTON_WEAPONS, AMEACAS_ARTON_ARMORS };
