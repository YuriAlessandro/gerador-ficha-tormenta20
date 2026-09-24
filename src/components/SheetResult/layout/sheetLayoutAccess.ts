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
 * Decide pela FLAG, não pelo apoio de quem olha. O layout é da ficha: o mestre
 * sem apoio, o colega de mesa e o embed do Owlbear veem a ficha como o dono a
 * montou. Apoio é exigido para CRIAR, editar e publicar — e isso quem guarda é
 * o picker/editor na UI e a API no servidor, não a renderização.
 *
 * Não há brecha nisso: um `layout` embutido à mão num JSON importado só muda
 * onde os blocos aparecem, não libera nenhum recurso pago. E ele passa pelo
 * `sanitizeSheetLayout` antes de chegar ao renderer.
 *
 * Flag desligada continua sendo o kill-switch: todo mundo volta ao arranjo
 * histórico, sem tocar no que está salvo nas fichas.
 */
export function resolveSheetLayoutFor(
  isEnabled: boolean,
  candidates: {
    override?: SheetLayout;
    fromSheet?: unknown;
  }
): SheetLayout {
  // O preview do editor manda em qualquer caso: ele só existe para quem já tem
  // acesso, e é a única forma de ver o rascunho antes de salvar.
  if (candidates.override) return candidates.override;
  if (!isEnabled) return DEFAULT_SHEET_LAYOUT;

  if (candidates.fromSheet) return sanitizeSheetLayout(candidates.fromSheet);
  return DEFAULT_SHEET_LAYOUT;
}
