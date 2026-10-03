import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createGrimoire,
  selectActiveId,
  selectGrimoires,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { SEO } from '../SEO';
import { useAuth } from '../../hooks/useAuth';
import TormentaTitle from '../Database/TormentaTitle';
import GrimoireMenu from './GrimoireMenu';
import { useGrimoireLimit } from './useGrimoireLimit';
import GrimoireSyncIndicator from './GrimoireSyncIndicator';
import GrimoireLoginHint from './GrimoireLoginHint';
import { useRequestGrimoireSync } from './usePocketGrimoireSync';
import GrimoireNameDialog from './GrimoireNameDialog';
import ImportGrimoireDialog from './ImportGrimoireDialog';

const describeGrimoire = (count: number, updatedAt: string) => {
  const items = `${count} ${count === 1 ? 'item' : 'itens'}`;
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime())
    ? items
    : `${items} · editado em ${date.toLocaleDateString('pt-BR')}`;
};

const PocketGrimoireListPage: React.FC = () => {
  useRequestGrimoireSync();
  const { isAuthenticated } = useAuth();
  const { ensureCanCreate, ensureUnlocked, lockedIds } = useGrimoireLimit();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const grimoires = useAppSelector(selectGrimoires);
  const activeId = useAppSelector(selectActiveId);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  return (
    <>
      <SEO
        title='Grimório de bolso'
        description='Junte magias, poderes e habilidades de Tormenta 20 para consultar na mesa.'
        url='/grimorio'
      />
      <Container maxWidth='md' sx={{ py: 3 }}>
        <TormentaTitle variant='h4' centered gradient sx={{ mb: 3 }}>
          Meus grimórios de bolso
        </TormentaTitle>

        <Stack
          direction='row'
          spacing={1}
          useFlexGap
          sx={{ mb: 2, flexWrap: 'wrap' }}
        >
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => {
              if (ensureCanCreate()) setCreating(true);
            }}
          >
            Novo
          </Button>
          <Button
            variant='outlined'
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => setImporting(true)}
          >
            Importar
          </Button>
          <Button
            component={RouterLink}
            to='/database'
            startIcon={<StorageIcon />}
            sx={{ ml: { sm: 'auto' } }}
          >
            Ir para a enciclopédia
          </Button>
          <GrimoireSyncIndicator />
        </Stack>
        <GrimoireLoginHint sx={{ mt: -1, mb: 2 }} />

        <Stack spacing={1.5}>
          {grimoires.map((grimoire) => {
            // Acima do limite: aparece, mas não abre (nem mostra o conteúdo).
            const locked = lockedIds.has(grimoire.id);
            return (
              <Card
                key={grimoire.id}
                variant='outlined'
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  opacity: locked ? 0.75 : 1,
                }}
              >
                <CardActionArea
                  onClick={() => {
                    if (ensureUnlocked(grimoire.id)) {
                      history.push(`/grimorio/${grimoire.id}`);
                    }
                  }}
                  sx={{ flex: 1, p: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {locked && (
                      <LockOutlinedIcon
                        fontSize='small'
                        sx={{ color: 'text.secondary' }}
                      />
                    )}
                    <Typography
                      sx={{ fontFamily: 'Tfont, serif', fontWeight: 600 }}
                    >
                      {grimoire.name}
                    </Typography>
                    {grimoire.id === activeId && !locked && (
                      <Chip label='ativo' size='small' color='primary' />
                    )}
                    {locked && (
                      <Chip
                        label='Acima do limite'
                        size='small'
                        color='warning'
                        variant='outlined'
                      />
                    )}
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {locked
                      ? 'Exclua algum grimório para liberar este.'
                      : describeGrimoire(
                          grimoire.itemIds.length,
                          grimoire.updatedAt
                        )}
                  </Typography>
                </CardActionArea>
                <Box sx={{ pr: 1 }}>
                  <GrimoireMenu
                    grimoire={grimoire}
                    isActive={grimoire.id === activeId}
                    locked={locked}
                  />
                </Box>
              </Card>
            );
          })}
        </Stack>

        {!isAuthenticated && (
          <Alert severity='warning' sx={{ mt: 3 }}>
            Grimórios ficam só neste navegador. Exporte para fazer backup ou
            levar para outro aparelho.
          </Alert>
        )}
      </Container>

      <GrimoireNameDialog
        open={creating}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const action = dispatch(createGrimoire(name));
          setCreating(false);
          history.push(`/grimorio/${action.payload.id}`);
        }}
        onImport={() => {
          setCreating(false);
          setImporting(true);
        }}
      />
      <ImportGrimoireDialog
        open={importing}
        onClose={() => setImporting(false)}
      />
    </>
  );
};

export default PocketGrimoireListPage;
