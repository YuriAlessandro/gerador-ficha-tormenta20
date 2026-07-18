import Equipment from '../interfaces/Equipment';

/**
 * Helpers de apresentação de equipamento, compartilhados entre a ficha, o
 * mercado do wizard e a mochila. Ficam aqui (e não dentro de um componente)
 * para que as três telas mostrem o mesmo item exatamente da mesma forma.
 */

/** Preço em tibares. Itens sem preço (ou de preço 0) são "Grátis". */
export const formatPrice = (price?: number): string =>
  !price ? 'Grátis' : `T$ ${price}`;

const DAMAGE_TYPE_ABBREVIATIONS: Record<string, string> = {
  Perfuração: 'Perf.',
  Corte: 'Corte',
  Impacto: 'Impacto',
  Contusão: 'Contusão',
  Fogo: 'Fogo',
  Frio: 'Frio',
  Eletricidade: 'Eletr.',
  Ácido: 'Ácido',
  Essência: 'Essência',
  'Energia negativa': 'Negativa',
  'Energia positiva': 'Positiva',
  Psíquico: 'Psíquico',
  Trovão: 'Trovão',
  Luz: 'Luz',
  Trevas: 'Trevas',
};

/** Tipo de dano encurtado para caber em colunas densas. */
export const abbreviateDamageType = (tipo?: string): string | undefined => {
  if (!tipo || tipo === '-') return undefined;
  return DAMAGE_TYPE_ABBREVIATIONS[tipo] || tipo;
};

/** Espaços ocupados na mochila, já com a unidade. */
export const formatSpaces = (spaces?: number): string | undefined =>
  spaces === undefined ? undefined : `${spaces} esp.`;

// Conectores ficam em minúscula na sigla: 'Ameaças de Arton' -> 'AdA'.
const SUPPLEMENT_MINOR_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/**
 * Sigla do suplemento, para caber em listas densas: 'Heróis de Arton' -> 'HdA',
 * 'Ameaças de Arton' -> 'AdA'. O nome completo continua disponível no `title`
 * de quem renderiza a sigla.
 */
export const getSupplementInitials = (name?: string): string | undefined => {
  if (!name) return undefined;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      SUPPLEMENT_MINOR_WORDS.has(word.toLowerCase())
        ? word[0].toLowerCase()
        : word[0].toUpperCase()
    )
    .join('');
  return initials || undefined;
};

/**
 * Alcance da arma. Armas corpo a corpo não têm alcance (`'-'`), mas as que
 * podem ser arremessadas ganham "Arremesso" no lugar do traço.
 */
export const formatReach = (item: Equipment): string | undefined => {
  if (item.alcance && item.alcance !== '-') return item.alcance;
  return item.arremesso ? 'Arremesso' : undefined;
};
