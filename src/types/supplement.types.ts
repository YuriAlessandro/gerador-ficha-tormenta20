/**
 * Sistema de Suplementos para Tormenta 20
 * Permite que usuários ativem diferentes suplementos para adicionar
 * raças, classes, poderes, etc. ao gerador de fichas
 */

export enum SupplementId {
  /** Livro básico do Tormenta 20 - sempre ativo */
  CORE = 'tormenta20-core',
  /** Suplemento: Ameaças de Arton */
  AMEACAS_ARTON = 'ameacas-de-arton',
  // Adicionar novos suplementos aqui conforme necessário
}

export interface Supplement {
  /** ID único do suplemento */
  id: SupplementId;
  /** Nome de exibição do suplemento */
  name: string;
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
 */
export const SUPPLEMENT_METADATA: Record<
  SupplementId,
  Omit<Supplement, 'enabled'>
> = {
  [SupplementId.CORE]: {
    id: SupplementId.CORE,
    name: 'Tormenta 20',
    description: 'Livro básico do sistema Tormenta 20',
    releaseDate: '2019',
    requiresPremium: false,
  },
  [SupplementId.AMEACAS_ARTON]: {
    id: SupplementId.AMEACAS_ARTON,
    name: 'Ameaças de Arton',
    description: 'Novos monstros, raças jogáveis e desafios épicos',
    releaseDate: '2020',
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
