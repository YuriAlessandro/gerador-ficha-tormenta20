/**
 * Id e nome do primeiro grimório de um usuário novo. Ele não tem regra
 * especial: pode ser renomeado e excluído (desde que sobre outro).
 */
export const DEFAULT_GRIMOIRE_ID = 'default';
export const DEFAULT_GRIMOIRE_NAME = 'Padrão';
export const GRIMOIRE_NAME_MAX_LENGTH = 60;

export interface PocketGrimoire {
  id: string;
  name: string;
  /** Ids do índice da enciclopédia (`EncyclopediaEntry.id`), sem repetição. */
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PocketGrimoireState {
  grimoires: PocketGrimoire[];
  activeId: string;
}

/**
 * O que o premium informa sobre o plano de quem está logado
 * (`usePocketGrimoirePlan`; `null` deslogado ou sem o módulo premium).
 */
export interface PocketGrimoirePlan {
  /** `false` enquanto auth, assinatura ou flags não carregaram. */
  ready: boolean;
  limit: number;
  /** Grimórios acima do limite: aparecem, mas não abrem. */
  lockedIds: Set<string>;
  /** Aviso ao tentar criar no limite. */
  createLimitMessage: string;
  /** Aviso ao tentar abrir um bloqueado. */
  lockedMessage: string;
}
