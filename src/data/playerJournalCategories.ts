import {
  JournalCategory,
  JournalCategoryId,
  PlayerJournal,
  JOURNAL_CHARACTER_CATEGORY_ID,
} from '../interfaces/PlayerJournal';

/**
 * Categorias NATIVAS do Diário do Jogador.
 *
 * Vivem em código e não nos dados da ficha: assim, corrigir o nome ou a cor de
 * uma categoria chega a todas as fichas já salvas. Em `journal.customCategories`
 * ficam apenas as que o usuário criou.
 *
 * Este arquivo é PÚBLICO porque o exportador de PDF precisa do nome legível de
 * cada categoria e tem que funcionar em build sem o submódulo premium. O `icon`
 * é uma CHAVE, não um componente — o módulo premium é que a resolve para um
 * ícone do MUI.
 */
export const NATIVE_JOURNAL_CATEGORIES: JournalCategory[] = [
  {
    id: JOURNAL_CHARACTER_CATEGORY_ID,
    name: 'Personagem',
    color: '#e8e8e8',
    icon: 'personagem',
  },
  { id: 'npc', name: 'NPC', color: '#e08b2f', icon: 'npc' },
  { id: 'grupo', name: 'Organização', color: '#c9b037', icon: 'grupo' },
  { id: 'regiao', name: 'Região', color: '#8bc34a', icon: 'regiao' },
  { id: 'local', name: 'Local', color: '#2fae6b', icon: 'local' },
  { id: 'missao', name: 'Missão', color: '#16a085', icon: 'missao' },
  { id: 'fato', name: 'Fato', color: '#26a69a', icon: 'fato' },
  { id: 'evento', name: 'Evento', color: '#2f7fe0', icon: 'evento' },
  { id: 'item', name: 'Item', color: '#8e6ee0', icon: 'item' },
  { id: 'divindade', name: 'Divindade', color: '#d63bb8', icon: 'divindade' },
  { id: 'criatura', name: 'Criatura', color: '#e0345c', icon: 'criatura' },
  { id: 'inimigo', name: 'Inimigo', color: '#d32f2f', icon: 'inimigo' },
  { id: 'nota', name: 'Nota', color: '#9e9e9e', icon: 'nota' },
];

/**
 * Todas as categorias disponíveis num diário: as nativas mais as do usuário.
 * A ordem importa — é a que aparece no seletor de categoria.
 */
export function getJournalCategories(
  journal?: PlayerJournal
): JournalCategory[] {
  return [...NATIVE_JOURNAL_CATEGORIES, ...(journal?.customCategories ?? [])];
}

/**
 * Resolve uma categoria por id. Devolve a categoria genérica `nota` quando o id
 * não existe mais — o caso real é o usuário apagar uma categoria customizada que
 * ainda tem nós usando ela; nenhum nó pode ficar órfão e sumir da tela.
 */
export function getJournalCategory(
  categoryId: JournalCategoryId,
  journal?: PlayerJournal
): JournalCategory {
  const found = getJournalCategories(journal).find(
    (category) => category.id === categoryId
  );
  if (found) return found;

  const fallback = NATIVE_JOURNAL_CATEGORIES.find(
    (category) => category.id === 'nota'
  );
  // O `nota` está declarado logo acima; o non-null seria seguro, mas o fallback
  // explícito evita depender disso caso a lista mude.
  return fallback ?? NATIVE_JOURNAL_CATEGORIES[0];
}
