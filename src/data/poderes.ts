/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getPowersBySupplements()
 */
import CORE_POWERS from './systems/tormenta20/core/powers';
import { GeneralPower, GeneralPowers } from '../interfaces/Poderes';

/**
 * @deprecated Use CORE_POWERS diretamente
 */
const generalPowers: GeneralPowers = CORE_POWERS;

export default generalPowers;

/**
 * @deprecated Use CORE_POWERS.TORMENTA.filter() diretamente
 */
export function getUnrestricedTormentaPowers(): GeneralPower[] {
  return CORE_POWERS.TORMENTA.filter(
    (power) => power.requirements.length === 0
  );
}
