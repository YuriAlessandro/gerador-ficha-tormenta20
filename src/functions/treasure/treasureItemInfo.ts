/**
 * Descobre as propriedades do item-base sorteado (é escudo? armadura pesada?
 * arma de disparo?) consultando o catálogo de equipamentos do app, para que as
 * regras de "só se aplica a..." dos livros possam ser checadas.
 *
 * Quando o nome da tabela não casa com nenhum item do catálogo, devolve
 * `undefined` e o gerador mostra um aviso em vez de adivinhar.
 */
import { dataRegistry } from '@/data/registry';
import { isHeavyArmor } from '@/data/systems/tormenta20/equipamentos';
import type { ItemPredicate } from '@/data/treasure/treasureRules';
import Equipment, { DefenseEquipment } from '@/interfaces/Equipment';
import { SupplementId } from '@/types/supplement.types';
import { getWeaponPurpose } from '../weaponPurpose';

export type TreasureItemInfo = Record<ItemPredicate, boolean>;

export type ItemInfoResolver = (
  name: string,
  kind: 'arma' | 'armadura' | 'esoterico'
) => TreasureItemInfo | undefined;

/** Livros cobertos pelas tabelas (básico + planilha). */
const TREASURE_SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

export const normalizeItemName = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s*\(\d+\)$/, '')
    .trim();

function weaponInfo(e: Equipment): TreasureItemInfo {
  const purpose = getWeaponPurpose(e);
  const tipo = (e.tipo ?? '').toLowerCase();
  return {
    melee: purpose === 'melee' || purpose === 'thrown',
    firingNotSling:
      purpose === 'firing' && normalizeItemName(e.nome) !== 'funda',
    ammo: Boolean(e.isAmmo),
    cutOrPierce: tipo.includes('corte') || tipo.includes('perf'),
    armor: false,
    heavyArmor: false,
    shield: false,
  };
}

function defenseInfo(e: DefenseEquipment): TreasureItemInfo {
  const shield = e.group === 'Escudo';
  return {
    melee: false,
    firingNotSling: false,
    ammo: false,
    cutOrPierce: false,
    armor: !shield,
    heavyArmor: !shield && isHeavyArmor(e),
    shield,
  };
}

const NONE: TreasureItemInfo = {
  melee: false,
  firingNotSling: false,
  ammo: false,
  cutOrPierce: false,
  armor: false,
  heavyArmor: false,
  shield: false,
};

function find(pool: Equipment[], name: string): Equipment | undefined {
  const n = normalizeItemName(name);
  return pool.find((e) => {
    const c = normalizeItemName(e.nome);
    // A Tabela 8-4 escreve "Couro", "Completa"; o catálogo, "Armadura de couro".
    return c === n || c === `armadura de ${n}` || c === `armadura ${n}`;
  });
}

export const catalogItemInfo: ItemInfoResolver = (name, kind) => {
  const cat = dataRegistry.getEquipmentBySupplements(TREASURE_SUPPLEMENTS);
  if (kind === 'arma') {
    const e = find(cat.weapons, name);
    return e ? weaponInfo(e) : undefined;
  }
  if (kind === 'armadura') {
    const e = find([...cat.armors, ...cat.shields], name);
    return e ? defenseInfo(e as DefenseEquipment) : undefined;
  }
  const e = find(cat.esoteric, name);
  return e ? NONE : undefined;
};
