/**
 * Sistema de Suplementos Multi-Sistema
 * Permite que usuários ativem diferentes suplementos para adicionar
 * raças, classes, poderes, etc. ao gerador de fichas
 */
import { SystemId } from './system.types';

export enum SupplementId {
  // Tormenta 20 supplements
  /** Livro básico do Tormenta 20 - sempre ativo */
  TORMENTA20_CORE = 'tormenta20-core',
  /** Suplemento: Ameaças de Arton */
  TORMENTA20_AMEACAS_ARTON = 'tormenta20-ameacas-de-arton',
  /** Suplemento: Atlas de Arton */
  TORMENTA20_ATLAS_ARTON = 'tormenta20-atlas-de-arton',

  // Future systems supplements can be added here:
  // DND5E_CORE = 'dnd5e-core',
  // DND5E_XANATHARS = 'dnd5e-xanathars',
}

// Legacy string constants for backwards compatibility
/** @deprecated Use SupplementId.TORMENTA20_CORE instead */
export const LEGACY_SUPPLEMENT_CORE = 'tormenta20-core';
/** @deprecated Use SupplementId.TORMENTA20_AMEACAS_ARTON instead */
export const LEGACY_SUPPLEMENT_AMEACAS_ARTON = 'tormenta20-ameacas-de-arton';

export interface Supplement {
  /** ID único do suplemento */
  id: SupplementId;
  /** Sistema ao qual o suplemento pertence */
  systemId: SystemId;
  /** Nome de exibição do suplemento */
  name: string;
  /** Abreviação do suplemento (ex: "T20", "AdA") */
  abbreviation?: string;
  /** Descrição curta do suplemento */
  description: string;
  /** Se o suplemento está ativo para o usuário */
  enabled: boolean;
  /** Data de lançamento do suplemento (opcional) */
  releaseDate?: string;
  /** URL da capa/imagem do suplemento (opcional) */
  coverImage?: string;
  /** Se o suplemento requer premium (opcional) */
  requiresPremium?: boolean;
}

/**
 * Metadados dos suplementos disponíveis
 * Usado para exibir informações na UI
 * Note: Legacy IDs map to same string values, so only new IDs are used
 */
export const SUPPLEMENT_METADATA: Partial<
  Record<SupplementId, Omit<Supplement, 'enabled'>>
> = {
  [SupplementId.TORMENTA20_CORE]: {
    id: SupplementId.TORMENTA20_CORE,
    systemId: SystemId.TORMENTA20,
    name: 'Tormenta 20',
    abbreviation: 'T20',
    description: 'Livro básico do sistema Tormenta 20',
    releaseDate: '2019',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_AMEACAS_ARTON]: {
    id: SupplementId.TORMENTA20_AMEACAS_ARTON,
    systemId: SystemId.TORMENTA20,
    name: 'Ameaças de Arton',
    abbreviation: 'AdA',
    description: '29 novas raças; 67 novos equipamentos; 7 novas magias',
    releaseDate: '2020',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_ATLAS_ARTON]: {
    id: SupplementId.TORMENTA20_ATLAS_ARTON,
    systemId: SystemId.TORMENTA20,
    name: 'Atlas de Arton',
    abbreviation: 'AA',
    description: '70 origens regionais de Arton',
    releaseDate: '2021',
    requiresPremium: false,
  },
};

/**
 * Retorna lista de suplementos com status enabled
 */
export function getSupplementsList(enabledIds: SupplementId[]): Supplement[] {
  return Object.values(SUPPLEMENT_METADATA).map((meta) => ({
    ...meta,
    enabled: enabledIds.includes(meta.id),
  }));
}

/**
 * Valida se um supplementId é válido
 */
export function isValidSupplementId(id: string): id is SupplementId {
  return Object.values(SupplementId).includes(id as SupplementId);
}
