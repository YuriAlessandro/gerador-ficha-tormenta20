/**
 * Rastreio das fontes de conteúdo registradas em runtime que uma ficha utiliza.
 *
 * Primitivo neutro: o registry permite registrar suplementos em runtime
 * (`registerRuntimeSupplement`). Aqui detectamos quais desses a ficha usa (pela
 * raça — e, futuramente, classe/origem/divindade) e carimbamos em
 * `sheet.usedSupplements`, de modo que a aplicação possa bloquear desativação
 * ou carregamento quando um suplemento runtime deixa de estar disponível.
 */
import CharacterSheet from '../interfaces/CharacterSheet';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';

/**
 * Ids de suplementos runtime ATIVOS que fornecem o conteúdo desta ficha
 * (atualmente: a raça). Só considera o que está registrado agora.
 */
export function computeUsedRuntimeSupplements(sheet: CharacterSheet): string[] {
  const runtimeIds = dataRegistry.getRuntimeSupplementIds();
  if (runtimeIds.length === 0) return [];

  const used = new Set<string>();

  // `*WithSupplementInfo` não força CORE — passar só os ids runtime retorna
  // exatamente o conteúdo deles, com `supplementId`.
  const raceName = sheet.raca?.name;
  if (raceName) {
    const match = dataRegistry
      // Cast de fronteira: ids runtime são strings dinâmicas (ver registry).
      .getRacesWithSupplementInfo(runtimeIds as SupplementId[])
      .find((r) => r.name === raceName);
    if (match) used.add(match.supplementId as unknown as string);
  }

  return Array.from(used);
}

/**
 * Atualiza `sheet.usedSupplements` (in place):
 *  - recalcula as fontes runtime ATIVAS que a ficha usa;
 *  - PRESERVA entradas de runtime atualmente inativos (não verificáveis), para
 *    não perder a informação de que a ficha depende delas.
 */
export function stampUsedSupplements(sheet: CharacterSheet): void {
  const activeRuntime = new Set(dataRegistry.getRuntimeSupplementIds());
  const detected = computeUsedRuntimeSupplements(sheet);
  const preservedInactive = (sheet.usedSupplements || []).filter(
    (id) => !activeRuntime.has(id)
  );
  const next = Array.from(new Set([...detected, ...preservedInactive]));
  sheet.usedSupplements = next.length > 0 ? next : undefined;
}

/**
 * Ids de suplementos runtime que a ficha precisa mas que NÃO estão registrados
 * agora (ex.: homebrew desativado). Vazio = a ficha pode ser usada.
 */
export function getMissingRuntimeSupplements(sheet: CharacterSheet): string[] {
  const used = sheet.usedSupplements || [];
  if (used.length === 0) return [];
  const active = new Set(dataRegistry.getRuntimeSupplementIds());
  return used.filter((id) => !active.has(id));
}
