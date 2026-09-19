import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  deleteGrimoire,
  duplicateGrimoire,
  renameGrimoire,
  selectGrimoires,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import GrimoireNameDialog from './GrimoireNameDialog';
import ExportGrimoireDialog from './ExportGrimoireDialog';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  grimoire: PocketGrimoire;
  isActive: boolean;
  /** Chamado depois de excluir (a página de consulta volta para a lista). */
  onDeleted?: () => void;
}

type OpenDialog = 'rename' | 'export' | 'delete' | null;

const GrimoireMenu: React.FC<Props> = ({ grimoire, isActive, onDeleted }) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  // Sempre precisa sobrar pelo menos um grimório.
  const isLast = useAppSelector(selectGrimoires).length <= 1;

  const closeMenu = () => setAnchorEl(null);
  const openDialog = (which: OpenDialog) => {
    closeMenu();
    setDialog(which);
  };

  const handleDuplicate = () => {
    closeMenu();
    dispatch(duplicateGrimoire(grimoire.id));
    enqueueSnackbar(`Cópia de ${grimoire.name} criada.`, {
      ...GRIMOIRE_SNACKBAR,
      variant: 'success',
    });
  };

  const handleDelete = () => {
    setDialog(null);
    dispatch(deleteGrimoire(grimoire.id));
    enqueueSnackbar(`${grimoire.name} excluído.`, {
      ...GRIMOIRE_SNACKBAR,
      variant: 'default',
    });
    onDeleted?.();
  };

  return (
    <>
      <IconButton
        aria-label={`Opções de ${grimoire.name}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          disabled={isActive}
          onClick={() => {
            closeMenu();
            dispatch(setActive(grimoire.id));
          }}
        >
          <ListItemIcon>
            <CheckCircleOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>
            {isActive ? 'Já é o ativo' : 'Tornar ativo'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDialog('rename')}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Renomear</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDialog('export')}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Exportar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={isLast}
          onClick={() => openDialog('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>
            {isLast ? 'Excluir (crie outro grimório antes)' : 'Excluir'}
          </ListItemText>
        </MenuItem>
      </Menu>

      <GrimoireNameDialog
        open={dialog === 'rename'}
        title='Renomear grimório'
        confirmLabel='Salvar'
        initialName={grimoire.name}
        onClose={() => setDialog(null)}
        onConfirm={(name) => {
          dispatch(renameGrimoire(grimoire.id, name));
          setDialog(null);
        }}
      />
      <ExportGrimoireDialog
        open={dialog === 'export'}
        grimoire={grimoire}
        onClose={() => setDialog(null)}
      />
      <Dialog open={dialog === 'delete'} onClose={() => setDialog(null)}>
        <DialogTitle>Excluir “{grimoire.name}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não pode ser desfeita. Se quiser guardar os itens, exporte
            o grimório antes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancelar</Button>
          <Button color='error' variant='contained' onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GrimoireMenu;
