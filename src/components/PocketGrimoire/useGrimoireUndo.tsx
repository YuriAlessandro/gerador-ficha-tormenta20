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
import { requestGrimoireMove } from '../../store/slices/pocketGrimoire/grimoireMoveSlice';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

/** Com "Trocar", um pouco mais de tempo para ler o destino e decidir. */
export const CHANGE_SNACKBAR_DURATION = 6000;

/**
 * Snackbar do grimório com o botão "Desfazer" e, quando há `onChange`, o
 * "Trocar" antes dele.
 */
export function useUndoSnackbar() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (message: string, undo: () => void, onChange?: () => void) => {
    enqueueSnackbar(message, {
      ...GRIMOIRE_SNACKBAR,
      ...(onChange ? { autoHideDuration: CHANGE_SNACKBAR_DURATION } : {}),
      variant: 'default',
      action: (key) => (
        <>
          {onChange && (
            <Button
              color='inherit'
              size='small'
              onClick={() => {
                closeSnackbar(key);
                onChange();
              }}
            >
              Trocar
            </Button>
          )}
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
        </>
      ),
    });
  };
}

/**
 * Aviso de "foi para o grimório ativo": mostra o destino na hora em que ele
 * importa e oferece "Trocar" (ver `GrimoireMoveDialog`).
 */
export function useAddedToActiveSnackbar() {
  const dispatch = useAppDispatch();
  const notify = useUndoSnackbar();

  return (
    item: { itemId: string; itemName: string },
    grimoire: Pick<PocketGrimoire, 'id' | 'name'>,
    undo: () => void
  ) => {
    const { itemId, itemName } = item;
    // Texto sem gênero: serve para "a magia" e para "o poder".
    notify(`"${itemName}" foi para ${grimoire.name}.`, undo, () =>
      dispatch(requestGrimoireMove({ itemId, itemName, fromId: grimoire.id }))
    );
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
