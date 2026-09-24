import { useMemo } from 'react';
import { dataRegistry } from '../data/registry';
import { Sincretismo } from '../interfaces/Sincretismo';
import { useContentSupplements } from './useContentSupplements';

/**
 * Devoção Dupla é a regra opcional de Sincretismos de Arton, então o gate é
 * simplesmente "algum suplemento ativo traz sincretismos".
 *
 * Derivar do CONTEÚDO — e não de um id de suplemento hardcoded — é o que
 * mantém o repo público sem saber que `nimb:sincretismos` existe: qualquer
 * suplemento (nativo, oficial ou homebrew futuro) que declare `sincretismos`
 * liga a regra.
 *
 * Como `useOptionalRulesAvailable`, isto responde "a regra está DISPONÍVEL
 * para escolher agora?". Uma ficha que já é de devoto duplo precisa continuar
 * exibindo e podendo remover a segunda divindade mesmo se o suplemento for
 * desativado, então quem renderiza edição deve testar
 * `!!sheet.devoto?.divindadeSecundaria || available`.
 */
export function useSincretismos(): Sincretismo[] {
  const supplements = useContentSupplements();
  return useMemo(
    () => dataRegistry.getSincretismosBySupplements(supplements),
    [supplements]
  );
}

export function useDualDevotionAvailable(): boolean {
  return useSincretismos().length > 0;
}

export default useDualDevotionAvailable;
