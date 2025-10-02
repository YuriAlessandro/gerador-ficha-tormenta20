/**
 * Tormenta 20 System Data
 * Exports all core and supplement data for Tormenta 20
 */
import { SystemId } from '../../../types/system.types';
import { SupplementId } from '../../../types/supplement.types';
import {
  TORMENTA20_CORE_SUPPLEMENT,
  CORE_SUPPLEMENT,
  SupplementData,
} from './core';
import { TORMENTA20_AMEACAS_ARTON_SUPPLEMENT } from './ameacas-de-arton';

export interface SystemData {
  systemId: SystemId;
  supplements: Partial<Record<SupplementId, SupplementData>>;
}

// Use only new IDs - legacy IDs have the same string values
const TORMENTA20_SUPPLEMENTS: Partial<Record<SupplementId, SupplementData>> = {
  [SupplementId.TORMENTA20_CORE]: TORMENTA20_CORE_SUPPLEMENT,
  [SupplementId.TORMENTA20_AMEACAS_ARTON]: TORMENTA20_AMEACAS_ARTON_SUPPLEMENT,
};

export const TORMENTA20_SYSTEM: SystemData = {
  systemId: SystemId.TORMENTA20,
  supplements: TORMENTA20_SUPPLEMENTS,
};

export type { SupplementData };
export { TORMENTA20_CORE_SUPPLEMENT, CORE_SUPPLEMENT };
