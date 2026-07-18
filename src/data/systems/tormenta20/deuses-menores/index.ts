/**
 * Exporta todos os dados do suplemento: Guia de Deuses Menores - Tormenta 20
 *
 * O suplemento adiciona apenas divindades (63 deuses menores) e seus poderes
 * concedidos — um por deus. Os poderes ficam tanto em `powers.CONCEDIDOS`
 * (para a enciclopédia e a edição de poderes) quanto dentro de cada
 * `Divindade.poderes` (para a seleção de devoção).
 */
import { SupplementId } from '../../../../types/supplement.types';
import { SupplementData } from '../core';
import { GeneralPowerType } from '../../../../interfaces/Poderes';
import DEUSES_MENORES_POWERS from './powers';
import DEUSES_MENORES_DIVINDADES from './divindades';

export const TORMENTA20_DEUSES_MENORES_SUPPLEMENT: SupplementData = {
  id: SupplementId.TORMENTA20_DEUSES_MENORES,
  races: [],
  classes: [],
  powers: {
    [GeneralPowerType.COMBATE]: DEUSES_MENORES_POWERS[GeneralPowerType.COMBATE],
    [GeneralPowerType.DESTINO]: DEUSES_MENORES_POWERS[GeneralPowerType.DESTINO],
    [GeneralPowerType.MAGIA]: DEUSES_MENORES_POWERS[GeneralPowerType.MAGIA],
    [GeneralPowerType.CONCEDIDOS]:
      DEUSES_MENORES_POWERS[GeneralPowerType.CONCEDIDOS],
    [GeneralPowerType.TORMENTA]:
      DEUSES_MENORES_POWERS[GeneralPowerType.TORMENTA],
    [GeneralPowerType.RACA]: DEUSES_MENORES_POWERS[GeneralPowerType.RACA],
  },
  divindades: DEUSES_MENORES_DIVINDADES,
};

export default TORMENTA20_DEUSES_MENORES_SUPPLEMENT;
