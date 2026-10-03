import React from 'react';
import { Box, Tooltip } from '@mui/material';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined';
import { useAppSelector } from '../../store/hooks';
import { useAuth } from '../../hooks/useAuth';
import { selectGrimoireSyncStatus } from '../../store/slices/pocketGrimoire/pocketGrimoireSyncStatusSlice';
import { selectHasPendingGrimoireChanges } from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import { GrimoireSyncStatus } from '../../interfaces/PocketGrimoire';

type IndicatorKind = 'saved' | 'syncing' | 'offline' | 'error';

export function syncIndicatorView(
  status: GrimoireSyncStatus,
  pending: boolean
): { kind: IndicatorKind; label: string } {
  if (status === 'offline') {
    return {
      kind: 'offline',
      label:
        'Sem conexão: as alterações serão enviadas quando a conexão voltar',
    };
  }
  if (status === 'error') {
    return { kind: 'error', label: 'Erro ao salvar na conta' };
  }
  if (status === 'syncing' || pending) {
    return { kind: 'syncing', label: 'Sincronizando…' };
  }
  return { kind: 'saved', label: 'Salvo na sua conta' };
}

const ICONS: Record<IndicatorKind, React.ReactElement> = {
  saved: <CloudDoneOutlinedIcon fontSize='small' color='success' />,
  syncing: <CloudSyncOutlinedIcon fontSize='small' color='action' />,
  offline: <CloudOffOutlinedIcon fontSize='small' color='warning' />,
  error: <SyncProblemOutlinedIcon fontSize='small' color='error' />,
};

/** Ícone discreto com o estado da conta. Só para quem está logado. */
const GrimoireSyncIndicator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const status = useAppSelector(selectGrimoireSyncStatus);
  const pending = useAppSelector(selectHasPendingGrimoireChanges);
  if (!isAuthenticated) return null;

  const { kind, label } = syncIndicatorView(status, pending);
  return (
    <Tooltip title={label} enterTouchDelay={0}>
      <Box
        component='span'
        role='img'
        aria-label={label}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        {ICONS[kind]}
      </Box>
    </Tooltip>
  );
};

export default GrimoireSyncIndicator;
