import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment, {
  DefenseEquipment,
  WeaponCategory,
} from '../interfaces/Equipment';
import EQUIPAMENTOS, {
  isHeavyArmor,
} from '../data/systems/tormenta20/equipamentos';
import { AMEACAS_ARTON_WEAPONS } from '../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import { HEROIS_ARTON_WEAPONS } from '../data/systems/tormenta20/herois-de-arton/equipment/weapons';
import PROFICIENCIAS from '../data/systems/tormenta20/proficiencias';

export const WEAPON_NON_PROFICIENCY_PENALTY = -5;

export const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  simple: 'Armas Simples',
  martial: 'Armas Marciais',
  exotic: 'Armas Exóticas',
  firearm: 'Armas de Fogo',
};

/** Versão curta de `WEAPON_CATEGORY_LABELS`, para colunas e chips densos. */
export const WEAPON_CATEGORY_SHORT_LABELS: Record<WeaponCategory, string> = {
  simple: 'Simples',
  martial: 'Marcial',
  exotic: 'Exótica',
  firearm: 'Fogo',
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

/**
 * Proficiências concedidas por `addProficiency` sheetActions, lidas do
 * `sheetActionHistory`.
 *
 * O histórico é a única fonte que sobrevive ao ciclo strip/rehydrate de
 * armazenamento: fichas gravadas antes do fix tiveram `classe.proficiencias`
 * zerado, e o guard de idempotência de `applyPower` (baseado justamente neste
 * histórico) impede que o `addProficiency` seja reaplicado. Reconstruir a
 * partir daqui é o que cura essas fichas — ver `rehydrateSheet`.
 */
export function getGrantedProficienciasFromHistory(
  sheet: CharacterSheet
): string[] {
  const granted = new Set<string>();
  (sheet.sheetActionHistory ?? []).forEach((entry) => {
    entry.changes?.forEach((change) => {
      if (change.type === 'ProficiencyAdded') granted.add(change.proficiency);
    });
  });
  return [...granted];
}

// Lookup nome→categoria construído dos catálogos (core + suplementos). Cobre
// cópias de armas embutidas em fichas antigas, que não carregam
// `weaponCategory`, e resolve a categoria "de catálogo" de uma arma quando o
// usuário limpa um override no editor de item.
const WEAPON_CATEGORY_BY_NAME = new Map<string, WeaponCategory>();
(
  [
    [EQUIPAMENTOS.armasSimples, 'simple'],
    [EQUIPAMENTOS.armasMarciais, 'martial'],
    [EQUIPAMENTOS.armasExoticas, 'exotic'],
    [EQUIPAMENTOS.armasDeFogo, 'firearm'],
  ] as [Equipment[], WeaponCategory][]
).forEach(([weapons, category]) => {
  weapons.forEach((weapon) => {
    WEAPON_CATEGORY_BY_NAME.set(weapon.nome, category);
  });
});
[AMEACAS_ARTON_WEAPONS, HEROIS_ARTON_WEAPONS].forEach((catalog) => {
  Object.values(catalog).forEach((weapon) => {
    if (weapon.weaponCategory) {
      WEAPON_CATEGORY_BY_NAME.set(weapon.nome, weapon.weaponCategory);
    }
  });
});

/** Categoria de catálogo de uma arma pelo nome (core + suplementos). */
export function getCatalogWeaponCategoryByName(
  nome: string
): WeaponCategory | undefined {
  return WEAPON_CATEGORY_BY_NAME.get(nome);
}

/**
 * Categoria de proficiência da arma. Usa `weaponCategory` quando presente
 * (armas do catálogo atual e de suplementos) com fallback por nome para cópias
 * legadas embutidas em fichas salvas. Armas custom/desconhecidas retornam
 * undefined (tratadas como proficientes — falha segura).
 */
export function getEffectiveWeaponCategory(
  weapon: Equipment
): WeaponCategory | undefined {
  return weapon.weaponCategory ?? WEAPON_CATEGORY_BY_NAME.get(weapon.nome);
}

// Normaliza para comparação de proficiências nomeadas: sem acentos, sem
// espaços nas pontas e caixa baixa ('Arpao' casa 'Arpão').
const normalizeProficiencyName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Verifica se uma lista de proficiências cobre a arma.
 *
 * - Proficiência nomeada: uma entrada igual ao NOME da arma (ex.: 'Tridente',
 *   concedida por poderes como Mestre do Tridente / Arsenal Oceano ou digitada
 *   pelo usuário no editor de proficiências) cobre aquela arma específica.
 *   Compara só `weapon.nome` (nunca `customDisplayName`), sem acentos/caixa.
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
  const weaponName = normalizeProficiencyName(weapon.nome);
  if (proficiencias.some((p) => normalizeProficiencyName(p) === weaponName)) {
    return true;
  }

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
