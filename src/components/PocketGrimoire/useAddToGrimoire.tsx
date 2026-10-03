import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  removeItem,
  selectActiveGrimoire,
  selectGrimoireById,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { useAddedToActiveSnackbar, useUndoSnackbar } from './useGrimoireUndo';

export interface AddToGrimoireControl {
  /** Nome do grimório em que o clique mexe: o explícito, ou o ativo. */
  targetName: string;
  inGrimoire: boolean;
  /** Rótulo acessível da ação, com o nome do item e o do grimório. */
  label: string;
  /** Adiciona ou remove, e avisa com um snackbar que oferece desfazer. */
  toggle: () => void;
}

/**
 * A ação "guardar no grimório" sem a casca: o botão de marcador e a linha
 * inteira do resultado de busca compartilham daqui o estado e o clique, para
 * que os dois façam exatamente a mesma coisa.
 */
export function useAddToGrimoire(
  itemId: string,
  itemName: string,
  grimoireId?: string
): AddToGrimoireControl {
  const dispatch = useAppDispatch();
  const notify = useUndoSnackbar();
  const notifyAddedToActive = useAddedToActiveSnackbar();
  const active = useAppSelector(selectActiveGrimoire);
  const explicit = useAppSelector(selectGrimoireById(grimoireId));
  const target = explicit ?? active;
  const inGrimoire = target.itemIds.includes(itemId);

  const toggle = () => {
    const targetId = target.id;
    // Texto sem gênero: serve para "a magia" e para "o poder".
    if (inGrimoire) {
      dispatch(removeItem(targetId, itemId));
      notify(`"${itemName}" saiu de ${target.name}.`, () =>
        dispatch(addItem(targetId, itemId))
      );
    } else {
      dispatch(addItem(targetId, itemId));
      const undo = () => dispatch(removeItem(targetId, itemId));
      // Destino explícito (dentro de um grimório) não tem o que trocar.
      if (explicit) {
        notify(`"${itemName}" foi para ${target.name}.`, undo);
      } else {
        notifyAddedToActive({ itemId, itemName }, target, undo);
      }
    }
  };

  return {
    targetName: target.name,
    inGrimoire,
    label: inGrimoire
      ? `Remover ${itemName} de ${target.name}`
      : `Adicionar ${itemName} a ${target.name}`,
    toggle,
  };
}

export default useAddToGrimoire;
