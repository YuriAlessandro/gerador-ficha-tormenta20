import Equipment, { WeaponCategory } from '../interfaces/Equipment';
import { StatModifier } from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { getEffectiveWeaponCategory } from './proficiencies';
import { isFiringWeapon, isLightOrAgileMeleeWeapon } from './weaponTraits';

/**
 * Filtros de escopo de um bônus de arma (subconjunto dos alvos WeaponDamage /
 * WeaponAttack / WeaponThreatMargin / WeaponCriticalMultiplier). `proficiencyRequired`
 * fica de fora do matching estático porque depende da ficha (ver `weaponMatchesBonus`
 * em recalculateSheet.ts, que soma essa checagem).
 */
export interface WeaponBonusScope {
  weaponName?: string;
  weaponTags?: string[];
  meleeOnly?: boolean;
  rangedOnly?: boolean;
  thrownOnly?: boolean;
  firingOnly?: boolean;
  lightOrAgileOnly?: boolean;
  twoHandedOnly?: boolean;
  weaponCategories?: WeaponCategory[];
}

/**
 * Matching ESTÁTICO arma × escopo (independe da ficha). Fonte única do casamento
 * de filtros — `weaponMatchesBonus` (recalculateSheet.ts) e `Weapon.tsx` delegam
 * aqui para não divergir. Não avalia `proficiencyRequired` (precisa da ficha).
 */
export function weaponMatchesScope(
  weapon: Equipment,
  scope: WeaponBonusScope
): boolean {
  // Arma específica por nome.
  if (scope.weaponName && weapon.nome !== scope.weaponName) {
    return false;
  }

  // Escopo por categoria de proficiência (simples/marcial/exótica/de fogo).
  // Resolve via getEffectiveWeaponCategory para cobrir cópias legadas de armas
  // core embutidas em fichas salvas (sem o campo `weaponCategory`).
  if (scope.weaponCategories && scope.weaponCategories.length > 0) {
    const category = getEffectiveWeaponCategory(weapon);
    if (!category || !scope.weaponCategories.includes(category)) {
      return false;
    }
  }

  // Apenas armas de arremesso (têm `arremesso: true`).
  if (scope.thrownOnly && !weapon.arremesso) {
    return false;
  }

  // Apenas armas corpo a corpo: exclui armas à distância (têm `alcance` real e
  // não são de arremesso — arcos, bestas, armas de fogo). Armas de arremesso
  // (adaga, azagaia) continuam valendo por serem usáveis corpo a corpo.
  if (scope.meleeOnly) {
    const { alcance } = weapon;
    const isRanged = !!alcance && alcance !== '-' && !weapon.arremesso;
    if (isRanged) {
      return false;
    }
  }

  // Apenas armas à distância: exclui corpo a corpo puro. Armas de arremesso
  // contam como à distância para este filtro (podem ser arremessadas).
  if (scope.rangedOnly) {
    const { alcance } = weapon;
    const isRangedWeapon = !!alcance && alcance !== '-';
    if (!isRangedWeapon) {
      return false;
    }
  }

  // Apenas armas de disparo (arcos, bestas, fogo, funda) — à distância e NÃO
  // arremesso.
  if (scope.firingOnly && !isFiringWeapon(weapon)) {
    return false;
  }

  // Apenas armas corpo a corpo leves ou ágeis.
  if (scope.lightOrAgileOnly && !isLightOrAgileMeleeWeapon(weapon)) {
    return false;
  }

  // Apenas armas empunhadas com as duas mãos (armas leves nunca são twoHanded).
  if (scope.twoHandedOnly && !weapon.twoHanded) {
    return false;
  }

  // Tags da arma (armaDeMar, alongada, heredrimm...).
  if (scope.weaponTags && scope.weaponTags.length > 0) {
    const weaponTags = weapon.weaponTags || [];
    const hasMatchingTag = scope.weaponTags.some((tag) =>
      weaponTags.includes(tag)
    );
    if (!hasMatchingTag) {
      return false;
    }
  }

  return true;
}

/**
 * O bônus deve ser aplicado POR MODO de ataque (em Weapon.tsx) em vez de bakeado
 * na string `dano`/`atkBonus` da arma inteira?
 *
 * - Bônus `thrownOnly` sempre (só valem no modo de arremesso).
 * - Bônus `meleeOnly`/`rangedOnly` numa arma HÍBRIDA de arremesso (adaga,
 *   machadinha, azagaia, lança...): ela tem modo corpo a corpo E modo arremesso;
 *   bakear vazaria para o outro modo. Armas puras (só corpo a corpo, ou só
 *   disparo) têm um único modo relevante → podem ser bakeadas normalmente.
 */
export function isModeScopedForWeapon(
  weapon: Equipment,
  scope: WeaponBonusScope
): boolean {
  if (scope.thrownOnly) return true;
  if (weapon.arremesso && (scope.meleeOnly || scope.rangedOnly)) return true;
  return false;
}

/**
 * Avaliador leve de modificador para o cálculo por modo em Weapon.tsx, onde não
 * há acesso à resolução completa de fonte/nível de classe do recalculateSheet.
 * Suporta `Fixed`, `Attribute` e `CappedAttribute` (os tipos usados pelos bônus
 * de arma por modo). `capBy: 'classLevel'` recai no nível total (`nivel`) — os
 * poderes que usam esse avaliador cap por nível total, então não há perda.
 * Outros tipos retornam 0 (são bakeados no servidor pelo recalculateSheet).
 */
export function evaluateSimpleModifier(
  modifier: StatModifier,
  atributos: CharacterAttributes,
  nivel: number
): number {
  if (modifier.type === 'Fixed') {
    return modifier.value || 0;
  }
  if (modifier.type === 'Attribute') {
    return atributos[modifier.attribute as Atributo]?.value ?? 0;
  }
  if (modifier.type === 'CappedAttribute') {
    const attrValue = atributos[modifier.attribute as Atributo]?.value ?? 0;
    return Math.max(0, Math.min(attrValue, nivel));
  }
  return 0;
}
