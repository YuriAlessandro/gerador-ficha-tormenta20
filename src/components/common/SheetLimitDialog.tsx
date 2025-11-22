import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import FolderIcon from '@mui/icons-material/Folder';

interface SheetLimitDialogProps {
  open: boolean;
  onClose: () => void;
  currentCount: number;
  maxCount: number;
  tierName: string;
}

/**
 * Dialog shown when user reaches sheet creation limit
 * Offers options to upgrade or manage existing sheets
 */
const SheetLimitDialog: React.FC<SheetLimitDialogProps> = ({
  open,
  onClose,
  currentCount,
  maxCount,
  tierName,
}) => {
  const history = useHistory();

  const handleUpgrade = () => {
    onClose();
    history.push('/pricing');
  };

  const handleManageSheets = () => {
    onClose();
    history.push('/meus-personagens');
  };

  const progress = (currentCount / maxCount) * 100;
  const isFree = tierName === 'Gratuito' || tierName === 'FREE';

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color='warning' />
          <Typography variant='h6' component='span'>
            Limite de Fichas Atingido
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Você atingiu o limite de <strong>{maxCount} fichas</strong> do plano{' '}
          <strong>{tierName}</strong>.
        </DialogContentText>

        {/* Progress indicator */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Fichas utilizadas
            </Typography>
            <Typography variant='body2' fontWeight='bold'>
              {currentCount}/{maxCount}
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={progress}
            color={progress >= 100 ? 'error' : 'warning'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Alert with suggestions */}
        {isFree ? (
          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              Com o <strong>Plano Simples</strong> você pode criar até{' '}
              <strong>50 fichas</strong>!
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Além de fichas ilimitadas de diários e cadernos, comentários em
              builds e muito mais.
            </Typography>
          </Alert>
        ) : (
          <Alert severity='warning' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              Você precisará deletar algumas fichas existentes para criar novas,
              ou considere fazer upgrade para um plano superior.
            </Typography>
          </Alert>
        )}

        <DialogContentText variant='body2' color='text.secondary'>
          {isFree
            ? 'Faça upgrade para continuar criando fichas ou delete algumas fichas antigas.'
            : 'Delete algumas fichas antigas para liberar espaço.'}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color='inherit'>
          Cancelar
        </Button>
        <Button
          onClick={handleManageSheets}
          variant='outlined'
          startIcon={<FolderIcon />}
        >
          Gerenciar Fichas
        </Button>
        {isFree && (
          <Button
            onClick={handleUpgrade}
            variant='contained'
            startIcon={<UpgradeIcon />}
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              },
            }}
          >
            Ver Planos
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SheetLimitDialog;
