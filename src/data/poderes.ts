/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getPowersBySupplements()
 */
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from './registry';
import { GeneralPower, GeneralPowers } from '../interfaces/Poderes';

/**
 * @deprecated Use dataRegistry.getPowersBySupplements([SupplementId.TORMENTA20_CORE])
 */
const generalPowers: GeneralPowers = dataRegistry.getPowersBySupplements([
  SupplementId.TORMENTA20_CORE,
]);

export default generalPowers;

/**
 * @deprecated Use dataRegistry com filtro de poderes Tormenta sem requisitos
 */
export function getUnrestricedTormentaPowers(): GeneralPower[] {
  const powers = dataRegistry.getPowersBySupplements([
    SupplementId.TORMENTA20_CORE,
  ]);
  return powers.TORMENTA.filter((power) => power.requirements.length === 0);
}
