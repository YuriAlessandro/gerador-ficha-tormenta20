import React, { useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useSnackbar } from 'notistack';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import {
  exportGrimoire,
  grimoireFileName,
} from '../../functions/pocketGrimoire/exchange';
import {
  itemTitle,
  resolveItem,
} from '../../functions/pocketGrimoire/resolveItems';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  open: boolean;
  grimoire: PocketGrimoire;
  onClose: () => void;
}

const resolveName = (id: string) => itemTitle(resolveItem(id));

const ExportGrimoireDialog: React.FC<Props> = ({ open, grimoire, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const json = useMemo(
    () => (open ? exportGrimoire(grimoire, resolveName) : ''),
    [open, grimoire]
  );

  const handleDownload = () => {
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = grimoireFileName(grimoire.name);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      enqueueSnackbar('Grimório copiado.', {
        ...GRIMOIRE_SNACKBAR,
        variant: 'success',
      });
    } catch {
      enqueueSnackbar(
        'Não foi possível copiar. Selecione o texto e copie manualmente.',
        { ...GRIMOIRE_SNACKBAR, variant: 'error' }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Exportar “{grimoire.name}”</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 1.5, color: 'text.secondary' }}>
          Guarde o arquivo como backup ou envie para outro aparelho. Para
          recuperar, use “Importar” em Meus grimórios.
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          value={json}
          label='JSON do grimório'
          slotProps={{
            input: { readOnly: true, sx: { fontFamily: 'monospace' } },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Fechar</Button>
        <Button startIcon={<ContentCopyOutlinedIcon />} onClick={handleCopy}>
          Copiar texto
        </Button>
        <Button
          variant='contained'
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={handleDownload}
        >
          Baixar .json
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportGrimoireDialog;
