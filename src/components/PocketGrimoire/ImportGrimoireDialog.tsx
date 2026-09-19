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
  replaceItems,
  selectGrimoireById,
  setActive,
  WithPocketGrimoire,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { parseGrimoireImport } from '../../functions/pocketGrimoire/exchange';
import { resolveItem } from '../../functions/pocketGrimoire/resolveItems';
import { PocketGrimoire } from '../../interfaces/PocketGrimoire';
import { GRIMOIRE_SNACKBAR } from './grimoireSnackbar';

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * Com ele, o arquivo substitui os itens deste grimório (mantendo o nome),
   * depois de uma confirmação. Sem ele, a importação cria um grimório novo.
   */
  replaceTarget?: PocketGrimoire;
  /** Chamado com o id do grimório novo (só no modo criar). */
  onImported?: (id: string) => void;
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

const missingNote = (itemIds: string[]) => {
  const missing = itemIds.filter(
    (itemId) => resolveItem(itemId).kind === 'missing'
  ).length;
  return missing > 0
    ? ` (${plural(missing, 'não encontrado', 'não encontrados')})`
    : '';
};

const ImportGrimoireDialog: React.FC<Props> = ({
  open,
  onClose,
  replaceTarget,
  onImported,
}) => {
  const dispatch = useAppDispatch();
  const store = useStore<WithPocketGrimoire>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  /** Itens lidos do arquivo, esperando a confirmação da substituição. */
  const [pending, setPending] = useState<string[] | null>(null);

  useEffect(() => {
    if (open) {
      setTab('file');
      setText('');
      setFileName('');
      setError('');
      setPending(null);
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

  const importAsNew = (name: string, itemIds: string[]) => {
    const action = dispatch(importGrimoire(name, itemIds));
    const { id } = action.payload;
    const created = selectGrimoireById(id)(store.getState());
    enqueueSnackbar(
      `${created?.name ?? 'Grimório'} importado: ${plural(
        itemIds.length,
        'item',
        'itens'
      )}${missingNote(itemIds)}.`,
      {
        ...GRIMOIRE_SNACKBAR,
        variant: 'success',
        action: onImported
          ? undefined
          : (key) => (
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
    onImported?.(id);
    onClose();
  };

  const confirmReplace = () => {
    if (!replaceTarget || !pending) return;
    const current = selectGrimoireById(replaceTarget.id)(store.getState());
    const previous = current?.itemIds ?? [];
    dispatch(replaceItems(replaceTarget.id, pending));
    enqueueSnackbar(
      `"${replaceTarget.name}" substituído: ${plural(
        pending.length,
        'item',
        'itens'
      )}${missingNote(pending)}.`,
      {
        ...GRIMOIRE_SNACKBAR,
        variant: 'success',
        action: (key) => (
          <Button
            color='inherit'
            size='small'
            onClick={() => {
              dispatch(replaceItems(replaceTarget.id, previous));
              closeSnackbar(key);
            }}
          >
            Desfazer
          </Button>
        ),
      }
    );
    onClose();
  };

  const handleImport = () => {
    const result = parseGrimoireImport(text);
    if (!result.ok) setError(result.error);
    else if (replaceTarget) setPending(result.value.itemIds);
    else importAsNew(result.value.name, result.value.itemIds);
  };

  const title = replaceTarget ? 'Importar e substituir' : 'Importar grimório';

  if (replaceTarget && pending) {
    const currentCount =
      selectGrimoireById(replaceTarget.id)(store.getState())?.itemIds.length ??
      0;
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
        <DialogTitle>Substituir “{replaceTarget.name}”?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            O conteúdo atual de “{replaceTarget.name}” (
            {plural(currentCount, 'item', 'itens')}) será trocado pelos{' '}
            {plural(pending.length, 'item', 'itens')} do arquivo. O nome do
            grimório não muda.
          </Typography>
          <Typography
            variant='caption'
            sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}
          >
            Logo depois, dá para desfazer pela notificação. Para guardar o
            conteúdo atual de vez, exporte antes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Voltar</Button>
          <Button color='error' variant='contained' onClick={confirmReplace}>
            Substituir
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{title}</DialogTitle>
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
          {replaceTarget
            ? `Os itens de “${replaceTarget.name}” serão trocados pelos do arquivo; o nome é mantido. Você confirma antes.`
            : 'A importação sempre cria um grimório novo. Nada é sobrescrito.'}
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
