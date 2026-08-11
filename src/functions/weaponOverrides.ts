import Equipment, { WeaponOverride } from '../interfaces/Equipment';
import CharacterSheet from '../interfaces/CharacterSheet';

/**
 * Overrides do jogador sobre armas VIRTUAIS — as que a ficha materializa em
 * memória e nunca guarda na mochila (hoje, as armas naturais da Forma Selvagem
 * do Druida). Como elas são recriadas a cada render, não existe objeto onde
 * gravar a edição: o dado vive num mapa na própria ficha
 * (`CharacterSheet.weaponOverrides`), endereçado pela `overrideKey` que a arma
 * virtual carrega.
 *
 * A chave é derivada do CATÁLOGO (ex.: `wildshape:feroz:basica:0`), nunca do id
 * da instância — assim a escolha sobrevive a reverter e voltar à forma, que é
 * exatamente o que se espera dela.
 */

/** Primeira chave que tiver override. Permite chaves de fallback (curinga). */
export function resolveWeaponOverride(
  overrides: Record<string, WeaponOverride> | undefined,
  ...keys: string[]
): WeaponOverride | undefined {
  if (!overrides) return undefined;
  return keys.map((key) => overrides[key]).find((entry) => entry !== undefined);
}

/** Aplica o override sobre a arma. Só sobrescreve o que o override define. */
export function mergeWeaponOverride(
  weapon: Equipment,
  override?: WeaponOverride
): Equipment {
  if (!override) return weapon;
  const merged: Equipment = { ...weapon };
  if (override.customSkill !== undefined)
    merged.customSkill = override.customSkill;
  if (override.attackAttribute !== undefined)
    merged.attackAttribute = override.attackAttribute;
  if (override.damageAttribute !== undefined)
    merged.damageAttribute = override.damageAttribute;
  return merged;
}

/** True quando o override não define nada — não vale a pena persistir. */
function isEmptyOverride(override: WeaponOverride): boolean {
  return (
    override.customSkill === undefined &&
    override.attackAttribute === undefined &&
    override.damageAttribute === undefined
  );
}

/**
 * Grava (ou limpa) um override na ficha. Puro: devolve uma nova ficha. Remove a
 * entrada quando ela fica vazia, e o mapa inteiro quando não sobra entrada —
 * uma ficha sem edição nenhuma não carrega o campo para a nuvem.
 */
export function setWeaponOverride(
  sheet: CharacterSheet,
  key: string,
  next: WeaponOverride
): CharacterSheet {
  const current = { ...(sheet.weaponOverrides ?? {}) };

  if (isEmptyOverride(next)) delete current[key];
  else current[key] = next;

  if (Object.keys(current).length === 0) {
    const cleared: CharacterSheet = { ...sheet };
    delete cleared.weaponOverrides;
    return cleared;
  }
  return { ...sheet, weaponOverrides: current };
}
