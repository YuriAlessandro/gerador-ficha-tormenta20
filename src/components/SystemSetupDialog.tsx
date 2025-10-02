import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { SupplementId, SUPPLEMENT_METADATA } from '../types/supplement.types';
import { SystemId } from '../types/system.types';

interface SystemSetupDialogProps {
  open: boolean;
  onComplete: (supplements: SupplementId[]) => Promise<void>;
  currentSupplements?: SupplementId[];
}

const SystemSetupDialog: React.FC<SystemSetupDialogProps> = ({
  open,
  onComplete,
  currentSupplements = [SupplementId.TORMENTA20_CORE],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedSupplements, setSelectedSupplements] =
    useState<SupplementId[]>(currentSupplements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtra apenas suplementos do Tormenta 20
  const tormenta20Supplements = Object.values(SUPPLEMENT_METADATA).filter(
    (s) => s.systemId === SystemId.TORMENTA20
  );

  const handleToggleSupplement = (supplementId: SupplementId) => {
    // Não permite desativar o CORE
    if (supplementId === SupplementId.TORMENTA20_CORE) {
      return;
    }

    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        return prev.filter((id) => id !== supplementId);
      }
      return [...prev, supplementId];
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onComplete(selectedSupplements);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao salvar configuração';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown
      onClose={(_, reason) => {
        // Previne fechar clicando fora - não faz nada se for backdrop click
        if (reason !== 'backdropClick') {
          // Pode adicionar lógica futura aqui se necessário
        }
      }}
    >
      <DialogTitle>
        <Stack spacing={1}>
          <Typography variant='h5' fontWeight='bold'>
            Bem-vindo ao Fichas de Nimb!
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Configure seus suplementos para começar
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Sistema Selecionado
          </Typography>
          <Chip
            label='Tormenta 20'
            color='primary'
            icon={<CheckIcon />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Box>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Suplementos Disponíveis
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ mb: 2 }}>
            Selecione os suplementos que deseja usar no gerador de fichas
          </Typography>

          <FormGroup>
            {tormenta20Supplements.map((supplement) => {
              const isCore = supplement.id === SupplementId.TORMENTA20_CORE;
              const isSelected = selectedSupplements.includes(supplement.id);

              return (
                <Box
                  key={supplement.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isSelected
                      ? 'action.selected'
                      : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSupplement(supplement.id)}
                        disabled={isCore || loading}
                      />
                    }
                    label={
                      <Stack spacing={0.5}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Typography variant='body1' fontWeight='medium'>
                            {supplement.name}
                          </Typography>
                          {isCore && (
                            <Chip
                              label='Obrigatório'
                              size='small'
                              color='primary'
                              sx={{ height: 20 }}
                            />
                          )}
                        </Stack>
                        <Typography variant='caption' color='text.secondary'>
                          {supplement.description}
                        </Typography>
                      </Stack>
                    }
                  />
                </Box>
              );
            })}
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleSave}
          variant='contained'
          fullWidth
          size='large'
          disabled={loading || selectedSupplements.length === 0}
        >
          {loading ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            'Salvar e Começar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemSetupDialog;
