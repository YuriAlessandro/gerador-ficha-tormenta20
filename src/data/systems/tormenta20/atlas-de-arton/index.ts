/**
 * Exporta todos os dados do suplemento: Atlas de Arton - Tormenta 20
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import ATLAS_ARTON_ORIGINS from './origins';
import { GeneralPowerType } from '../../../../interfaces/Poderes';

export const TORMENTA20_ATLAS_ARTON_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_ATLAS_ARTON,
  races: [],
  classes: [],
  powers: {
    [GeneralPowerType.COMBATE]: [],
    [GeneralPowerType.DESTINO]: [],
    [GeneralPowerType.MAGIA]: [],
    [GeneralPowerType.CONCEDIDOS]: [],
    [GeneralPowerType.TORMENTA]: [],
    [GeneralPowerType.RACA]: [],
  },
  origins: ATLAS_ARTON_ORIGINS,
};

// Legacy export for backwards compatibility
export const ATLAS_ARTON_SUPPLEMENT = TORMENTA20_ATLAS_ARTON_SUPPLEMENT;
