/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getRacesBySupplements()
 */
import _ from 'lodash';
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from './registry';
import Race from '../interfaces/Race';

/**
 * @deprecated Use dataRegistry.getRacesBySupplements([SupplementId.CORE])
 */
const RACAS = dataRegistry.getRacesBySupplements([SupplementId.CORE]);

export default RACAS;

/**
 * @deprecated Use dataRegistry.getRaceByName(name, supplementIds)
 */
export function getRaceByName(name: string): Race {
  const race = dataRegistry.getRaceByName(name, [SupplementId.CORE]);

  if (race) {
    return race;
  }

  // Fallback para primeira raça
  const defaultRace = _.cloneDeep(RACAS[0]);
  if (defaultRace?.setup) {
    return defaultRace.setup(defaultRace, RACAS);
  }
  return defaultRace;
}
