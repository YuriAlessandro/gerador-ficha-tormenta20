import React, { useState } from 'react';
import { useStore } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  createGrimoire,
  moveItem,
  removeItem,
  selectActiveId,
  selectGrimoireById,
  selectGrimoires,
  setActive,
  WithPocketGrimoire,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  closeGrimoireMove,
  GrimoireMoveRequest,
  selectGrimoireMove,
} from '../../store/slices/pocketGrimoire/grimoireMoveSlice';
import GrimoireNameDialog from './GrimoireNameDialog';
import { useAddedToActiveSnackbar } from './useGrimoireUndo';
import { useGrimoireLimit } from './useGrimoireLimit';

const TITLE_ID = 'grimoire-move-title';

const countLabel = (count: number) =>
  `${count} ${count === 1 ? 'item' : 'itens'}`;

/**
 * Atende o "Trocar" do aviso de adição: leva o item para outro grimório (ou
 * para um novo) e torna o destino o ativo. Montado uma vez, no App.
 */
const GrimoireMoveDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useStore<WithPocketGrimoire>();
  const request = useAppSelector(selectGrimoireMove);
  const grimoires = useAppSelector(selectGrimoires);
  const activeId = useAppSelector(selectActiveId);
  const notifyAddedToActive = useAddedToActiveSnackbar();
  const { ensureCanCreate } = useGrimoireLimit();
  const [naming, setNaming] = useState(false);

  const close = () => {
    setNaming(false);
    dispatch(closeGrimoireMove());
  };

  const moveTo = (
    { itemId, itemName, fromId }: GrimoireMoveRequest,
    toId: string
  ) => {
    const before = store.getState();
    const hadIn = (id: string) =>
      selectGrimoireById(id)(before)?.itemIds.includes(itemId) ?? false;
    const inFrom = hadIn(fromId);
    const inTo = hadIn(toId);
    const previousActive = activeId;

    dispatch(moveItem(itemId, fromId, toId));
    close();
    const to = selectGrimoireById(toId)(store.getState());
    if (!to || toId === fromId) return;

    notifyAddedToActive({ itemId, itemName }, to, () => {
      if (!inTo) dispatch(removeItem(toId, itemId));
      if (inFrom) dispatch(addItem(fromId, itemId));
      dispatch(setActive(previousActive));
    });
  };

  return (
    <>
      <Dialog
        open={request !== null && !naming}
        onClose={close}
        fullWidth
        maxWidth='xs'
        aria-labelledby={TITLE_ID}
      >
        <DialogTitle id={TITLE_ID}>
          {request ? `Mover "${request.itemName}" para…` : ''}
        </DialogTitle>
        <List sx={{ pt: 0 }}>
          {grimoires.map((grimoire) => {
            const current = grimoire.id === request?.fromId;
            return (
              <ListItemButton
                key={grimoire.id}
                selected={current}
                onClick={() => request && moveTo(request, grimoire.id)}
              >
                <ListItemText
                  primary={grimoire.name}
                  secondary={countLabel(grimoire.itemIds.length)}
                />
                {current && (
                  <ListItemIcon sx={{ minWidth: 0 }}>
                    <CheckIcon fontSize='small' color='primary' />
                  </ListItemIcon>
                )}
              </ListItemButton>
            );
          })}
          <Divider />
          <ListItemButton
            onClick={() => {
              if (ensureCanCreate()) setNaming(true);
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Novo grimório' />
          </ListItemButton>
        </List>
        <DialogActions>
          <Button onClick={close}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <GrimoireNameDialog
        open={request !== null && naming}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setNaming(false)}
        onConfirm={(name) => {
          if (!request) return;
          const action = dispatch(createGrimoire(name));
          moveTo(request, action.payload.id);
        }}
      />
    </>
  );
};

export default GrimoireMoveDialog;
