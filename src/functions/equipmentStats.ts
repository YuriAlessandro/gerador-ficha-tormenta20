import Equipment, {
  DefenseEquipment,
  equipGroup,
} from '../interfaces/Equipment';
import { isDefenseEquipment } from './itemEnhancements/core';
import { WEAPON_CATEGORY_SHORT_LABELS } from './proficiencies';
import {
  abbreviateDamageType,
  formatReach,
  formatSpaces,
} from './equipmentDisplay';

/**
 * Descritores de status de item, compartilhados entre a loja do assistente de
 * criação e a aba de Equipamentos da ficha. Cada tela compõe as colunas que
 * quer a partir daqui, então "Crítico" significa a mesma coisa e é formatado do
 * mesmo jeito nos dois lugares.
 */
export interface EquipmentStat {
  key: string;
  /** Cabeçalho da coluna no desktop. */
  label: string;
  /** Prefixo do chip no mobile, onde não há cabeçalho. */
  shortLabel: string;
  /** Trilha do CSS grid da coluna. */
  width: string;
  align?: 'left' | 'right';
  /** `undefined` => a célula/chip é omitida para este item. */
  get: (item: Equipment | DefenseEquipment) => string | undefined;
}

export const STAT_DANO: EquipmentStat = {
  key: 'dano',
  label: 'Dano',
  shortLabel: 'Dano',
  width: 'minmax(64px, 84px)',
  get: (item) => item.dano,
};

export const STAT_CRITICO: EquipmentStat = {
  key: 'critico',
  label: 'Crítico',
  shortLabel: 'Crít',
  width: 'minmax(56px, 72px)',
  get: (item) => item.critico,
};

export const STAT_TIPO: EquipmentStat = {
  key: 'tipo',
  label: 'Tipo',
  shortLabel: 'Tipo',
  width: 'minmax(64px, 84px)',
  get: (item) => abbreviateDamageType(item.tipo),
};

export const STAT_ALCANCE: EquipmentStat = {
  key: 'alcance',
  label: 'Alcance',
  shortLabel: 'Alc',
  width: 'minmax(64px, 88px)',
  get: (item) => formatReach(item),
};

export const STAT_CATEGORIA_ARMA: EquipmentStat = {
  key: 'weaponCategory',
  label: 'Categoria',
  shortLabel: 'Cat',
  width: 'minmax(64px, 84px)',
  get: (item) =>
    item.weaponCategory
      ? WEAPON_CATEGORY_SHORT_LABELS[item.weaponCategory]
      : undefined,
};

export const STAT_DEFESA: EquipmentStat = {
  key: 'defesa',
  label: 'Defesa',
  shortLabel: 'Def',
  width: 'minmax(56px, 76px)',
  get: (item) =>
    isDefenseEquipment(item) ? `+${item.defenseBonus}` : undefined,
};

export const STAT_PENALIDADE: EquipmentStat = {
  key: 'penalidade',
  label: 'Penalidade',
  shortLabel: 'Pen',
  width: 'minmax(72px, 96px)',
  get: (item) =>
    isDefenseEquipment(item) && item.armorPenalty
      ? `${item.armorPenalty}`
      : undefined,
};

export const STAT_ESPACOS: EquipmentStat = {
  key: 'spaces',
  label: 'Espaços',
  shortLabel: 'Esp',
  width: 'minmax(56px, 72px)',
  align: 'right',
  get: (item) => formatSpaces(item.spaces),
};

/**
 * Colunas descritivas de cada tipo de item — sem espaços, que cada tela
 * posiciona como quiser (na ficha ele é a coluna de destaque).
 */
const STATS_BY_GROUP: Partial<Record<equipGroup, EquipmentStat[]>> = {
  Arma: [STAT_DANO, STAT_CRITICO, STAT_TIPO, STAT_ALCANCE, STAT_CATEGORIA_ARMA],
  Armadura: [STAT_DEFESA, STAT_PENALIDADE],
  Escudo: [STAT_DEFESA, STAT_PENALIDADE],
};

export const getStatsForGroup = (group: equipGroup): EquipmentStat[] =>
  STATS_BY_GROUP[group] ?? [];
