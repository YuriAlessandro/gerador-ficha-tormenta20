import { SupplementId } from '../types/supplement.types';
import { useContentSupplements } from './useContentSupplements';
import { useFeatureAccess } from './useFeatureAccess';

/**
 * As regras opcionais de Heróis de Arton (Atributos Variados, Raças Abertas,
 * Devoções Abertas e Idades Variadas) exigem DOIS gates independentes:
 *
 * 1. o suplemento Heróis de Arton ativo na conta;
 * 2. a feature flag `optionalRules` (kill-switch + trava de apoiador).
 *
 * Mesmo predicado que `needsComplicationSelection` monta inline no assistente —
 * aqui centralizado porque agora são quatro regras consumindo-o.
 *
 * IMPORTANTE: este hook responde "a regra está DISPONÍVEL para escolher agora?".
 * Fichas que já usam uma regra opcional precisam continuar exibindo e podendo
 * removê-la mesmo sem acesso, então quem renderiza edição deve sempre testar
 * `!!sheet.<campo> || available` (padrão do `ComplicationEditDrawer`).
 */
export function useOptionalRulesAvailable(): boolean {
  const { hasAccess } = useFeatureAccess('optionalRules');
  const supplements = useContentSupplements();

  return (
    hasAccess && supplements.includes(SupplementId.TORMENTA20_HEROIS_ARTON)
  );
}

export default useOptionalRulesAvailable;
