import { DamageType, DAMAGE_TYPES } from '../../../interfaces/Equipment';

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalize = (s: string) =>
  stripAccents(s.trim().toLowerCase()).replace(/\.$/, '');

const DAMAGE_TYPE_BY_NORMALIZED: Record<string, DamageType> =
  DAMAGE_TYPES.reduce((acc, t) => {
    acc[normalize(t)] = t;
    return acc;
  }, {} as Record<string, DamageType>);

// Abreviações usadas no catálogo (ver `abbreviateDamageType` em
// `functions/equipmentDisplay.ts` e o grep por `tipo:` em `/data`), para o
// parser reconhecer o `tipo` de itens antigos ao abrir o editor pela primeira
// vez. Cobre as formas literalmente encontradas no catálogo hoje ('Cort.',
// 'Impac.', 'Perf.', 'Perf./Imp.') — mantidas explícitas em vez de um
// prefix-match genérico, que arriscaria colisão (ex.: 'Es.' entre Essência e
// Escudo não é um risco real aqui, mas abreviações de 1-2 letras seriam).
const LEGACY_ALIASES: Record<string, DamageType> = {
  cort: 'Corte',
  perf: 'Perfuração',
  imp: 'Impacto',
  impac: 'Impacto',
  eletr: 'Eletricidade',
};

/**
 * Converte o `tipo` (string livre, historicamente com combinações como
 * "Corte ou Perfuração" / "Corte/Perfuração") nos `DamageType` reconhecidos
 * pelo seletor. Tokens que não batem com nenhum tipo conhecido são ignorados —
 * o jogador reseleciona manualmente na primeira edição de um item legado.
 */
export function parseDamageTypes(tipo?: string): DamageType[] {
  if (!tipo || tipo === '-') return [];
  const tokens = tipo.split(/\s+ou\s+|\s+e\s+|\/|,/i);
  const result: DamageType[] = [];
  tokens.forEach((token) => {
    const key = normalize(token);
    const match = DAMAGE_TYPE_BY_NORMALIZED[key] || LEGACY_ALIASES[key];
    if (match && !result.includes(match)) result.push(match);
  });
  return result;
}

/** Junta os tipos selecionados de volta pro formato de `tipo` ("Corte ou Perfuração"). */
export function formatDamageTypes(types: DamageType[]): string | undefined {
  return types.length > 0 ? types.join(' ou ') : undefined;
}
