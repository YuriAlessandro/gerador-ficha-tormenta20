import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Popper,
  SwipeableDrawer,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  createGrimoire,
  selectActiveGrimoire,
  selectGrimoires,
  setActive,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  groupResolvedItems,
  resolveItems,
} from '../../functions/pocketGrimoire/resolveItems';
import { safeBottom, safeRight } from '../../theme/safeArea';
import GrimoireItemList from './GrimoireItemList';
import GrimoireNameDialog from './GrimoireNameDialog';
import ImportGrimoireDialog from './ImportGrimoireDialog';
import { useRemoveFromGrimoire } from './useGrimoireUndo';

const NEW_OPTION = '__novo__';
const TITLE_ID = 'pocket-grimoire-panel-title';

const countLabel = (count: number) =>
  `${count} ${count === 1 ? 'item' : 'itens'}`;

const PocketGrimoireFab: React.FC = () => {
  const dispatch = useAppDispatch();
  const removeFromGrimoire = useRemoveFromGrimoire();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const grimoires = useAppSelector(selectGrimoires);
  const active = useAppSelector(selectActiveGrimoire);
  // Estado (não ref) para o Popper reagir quando a âncora existir.
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  const groups = useMemo(
    () => groupResolvedItems(resolveItems(active.itemIds)),
    [active.itemIds]
  );

  const closeOnMobile = () => {
    if (isMobile) setOpen(false);
  };

  const panel = (
    <Box
      role='dialog'
      aria-labelledby={TITLE_ID}
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuBookIcon color='primary' fontSize='small' />
        <Typography
          id={TITLE_ID}
          sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, flex: 1 }}
        >
          Grimório de bolso
        </Typography>
        <IconButton
          size='small'
          aria-label='Fechar'
          onClick={() => setOpen(false)}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <TextField
        select
        size='small'
        label='Grimório ativo'
        value={active.id}
        onChange={(event) => {
          if (event.target.value === NEW_OPTION) setCreating(true);
          else dispatch(setActive(event.target.value));
        }}
      >
        {grimoires.map((grimoire) => (
          <MenuItem key={grimoire.id} value={grimoire.id}>
            {grimoire.name} ({grimoire.itemIds.length})
          </MenuItem>
        ))}
        <MenuItem value={NEW_OPTION}>
          <AddIcon fontSize='small' sx={{ mr: 1 }} />
          Novo grimório
        </MenuItem>
      </TextField>

      <Box
        sx={{
          maxHeight: isMobile ? '45vh' : 320,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {groups.length === 0 ? (
          <Typography variant='body2' sx={{ color: 'text.secondary', py: 1 }}>
            Seu grimório está vazio. Use o ícone de marcador nos cards de magias
            e poderes para adicionar.
          </Typography>
        ) : (
          <GrimoireItemList
            groups={groups}
            onRemove={(itemId) => removeFromGrimoire(active, itemId)}
            onItemClick={closeOnMobile}
          />
        )}
      </Box>

      <Button
        component={RouterLink}
        to={`/grimorio/${active.id}`}
        variant='outlined'
        endIcon={<OpenInNewIcon />}
      >
        Abrir completo
      </Button>
    </Box>
  );

  return (
    <>
      <Fab
        ref={setAnchorEl}
        color='primary'
        aria-label={`Grimório de bolso: ${active.name}, ${countLabel(
          active.itemIds.length
        )}`}
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: 'fixed',
          bottom: safeBottom(16),
          right: safeRight(16),
          zIndex: (theme) => theme.zIndex.speedDial,
        }}
      >
        <Badge
          badgeContent={active.itemIds.length}
          color='secondary'
          showZero
          max={99}
        >
          <MenuBookIcon />
        </Badge>
      </Fab>

      {isMobile ? (
        <SwipeableDrawer
          anchor='bottom'
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                pb: safeBottom(8),
              },
            },
          }}
        >
          {panel}
        </SwipeableDrawer>
      ) : (
        // Sem ClickAwayListener de propósito: o balão não bloqueia a página,
        // então dá para seguir marcando itens nos cards com ele aberto.
        <Popper
          open={open && Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement='top-end'
          sx={{ zIndex: (theme) => theme.zIndex.speedDial + 1 }}
          modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
        >
          <Paper elevation={8} sx={{ width: 320, borderRadius: 3 }}>
            {panel}
          </Paper>
        </Popper>
      )}

      <GrimoireNameDialog
        open={creating}
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const action = dispatch(createGrimoire(name));
          dispatch(setActive(action.payload.id));
          setCreating(false);
        }}
        onImport={() => {
          setCreating(false);
          setImporting(true);
        }}
      />
      <ImportGrimoireDialog
        open={importing}
        onClose={() => setImporting(false)}
        onImported={(id) => dispatch(setActive(id))}
      />
    </>
  );
};

export default PocketGrimoireFab;
