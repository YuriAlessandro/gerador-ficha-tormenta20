import { SupplementId } from '../types/supplement.types';
import { useContentSupplements } from './useContentSupplements';

/**
 * Fundamentalista é conteúdo base de Deuses de Arton: o gate é só o
 * suplemento ativo — sem feature flag nem trava de apoiador.
 *
 * Como `useDualDevotionAvailable`, responde "posso ESCOLHER agora?". Ficha que
 * já é fundamentalista continua mostrando o controle mesmo sem o suplemento:
 * quem renderiza edição testa `!!sheet.devoto?.fundamentalista || available`.
 */
export function useFundamentalistAvailable(): boolean {
  return useContentSupplements().includes(SupplementId.TORMENTA20_DEUSES_ARTON);
}

export default useFundamentalistAvailable;
