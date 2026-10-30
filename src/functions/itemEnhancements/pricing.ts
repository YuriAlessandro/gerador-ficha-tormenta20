import Equipment, { DefenseEquipment } from '../../interfaces/Equipment';
import { ItemE, ItemMod } from '../../interfaces/Rewards';
import {
  armorEnchantments,
  armorsModifications,
  weaponsEnchantments,
  weaponsModifications,
} from '../../data/rewards/items';

/**
 * Preço de item superior/mágico pelas regras do livro.
 *
 * - Melhorias (JdA, Tabela 3-7): o aumento depende do NÚMERO de melhorias —
 *   +T$ 300 / 3.000 / 9.000 / 18.000.
 * - Material especial (JdA, Tabela 3-9; Ameaças de Arton, Tabela 3-4): além
 *   da melhoria `Material especial`, soma o preço extra do material, que varia
 *   com o tipo do item (arma, armadura leve/pesada, escudo, esotérico).
 * - Encantos (JdA, Tabela 8-7): +T$ 18.000 / 36.000 / 72.000.
 *
 * Melhoria/encanto marcado `double` (Pungente, Atroz, Sob medida, Energética,
 * Magnífica, Lancinante, Guardião) "conta como dois" porque embute o
 * pré-requisito. Quando o pré-requisito está aplicado no item, cada um conta
 * 1; quando falta, o duplo conta 2 — assim não se cobra o pré-requisito duas
 * vezes.
 */

export const IMPROVEMENT_PRICES = [0, 300, 3000, 9000, 18000];
export const ENCHANTMENT_PRICES = [0, 18000, 36000, 72000];

export type MaterialItemKind =
  | 'weapon'
  | 'lightArmor'
  | 'heavyArmor'
  | 'shield'
  | 'esoteric';

type MaterialPriceRow = Record<MaterialItemKind, number | null>;

/**
 * Chaves normalizadas por `normalizeName`. `null` = o material não se aplica a
 * esse tipo de item. Materiais fora da tabela são "raros e não encontrados à
 * venda" (Ameaças de Arton) — o preço fica a cargo do mestre.
 */
const MATERIAL_PRICES: Record<string, MaterialPriceRow> = {
  'aco rubi': {
    weapon: 6000,
    lightArmor: 3000,
    heavyArmor: 6000,
    shield: 3000,
    esoteric: 6000,
  },
  adamante: {
    weapon: 3000,
    lightArmor: 6000,
    heavyArmor: 18000,
    shield: 6000,
    esoteric: 3000,
  },
  'gelo eterno': {
    weapon: 600,
    lightArmor: 1500,
    heavyArmor: 3000,
    shield: 1500,
    esoteric: 3000,
  },
  'madeira tollon': {
    weapon: 1500,
    lightArmor: null,
    heavyArmor: null,
    shield: 1500,
    esoteric: 1500,
  },
  'materia vermelha': {
    weapon: 1500,
    lightArmor: 6000,
    heavyArmor: 18000,
    shield: 6000,
    esoteric: 3000,
  },
  mitral: {
    weapon: 1500,
    lightArmor: 1500,
    heavyArmor: 12000,
    shield: 1500,
    esoteric: 3000,
  },
  'casco de monstro': {
    weapon: 750,
    lightArmor: 750,
    heavyArmor: 6000,
    shield: 750,
    esoteric: 6000,
  },
  lanajuste: {
    weapon: 600,
    lightArmor: 1500,
    heavyArmor: 3000,
    shield: 1500,
    esoteric: 3000,
  },
  prata: {
    weapon: 600,
    lightArmor: 1500,
    heavyArmor: 3000,
    shield: 1500,
    esoteric: 400,
  },
};

/** Pré-requisitos dos encantos duplos (o dado `ItemE` não os carrega). */
const ENCHANTMENT_PREREQUISITES: Record<string, string> = {
  energetica: 'formidavel',
  magnifica: 'formidavel',
  lancinante: 'dilacerante',
  guardiao: 'defensor',
};

const MATERIAL_MOD = 'material especial';

export const normalizeName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[*-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const findMod = (name: string): ItemMod | undefined => {
  const key = normalizeName(name);
  return [...weaponsModifications, ...armorsModifications].find(
    (m) => normalizeName(m.mod) === key
  );
};

const findEnchantment = (name: string): ItemE | undefined => {
  const key = normalizeName(name);
  return [...weaponsEnchantments, ...armorEnchantments].find(
    (e) => normalizeName(e.enchantment) === key
  );
};

const prerequisiteNames = (prerequisite?: string | string[]): string[] => {
  if (!prerequisite) return [];
  return (Array.isArray(prerequisite) ? prerequisite : [prerequisite]).map(
    normalizeName
  );
};

/** Quantas melhorias o item tem, contando o pré-requisito embutido do duplo. */
export function countImprovements(item: Equipment): number {
  const applied = (item.modifications ?? []).map((m) => normalizeName(m.mod));
  return applied.reduce((total, name) => {
    const data = findMod(name);
    if (!data?.double) return total + 1;
    const prereqs = prerequisiteNames(data.prerequisite);
    const hasPrereq = prereqs.some((p) => applied.includes(p));
    return total + (hasPrereq ? 1 : 2);
  }, 0);
}

/** Quantos encantos o item tem, contando o pré-requisito embutido do duplo. */
export function countEnchantments(item: Equipment): number {
  const applied = (item.enchantments ?? []).map((e) =>
    normalizeName(e.enchantment)
  );
  return applied.reduce((total, name) => {
    const data = findEnchantment(name);
    if (!data?.double) return total + 1;
    const prereq = ENCHANTMENT_PREREQUISITES[name];
    return total + (prereq && applied.includes(prereq) ? 1 : 2);
  }, 0);
}

export function getMaterialItemKind(item: Equipment): MaterialItemKind | null {
  switch (item.group) {
    case 'Arma':
      return 'weapon';
    case 'Armadura':
      return (item as DefenseEquipment).isHeavyArmor
        ? 'heavyArmor'
        : 'lightArmor';
    case 'Escudo':
      return 'shield';
    case 'Esotérico':
      return 'esoteric';
    default:
      return null;
  }
}

/**
 * Preço extra do material para este item. `null` quando o material não tem
 * preço tabelado (raro, de suplemento sem tabela) ou não se aplica ao tipo.
 */
export function getMaterialPrice(
  material: string,
  item: Equipment
): number | null {
  const kind = getMaterialItemKind(item);
  const row = MATERIAL_PRICES[normalizeName(material)];
  if (!kind || !row) return null;
  return row[kind];
}

const priceForCount = (table: number[], count: number): number =>
  table[Math.min(count, table.length - 1)];

export interface EnhancedItemPrice {
  base: number;
  improvementCount: number;
  improvements: number;
  material: string | null;
  /** `null` quando o material não tem preço tabelado. */
  materialPrice: number | null;
  enchantmentCount: number;
  enchantments: number;
  total: number;
}

/**
 * Preço do item com melhorias, material e encantos. `base` é o preço do item
 * comum (o `preco` do catálogo quando omitido).
 */
export function getEnhancedItemPrice(
  item: Equipment,
  base: number = item.preco ?? 0
): EnhancedItemPrice {
  const improvementCount = countImprovements(item);
  const enchantmentCount = countEnchantments(item);
  const materialMod = (item.modifications ?? []).find(
    (m) => normalizeName(m.mod) === MATERIAL_MOD && m.specialMaterial
  );
  const material = materialMod?.specialMaterial ?? null;
  const materialPrice = material ? getMaterialPrice(material, item) : null;

  const improvements = priceForCount(IMPROVEMENT_PRICES, improvementCount);
  const enchantments = priceForCount(ENCHANTMENT_PRICES, enchantmentCount);

  return {
    base,
    improvementCount,
    improvements,
    material,
    materialPrice,
    enchantmentCount,
    enchantments,
    total: base + improvements + (materialPrice ?? 0) + enchantments,
  };
}
