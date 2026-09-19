import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { useSnackbar } from 'notistack';
import { useStore } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import {
  importGrimoire,
  selectGrimoireById,
  setActive,
  WithPocketGrimoire,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { parseGrimoireImport } from '../../functions/pocketGrimoire/exchange';
import { resolveItem } from '../../functions/pocketGrimoire/resolveItems';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  open: boolean;
  onClose: () => void;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

const ImportGrimoireDialog: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const store = useStore<WithPocketGrimoire>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTab('file');
      setText('');
      setFileName('');
      setError('');
    }
  }, [open]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setText(await file.text());
    }
  };

  const handleImport = () => {
    const result = parseGrimoireImport(text);
    if (!result.ok) {
      setError(result.error);
    } else {
      const action = dispatch(
        importGrimoire(result.value.name, result.value.itemIds)
      );
      const { id } = action.payload;
      const created = selectGrimoireById(id)(store.getState());
      const missing = result.value.itemIds.filter(
        (itemId) => resolveItem(itemId).kind === 'missing'
      ).length;
      const missingText =
        missing > 0
          ? ` (${plural(missing, 'não encontrado', 'não encontrados')})`
          : '';
      enqueueSnackbar(
        `${created?.name ?? 'Grimório'} importado: ${plural(
          result.value.itemIds.length,
          'item',
          'itens'
        )}${missingText}.`,
        {
          ...GRIMOIRE_SNACKBAR,
          variant: 'success',
          action: (key) => (
            <Button
              color='inherit'
              size='small'
              onClick={() => {
                dispatch(setActive(id));
                closeSnackbar(key);
              }}
            >
              Tornar ativo
            </Button>
          ),
        }
      );
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Importar grimório</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_event, value: 'file' | 'text') => {
            setTab(value);
            setError('');
          }}
          sx={{ mb: 2 }}
        >
          <Tab value='file' label='Arquivo' />
          <Tab value='text' label='Colar texto' />
        </Tabs>
        {tab === 'file' ? (
          <Box>
            <Button
              component='label'
              variant='outlined'
              startIcon={<FileUploadOutlinedIcon />}
            >
              Escolher arquivo .json
              <input
                hidden
                type='file'
                accept='.json,application/json'
                onChange={handleFile}
              />
            </Button>
            {fileName && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                {fileName}
              </Typography>
            )}
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={14}
            label='JSON do grimório'
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
          />
        )}
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Typography
          variant='caption'
          sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
        >
          A importação sempre cria um grimório novo. Nada é sobrescrito.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={handleImport}
          disabled={text.trim().length === 0}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportGrimoireDialog;
