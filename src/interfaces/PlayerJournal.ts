/**
 * Diário do Jogador — o canvas de anotações da ficha.
 *
 * Os TIPOS vivem no repo público de propósito: `CharacterSheet` e o exportador
 * de PDF precisam tipar o campo mesmo num build sem o submódulo premium. Só a
 * UI (o canvas em si) é premium.
 *
 * As categorias NATIVAS vivem em código (no módulo premium), não nos dados —
 * assim dá para corrigir cor, nome ou ícone de uma categoria e a correção chega
 * a todas as fichas já salvas. Em `PlayerJournal.customCategories` ficam apenas
 * as que o usuário criou.
 */

/** Id de categoria: slug fixo para as nativas, uuid para as customizadas. */
export type JournalCategoryId = string;

export interface JournalCategory {
  id: JournalCategoryId;
  name: string;
  /** Cor do anel do círculo, no formato `#rrggbb`. */
  color: string;
  /** Chave no registro de ícones do módulo premium. */
  icon: string;
  /** `true` = criada pelo usuário (recurso de apoiador). */
  custom?: boolean;
}

export interface JournalNode {
  id: string;
  categoryId: JournalCategoryId;
  title: string;
  /** Texto livre em markdown. */
  body: string;
  /**
   * Coordenadas de MUNDO — não de tela. A conversão para pixels depende do
   * zoom e do deslocamento do viewport, que são estado de UI.
   */
  x: number;
  y: number;
  /**
   * O nó do personagem: não pode ser apagado nem trocar de categoria. Existe
   * só um por diário e é o centro a partir do qual o layout radial cresce.
   */
  locked?: boolean;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. */
  updatedAt: string;
}

export interface JournalLink {
  id: string;
  /** `JournalNode.id` de origem. */
  from: string;
  /** `JournalNode.id` de destino. */
  to: string;
  label?: string;
}

export interface JournalViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface PlayerJournal {
  /**
   * Carimbo de formato. O backend guarda `sheetData` como `Mixed`, sem schema
   * e sem validação — não há migração de banco, e também não há rede. Este
   * campo é o que vai permitir evoluir o formato depois sem adivinhar.
   */
  version: 1;
  nodes: JournalNode[];
  links: JournalLink[];
  /** Apenas as criadas pelo usuário; as nativas vivem em código. */
  customCategories: JournalCategory[];
  /** Última posição de câmera, para reabrir o diário onde o jogador parou. */
  viewport?: JournalViewport;
}

/** Id do nó do personagem — fixo, para o layout radial saber onde é o centro. */
export const JOURNAL_CHARACTER_NODE_ID = 'personagem';

/** Categoria nativa que recebe a migração das anotações antigas. */
export const JOURNAL_DEFAULT_CATEGORY_ID = 'nota';

/** Categoria nativa do nó do personagem. */
export const JOURNAL_CHARACTER_CATEGORY_ID = 'personagem';
