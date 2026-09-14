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
  /** Suplemento: Deuses de Arton */
  TORMENTA20_DEUSES_ARTON = 'tormenta20-deuses-de-arton',
  /** Suplemento: Heróis de Arton */
  TORMENTA20_HEROIS_ARTON = 'tormenta20-herois-de-arton',
  /** Suplemento: Guia de Deuses Menores */
  TORMENTA20_DEUSES_MENORES = 'tormenta20-guia-de-deuses-menores',

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
/**
 * As contagens das descrições são verificadas contra os dados reais em
 * `supplementMetadata.spec.ts` — elas envelheciam em silêncio a cada edição de
 * conteúdo (Ameaças de Arton adiciona poderes desde sempre e a descrição não
 * dizia; o número de equipamentos estava trocado com o de outro suplemento).
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
    description: '29 raças; 31 poderes; 64 equipamentos; 7 magias',
    releaseDate: '2020',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_ATLAS_ARTON]: {
    id: SupplementId.TORMENTA20_ATLAS_ARTON,
    systemId: SystemId.TORMENTA20,
    name: 'Atlas de Arton',
    abbreviation: 'AA',
    description: '66 origens regionais de Arton; 1 poder',
    releaseDate: '2021',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_DEUSES_ARTON]: {
    id: SupplementId.TORMENTA20_DEUSES_ARTON,
    systemId: SystemId.TORMENTA20,
    name: 'Deuses de Arton',
    abbreviation: 'DA',
    description:
      '1 classe; 75 poderes concedidos; 29 magias; 67 equipamentos; habilidades alternativas de Suraggel',
    releaseDate: '2024',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_HEROIS_ARTON]: {
    id: SupplementId.TORMENTA20_HEROIS_ARTON,
    systemId: SystemId.TORMENTA20,
    name: 'Heróis de Arton',
    abbreviation: 'HA',
    description:
      '5 raças; 1 classe; 14 variantes; 30 origens; 149 poderes; 288 poderes de classe; 22 magias',
    releaseDate: '2025',
    requiresPremium: false,
  },
  [SupplementId.TORMENTA20_DEUSES_MENORES]: {
    id: SupplementId.TORMENTA20_DEUSES_MENORES,
    systemId: SystemId.TORMENTA20,
    name: 'Guia de Deuses Menores',
    abbreviation: 'GDM',
    description: '63 divindades menores; 63 poderes concedidos',
    releaseDate: '2025',
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
 * Conta os suplementos que contam para o limite do nível de apoio: o livro
 * básico é obrigatório e por isso nunca é cobrado.
 */
export function countNonCore(supplementIds: string[]): number {
  return supplementIds.filter((id) => id !== SupplementId.TORMENTA20_CORE)
    .length;
}

/**
 * Valida se um supplementId é válido
 */
export function isValidSupplementId(id: string): id is SupplementId {
  return Object.values(SupplementId).includes(id as SupplementId);
}
