import Equipment from '../interfaces/Equipment';
import { SheetBonus } from '../interfaces/CharacterSheet';
import { describeBonusTarget } from './sheetBonuses/bonusTargetLabel';

/**
 * Helpers de apresentação de equipamento, compartilhados entre a ficha, o
 * mercado do wizard e a mochila. Ficam aqui (e não dentro de um componente)
 * para que as três telas mostrem o mesmo item exatamente da mesma forma.
 */

/**
 * Nome exibido de um item: o apelido dado pelo usuário quando existe, senão o
 * nome de catálogo.
 *
 * Ponto único de propósito — a expressão estava repetida em mais de uma dezena
 * de telas e o gerador de PDF simplesmente não a tinha, então item renomeado
 * saía exportado com o nome do livro.
 */
export const getItemDisplayName = (item: Equipment): string =>
  item.customDisplayName || item.nome;

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

/**
 * Rótulos curtos dos bônus mecânicos que um item concede — para exibir ao lado
 * dos stats na mochila e no mercado.
 *
 * Só cobre `sheetBonuses` de valor FIXO: os demais modificadores (`LevelCalc`,
 * `CappedAttribute`…) dependem da ficha e não cabem num chip de catálogo.
 * `conditionalBonuses` também fica de fora — a condição deles (`isClass`,
 * `hasClassAbility`) só faz sentido com a ficha em mãos.
 *
 * Bônus com `condition` ganham o prefixo "(cond.)": o número existe, mas não
 * vale sempre — é o caso da Armadura sensual, que só conta enquanto vestida.
 *
 * Valores diferentes para o mesmo alvo são agrupados com "/" em vez de virarem
 * dois chips: a Armadura sensual cadastra dois conjuntos MUTUAMENTE EXCLUSIVOS
 * (+2 sem o poder Atraente, +5 com), e mostrá-los lado a lado sugeriria soma.
 */
export const describeItemBonuses = (item: Equipment): string[] => {
  const groups = new Map<
    string,
    { prefix: string; label: string; values: number[] }
  >();

  (item.sheetBonuses ?? []).forEach((bonus: SheetBonus) => {
    if (bonus.modifier.type !== 'Fixed') return;

    const { label, numeric } = describeBonusTarget(bonus.target);
    if (!numeric) return;

    const prefix = bonus.condition ? '(cond.) ' : '';
    const key = `${prefix}${label}`;
    const group = groups.get(key) ?? { prefix, label, values: [] };
    if (!group.values.includes(bonus.modifier.value)) {
      group.values.push(bonus.modifier.value);
    }
    groups.set(key, group);
  });

  return [...groups.values()].map(({ prefix, label, values }) => {
    const numbers = values
      .slice()
      .sort((a, b) => a - b)
      .map((value) => (value >= 0 ? `+${value}` : `${value}`))
      .join('/');
    return `${prefix}${numbers} ${label}`;
  });
};
