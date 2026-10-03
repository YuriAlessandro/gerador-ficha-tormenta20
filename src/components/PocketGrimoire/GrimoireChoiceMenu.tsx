import React, { useState } from 'react';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  createGrimoire,
  removeItem,
  selectActiveId,
  selectGrimoires,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import GrimoireNameDialog from './GrimoireNameDialog';
import { useUndoSnackbar } from './useGrimoireUndo';
import { useGrimoireLimit } from './useGrimoireLimit';

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  itemId: string;
  itemName: string;
}

/**
 * Seta do botão "Adicionar ao grimório": mostra em quais grimórios o item já
 * está e deixa marcar mais de um. Marcar um grimório o torna o ativo, para
 * que o próximo clique no marcador caia nele.
 */
const GrimoireChoiceMenu: React.FC<Props> = ({
  anchorEl,
  onClose,
  itemId,
  itemName,
}) => {
  const dispatch = useAppDispatch();
  const grimoires = useAppSelector(selectGrimoires);
  const activeId = useAppSelector(selectActiveId);
  const notify = useUndoSnackbar();
  const { ensureCanCreate, lockedIds } = useGrimoireLimit();
  const [naming, setNaming] = useState(false);

  const toggle = (grimoire: PocketGrimoire) => {
    const { id, name } = grimoire;
    // Texto sem gênero: serve para "a magia" e para "o poder".
    if (grimoire.itemIds.includes(itemId)) {
      dispatch(removeItem(id, itemId));
      notify(`"${itemName}" saiu de ${name}.`, () =>
        dispatch(addItem(id, itemId))
      );
    } else {
      const previousActive = activeId;
      dispatch(addItem(id, itemId));
      dispatch(setActive(id));
      notify(`"${itemName}" foi para ${name}.`, () => {
        dispatch(removeItem(id, itemId));
        dispatch(setActive(previousActive));
      });
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {grimoires
          .filter((grimoire) => !lockedIds.has(grimoire.id))
          .map((grimoire) => {
            const checked = grimoire.itemIds.includes(itemId);
            return (
              <MenuItem
                key={grimoire.id}
                role='menuitemcheckbox'
                aria-checked={checked}
                onClick={() => toggle(grimoire)}
              >
                <ListItemIcon>
                  {checked ? (
                    <CheckBoxIcon fontSize='small' color='success' />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize='small' />
                  )}
                </ListItemIcon>
                <ListItemText>{grimoire.name}</ListItemText>
              </MenuItem>
            );
          })}
        <Divider />
        <MenuItem
          onClick={() => {
            if (!ensureCanCreate()) return;
            onClose();
            setNaming(true);
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Novo grimório</ListItemText>
        </MenuItem>
      </Menu>

      <GrimoireNameDialog
        open={naming}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setNaming(false)}
        onConfirm={(name) => {
          const { id } = dispatch(createGrimoire(name)).payload;
          dispatch(addItem(id, itemId));
          dispatch(setActive(id));
          setNaming(false);
        }}
      />
    </>
  );
};

export default GrimoireChoiceMenu;
