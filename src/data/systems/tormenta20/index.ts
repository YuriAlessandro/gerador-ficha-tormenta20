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
import { TORMENTA20_ATLAS_ARTON_SUPPLEMENT } from './atlas-de-arton';
import { TORMENTA20_DEUSES_ARTON_SUPPLEMENT } from './deuses-de-arton';
import { TORMENTA20_HEROIS_ARTON_SUPPLEMENT } from './herois-de-arton';

export interface SystemData {
  systemId: SystemId;
  supplements: Partial<Record<SupplementId, SupplementData>>;
}

// Use only new IDs - legacy IDs have the same string values
const TORMENTA20_SUPPLEMENTS: Partial<Record<SupplementId, SupplementData>> = {
  [SupplementId.TORMENTA20_CORE]: TORMENTA20_CORE_SUPPLEMENT,
  [SupplementId.TORMENTA20_AMEACAS_ARTON]: TORMENTA20_AMEACAS_ARTON_SUPPLEMENT,
  [SupplementId.TORMENTA20_ATLAS_ARTON]: TORMENTA20_ATLAS_ARTON_SUPPLEMENT,
  [SupplementId.TORMENTA20_DEUSES_ARTON]: TORMENTA20_DEUSES_ARTON_SUPPLEMENT,
  [SupplementId.TORMENTA20_HEROIS_ARTON]: TORMENTA20_HEROIS_ARTON_SUPPLEMENT,
};

export const TORMENTA20_SYSTEM: SystemData = {
  systemId: SystemId.TORMENTA20,
  supplements: TORMENTA20_SUPPLEMENTS,
};

export type { SupplementData };
export { TORMENTA20_CORE_SUPPLEMENT, CORE_SUPPLEMENT };
