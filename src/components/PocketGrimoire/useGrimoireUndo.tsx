import React from 'react';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../store/hooks';
import {
  addItem,
  removeItem,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  itemTitle,
  resolveItem,
} from '../../functions/pocketGrimoire/resolveItems';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

/** Snackbar do grimório com o botão "Desfazer". */
export function useUndoSnackbar() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (message: string, undo: () => void) => {
    enqueueSnackbar(message, {
      ...GRIMOIRE_SNACKBAR,
      variant: 'default',
      action: (key) => (
        <Button
          color='inherit'
          size='small'
          onClick={() => {
            undo();
            closeSnackbar(key);
          }}
        >
          Desfazer
        </Button>
      ),
    });
  };
}

/**
 * Remover um item de um grimório já aberto (lixeira, carta ampliada, balão),
 * com o mesmo aviso e "Desfazer" de quando se adiciona.
 */
export function useRemoveFromGrimoire() {
  const dispatch = useAppDispatch();
  const notify = useUndoSnackbar();

  return (grimoire: Pick<PocketGrimoire, 'id' | 'name'>, itemId: string) => {
    const { id, name } = grimoire;
    dispatch(removeItem(id, itemId));
    // Texto sem gênero: serve para "a magia" e para "o poder".
    notify(`"${itemTitle(resolveItem(itemId))}" saiu de ${name}.`, () =>
      dispatch(addItem(id, itemId))
    );
  };
}
