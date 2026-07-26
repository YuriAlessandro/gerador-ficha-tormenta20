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
  /**
   * Largura mínima da trilha do grid, em px. É ela que decide se a tabela ainda
   * cabe no container: trilha com mínimo em px nunca encolhe abaixo dele.
   */
  minWidth: number;
  /** Largura máxima da trilha do grid, em px. */
  maxWidth: number;
  align?: 'left' | 'right';
  /** `undefined` => a célula/chip é omitida para este item. */
  get: (item: Equipment | DefenseEquipment) => string | undefined;
}

/** Trilha do CSS grid da coluna, derivada dos limites numéricos. */
export const statTrack = (stat: EquipmentStat): string =>
  `minmax(${stat.minWidth}px, ${stat.maxWidth}px)`;

export const STAT_DANO: EquipmentStat = {
  key: 'dano',
  label: 'Dano',
  shortLabel: 'Dano',
  minWidth: 64,
  maxWidth: 84,
  get: (item) => item.dano,
};

export const STAT_CRITICO: EquipmentStat = {
  key: 'critico',
  label: 'Crítico',
  shortLabel: 'Crít',
  minWidth: 56,
  maxWidth: 72,
  get: (item) => item.critico,
};

export const STAT_TIPO: EquipmentStat = {
  key: 'tipo',
  label: 'Tipo',
  shortLabel: 'Tipo',
  minWidth: 64,
  maxWidth: 84,
  get: (item) => abbreviateDamageType(item.tipo),
};

export const STAT_ALCANCE: EquipmentStat = {
  key: 'alcance',
  label: 'Alcance',
  shortLabel: 'Alc',
  minWidth: 64,
  maxWidth: 88,
  get: (item) => formatReach(item),
};

export const STAT_CATEGORIA_ARMA: EquipmentStat = {
  key: 'weaponCategory',
  label: 'Categoria',
  shortLabel: 'Cat',
  minWidth: 64,
  maxWidth: 84,
  get: (item) =>
    item.weaponCategory
      ? WEAPON_CATEGORY_SHORT_LABELS[item.weaponCategory]
      : undefined,
};

export const STAT_DEFESA: EquipmentStat = {
  key: 'defesa',
  label: 'Defesa',
  shortLabel: 'Def',
  minWidth: 56,
  maxWidth: 76,
  get: (item) =>
    isDefenseEquipment(item) ? `+${item.defenseBonus}` : undefined,
};

export const STAT_PENALIDADE: EquipmentStat = {
  key: 'penalidade',
  label: 'Penalidade',
  shortLabel: 'Pen',
  minWidth: 72,
  maxWidth: 96,
  get: (item) =>
    isDefenseEquipment(item) && item.armorPenalty
      ? `${item.armorPenalty}`
      : undefined,
};

export const STAT_ESPACOS: EquipmentStat = {
  key: 'spaces',
  label: 'Espaços',
  shortLabel: 'Esp',
  minWidth: 56,
  maxWidth: 72,
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
