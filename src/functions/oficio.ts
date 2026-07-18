import Skill, {
  ALL_SPECIFIC_OFICIOS,
  OFICIO_PREFIX,
} from '../interfaces/Skills';
import { normalizeSearch } from './stringUtils';

/**
 * Limite do miolo do rótulo (o que vai entre parênteses). O nome entra numa
 * coluna estreita do SkillTable e numa linha de largura fixa do PDF.
 */
export const MAX_OFICIO_LABEL_LENGTH = 30;

/**
 * Parênteses ficam de fora de propósito: o PDF extrai o miolo do Ofício com
 * `match(/Ofício\s*(.*)/)` e depois remove os parênteses, então um parêntese no
 * texto do usuário quebraria a extração.
 */
const ALLOWED_LABEL = /^[\p{L}\p{N} '-]+$/u;

export type OficioValidation =
  | { ok: true; value: Skill }
  | { ok: false; error: string };

/**
 * Monta um Ofício customizado a partir do texto digitado pelo usuário.
 *
 * Este é o ÚNICO ponto do código que cria um `Skill` fora do enum — o cast está
 * concentrado aqui de propósito. Ver o comentário do enum em interfaces/Skills.ts.
 *
 * @param raw texto digitado; aceita tanto `Ferreiro` quanto `Ofício (Ferreiro)`
 * @param existing Ofícios já escolhidos, para rejeitar duplicata
 */
export function buildCustomOficio(
  raw: string,
  existing: string[] = []
): OficioValidation {
  // Colapsa espaços internos e das pontas
  const collapsed = raw.trim().replace(/\s+/g, ' ');

  // Idempotência: se veio no formato completo (colar/reeditar), extrai o miolo
  const unwrapped = collapsed
    .replace(/^Ofício\s*\((.*)\)$/iu, '$1')
    .replace(/^Ofício\s+/iu, '')
    .trim();

  if (!unwrapped) {
    return { ok: false, error: 'Digite o nome do ofício.' };
  }

  if (unwrapped.length > MAX_OFICIO_LABEL_LENGTH) {
    return {
      ok: false,
      error: `Use no máximo ${MAX_OFICIO_LABEL_LENGTH} caracteres.`,
    };
  }

  if (!ALLOWED_LABEL.test(unwrapped)) {
    return {
      ok: false,
      error: 'Use apenas letras, números, espaços, hífens e apóstrofos.',
    };
  }

  // Só a primeira letra: não reescrevemos o texto do usuário além do necessário
  const label =
    unwrapped.charAt(0).toLocaleUpperCase('pt-BR') + unwrapped.slice(1);
  const value = `${OFICIO_PREFIX} (${label})`;

  const taken = [Skill.OFICIO, ...ALL_SPECIFIC_OFICIOS, ...existing].map(
    normalizeSearch
  );
  if (taken.includes(normalizeSearch(value))) {
    return { ok: false, error: 'Esse ofício já está na lista.' };
  }

  return { ok: true, value: value as unknown as Skill };
}
