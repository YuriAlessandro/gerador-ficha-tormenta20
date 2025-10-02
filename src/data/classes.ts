/**
 * DEPRECATED: Este arquivo mantém compatibilidade com código existente
 * Para novo código, use dataRegistry.getClassesBySupplements()
 */
import { SupplementId } from '../types/supplement.types';
import { dataRegistry } from './registry';

/**
 * @deprecated Use dataRegistry.getClassesBySupplements([SupplementId.CORE])
 */
const CLASSES = dataRegistry.getClassesBySupplements([SupplementId.CORE]);

export default CLASSES;
