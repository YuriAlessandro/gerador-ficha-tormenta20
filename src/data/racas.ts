/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getRacesBySupplements()
 */
import _ from 'lodash';
import CORE_RACES from './systems/tormenta20/core/races';
import Race from '../interfaces/Race';

/**
 * @deprecated Use CORE_RACES diretamente ou dataRegistry.getRacesBySupplements()
 */
const RACAS = CORE_RACES;

export default RACAS;

/**
 * @deprecated Use dataRegistry.getRaceByName() ou busque diretamente em CORE_RACES
 */
export function getRaceByName(name: string): Race {
  const race = CORE_RACES.find((r) => r.name === name);

  if (race) {
    const clonedRace = _.cloneDeep(race);
    if (clonedRace?.setup) {
      return clonedRace.setup(clonedRace, CORE_RACES);
    }
    return clonedRace;
  }

  // Fallback para primeira raça
  const defaultRace = _.cloneDeep(RACAS[0]);
  if (defaultRace?.setup) {
    return defaultRace.setup(defaultRace, RACAS);
  }
  return defaultRace;
}
