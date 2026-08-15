/**
 * Ponto único de decisão sobre quem pode usar layouts customizados.
 *
 * Fica no repo público (e não no submódulo premium) porque quem consulta é o
 * `Result`, que é público e precisa continuar de pé no build sem o submódulo.
 * Segue o molde de `playerScreenAccess`, incluindo o contrato de dois eixos:
 *
 * - `!isEnabled`               kill-switch global; a UI some sem deixar rastro.
 * - `isEnabled && !hasAccess`  cadeado + CTA para /apoiar — é descoberta, não erro.
 */
import { useFeatureAccess } from '../../../hooks/useFeatureAccess';
import { SheetLayout } from '../../../interfaces/SheetLayout';
import { DEFAULT_SHEET_LAYOUT } from '../../../interfaces/sheetLayoutPresets';
import { sanitizeSheetLayout } from '../../../functions/sheetLayoutValidation';

export interface SheetLayoutAccess {
  isEnabled: boolean;
  hasAccess: boolean;
  /** Mostrar cadeado e chamada para apoiar. */
  needsSupport: boolean;
}

export function useSheetLayoutAccess(): SheetLayoutAccess {
  const { hasAccess, isEnabled } = useFeatureAccess('sheetLayouts');
  return { isEnabled, hasAccess, needsSupport: isEnabled && !hasAccess };
}

/**
 * Qual layout desenha esta ficha.
 *
 * Sem acesso à feature o resultado é SEMPRE o preset histórico, ignorando o que
 * estiver salvo. Isso resolve duas coisas de uma vez: o gating não pode ser
 * burlado por payload (uma ficha importada com layout embutido não libera nada),
 * e um ex-apoiador não fica com a ficha presa num layout que não pode mais
 * editar — ela volta ao arranjo padrão, intacta.
 */
export function resolveSheetLayoutFor(
  hasAccess: boolean,
  candidates: {
    override?: SheetLayout;
    fromSheet?: unknown;
    fromUserDefault?: SheetLayout;
  }
): SheetLayout {
  // O preview do editor manda em qualquer caso: ele só existe para quem já tem
  // acesso, e é a única forma de ver o rascunho antes de salvar.
  if (candidates.override) return candidates.override;
  if (!hasAccess) return DEFAULT_SHEET_LAYOUT;

  if (candidates.fromSheet) return sanitizeSheetLayout(candidates.fromSheet);
  return candidates.fromUserDefault ?? DEFAULT_SHEET_LAYOUT;
}
