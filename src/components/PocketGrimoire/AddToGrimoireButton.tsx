import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addItem,
  removeItem,
  selectActiveGrimoire,
  selectGrimoireById,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  itemId: string;
  itemName: string;
  /** Sem ele, age sobre o grimório ativo. */
  grimoireId?: string;
}

const AddToGrimoireButton: React.FC<Props> = ({
  itemId,
  itemName,
  grimoireId,
}) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const active = useAppSelector(selectActiveGrimoire);
  const explicit = useAppSelector(selectGrimoireById(grimoireId));
  const target = explicit ?? active;
  const inGrimoire = target.itemIds.includes(itemId);
  const label = inGrimoire
    ? `Remover ${itemName} de ${target.name}`
    : `Adicionar ${itemName} a ${target.name}`;

  const notify = (message: string, undo: () => void) => {
    enqueueSnackbar(message, {
      ...GRIMOIRE_SNACKBAR,
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

  const handleClick = (event: React.MouseEvent) => {
    // O botão vive dentro de linhas de tabela e resultados de busca clicáveis.
    event.stopPropagation();
    const targetId = target.id;
    // Texto sem gênero: serve para "a magia" e para "o poder".
    if (inGrimoire) {
      dispatch(removeItem(targetId, itemId));
      notify(`"${itemName}" saiu de ${target.name}.`, () =>
        dispatch(addItem(targetId, itemId))
      );
    } else {
      dispatch(addItem(targetId, itemId));
      notify(`"${itemName}" foi para ${target.name}.`, () =>
        dispatch(removeItem(targetId, itemId))
      );
    }
  };

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        size='small'
        color={inGrimoire ? 'success' : 'default'}
        onClick={handleClick}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {inGrimoire ? (
          <BookmarkAddedIcon fontSize='small' />
        ) : (
          <BookmarkAddOutlinedIcon fontSize='small' />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default AddToGrimoireButton;
