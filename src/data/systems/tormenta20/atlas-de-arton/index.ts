/**
 * Exporta todos os dados do suplemento: Atlas de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import ATLAS_ARTON_ORIGINS from './origins';

export const TORMENTA20_ATLAS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_ATLAS_ARTON,
  races: [],
  classes: [],
  powers: {},
  origins: ATLAS_ARTON_ORIGINS,
};

// Legacy export for backwards compatibility
export const ATLAS_ARTON_SUPPLEMENT = TORMENTA20_ATLAS_ARTON_SUPPLEMENT;
