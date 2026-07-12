import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment, {
  DefenseEquipment,
  WeaponCategory,
} from '../interfaces/Equipment';
import EQUIPAMENTOS, {
  isHeavyArmor,
} from '../data/systems/tormenta20/equipamentos';
import PROFICIENCIAS from '../data/systems/tormenta20/proficiencias';

export const WEAPON_NON_PROFICIENCY_PENALTY = -5;

export const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  simple: 'Armas Simples',
  martial: 'Armas Marciais',
  exotic: 'Armas Exóticas',
  firearm: 'Armas de Fogo',
};

/**
 * Lista efetiva de proficiências da ficha: proficiências da classe (que também
 * acumulam as concedidas por poderes/raças via addProficiency/SheetBonus) mais
 * as adicionadas manualmente, menos as removidas manualmente pelo usuário.
 */
export function getSheetProficiencias(sheet: CharacterSheet): string[] {
  const removed = sheet.removedProficiencias ?? [];
  const base = (sheet.classe?.proficiencias ?? []).filter(
    (p) => !removed.includes(p)
  );
  const custom = (sheet.customProficiencias ?? []).filter(
    (p) => !base.includes(p)
  );
  return [...base, ...custom];
}

// Lookup nome→categoria construído dos arrays de EQUIPAMENTOS. Cobre cópias de
// armas core embutidas em fichas antigas, que não carregam `weaponCategory`.
const CORE_WEAPON_CATEGORY_BY_NAME = new Map<string, WeaponCategory>();
(
  [
    [EQUIPAMENTOS.armasSimples, 'simple'],
    [EQUIPAMENTOS.armasMarciais, 'martial'],
    [EQUIPAMENTOS.armasExoticas, 'exotic'],
    [EQUIPAMENTOS.armasDeFogo, 'firearm'],
  ] as [Equipment[], WeaponCategory][]
).forEach(([weapons, category]) => {
  weapons.forEach((weapon) => {
    CORE_WEAPON_CATEGORY_BY_NAME.set(weapon.nome, category);
  });
});

/**
 * Categoria de proficiência da arma. Usa `weaponCategory` quando presente
 * (armas do catálogo atual e de suplementos) com fallback por nome para cópias
 * legadas embutidas em fichas salvas. Armas custom/desconhecidas retornam
 * undefined (tratadas como proficientes — falha segura).
 */
export function getEffectiveWeaponCategory(
  weapon: Equipment
): WeaponCategory | undefined {
  return weapon.weaponCategory ?? CORE_WEAPON_CATEGORY_BY_NAME.get(weapon.nome);
}

/**
 * Verifica se uma lista de proficiências cobre a arma.
 *
 * - Armas simples: todos os personagens sabem usar (nunca penaliza).
 * - Marciais: exigem 'Armas Marciais'; se a arma tem alcance (incluindo
 *   arremesso), 'Armas Marciais de Distância' também satisfaz. A proficiência
 *   é da arma, não do modo de ataque — vale igualmente em Luta e Pontaria.
 * - Exóticas: exigem 'Armas Exóticas'. De fogo: exigem 'Armas de Fogo'.
 * - Sem categoria resolvível (custom/homebrew): proficiente (falha segura).
 *
 * Use `getSheetProficiencias(sheet)` para obter a lista efetiva da ficha.
 */
export function isProficientWithWeapon(
  weapon: Equipment,
  proficiencias: string[]
): boolean {
  const category = getEffectiveWeaponCategory(weapon);
  if (!category || category === 'simple') return true;

  if (category === 'martial') {
    if (proficiencias.includes(PROFICIENCIAS.MARCIAIS)) return true;
    const hasRange = Boolean(weapon.alcance && weapon.alcance !== '-');
    return hasRange && proficiencias.includes(PROFICIENCIAS.MARCIAIS_DISTANCIA);
  }
  if (category === 'exotic')
    return proficiencias.includes(PROFICIENCIAS.EXOTICAS);
  return proficiencias.includes(PROFICIENCIAS.FOGO);
}

/** Penalidade de não proficiência da arma: 0 ou -5 nos testes de ataque. */
export function getWeaponNonProficiencyPenalty(
  weapon: Equipment,
  proficiencias: string[]
): number {
  return isProficientWithWeapon(weapon, proficiencias)
    ? 0
    : WEAPON_NON_PROFICIENCY_PENALTY;
}

/**
 * Verifica se uma lista de proficiências cobre a armadura ou escudo.
 * Pesada exige 'Armaduras Pesadas'; leve exige 'Armaduras Leves'; escudo
 * exige 'Escudos'. Checagem literal por categoria (remoções manuais valem).
 */
export function isProficientWithDefense(
  item: DefenseEquipment,
  proficiencias: string[]
): boolean {
  if (item.group === 'Escudo')
    return proficiencias.includes(PROFICIENCIAS.ESCUDOS);
  return isHeavyArmor(item)
    ? proficiencias.includes(PROFICIENCIAS.PESADAS)
    : proficiencias.includes(PROFICIENCIAS.LEVES);
}

/**
 * Soma de `armorPenalty` dos itens de defesa ATIVOS (armadura vestida +
 * escudo(s) empunhado(s)) com os quais o personagem NÃO é proficiente. Em
 * Tormenta 20, essa parcela se aplica a TODAS as perícias baseadas em Força e
 * Destreza (não só às perícias com penalidade de armadura padrão).
 *
 * Replica a resolução de "ativo" de Bag.getActiveArmorPenalty (incluindo o
 * fallback legado de armadura única sem `wornArmorId`), mas lê `equipments`
 * como dado puro — funciona mesmo quando o Bag perdeu os métodos de classe
 * (pós-cloneDeep/serialização).
 */
export function getNonProficientArmorPenalty(sheet: CharacterSheet): number {
  const equipments = sheet.bag?.equipments;
  if (!equipments) return 0;

  const proficiencias = getSheetProficiencias(sheet);
  const armors = Array.isArray(equipments.Armadura) ? equipments.Armadura : [];
  const shields = Array.isArray(equipments.Escudo) ? equipments.Escudo : [];

  let activeArmor: DefenseEquipment | undefined;
  if (sheet.wornArmorId !== undefined) {
    activeArmor = armors.find((a) => a.id === sheet.wornArmorId);
  } else if (armors.length === 1) {
    // Compat legada: armadura única sem seleção explícita conta como vestida.
    [activeArmor] = armors;
  }

  let penalty = 0;
  if (activeArmor && !isProficientWithDefense(activeArmor, proficiencias)) {
    penalty += activeArmor.armorPenalty;
  }

  shields.forEach((shield) => {
    const inHand =
      shield.id !== undefined &&
      (shield.id === sheet.mainHandItemId || shield.id === sheet.offHandItemId);
    if (inHand && !isProficientWithDefense(shield, proficiencias)) {
      penalty += shield.armorPenalty;
    }
  });

  return penalty;
}
