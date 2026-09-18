/** Id fixo do grimório que sempre existe e não pode ser excluído. */
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
