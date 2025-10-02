/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getClassesBySupplements()
 */
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from './registry';

/**
 * @deprecated Use dataRegistry.getClassesBySupplements([SupplementId.TORMENTA20_CORE])
 */
const CLASSES = dataRegistry.getClassesBySupplements([
  SupplementId.TORMENTA20_CORE,
]);

export default CLASSES;
