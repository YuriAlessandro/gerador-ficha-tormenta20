import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Divindade from '@/interfaces/Divindade';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { GeneralPower } from '@/interfaces/Poderes';

interface DeityPowerEditDrawerProps {
  open: boolean;
  onClose: () => void;
  deity: Divindade;
  sheet: CharacterSheet;
  onSave: (selectedPowers: GeneralPower[]) => void;
}

const DeityPowerEditDrawer: React.FC<DeityPowerEditDrawerProps> = ({
  open,
  onClose,
  deity,
  sheet,
  onSave,
}) => {
  // Determine how many powers to select based on class
  const { qtdPoderesConcedidos } = sheet.classe;
  const getsAllPowers = qtdPoderesConcedidos === 'all';
  const requiredCount =
    typeof qtdPoderesConcedidos === 'number' ? qtdPoderesConcedidos : 1;

  const [selectedPowers, setSelectedPowers] = useState<GeneralPower[]>([]);

  // Reset selections when drawer opens or deity changes
  useEffect(() => {
    if (open) {
      // If class gets all powers, select them all
      if (getsAllPowers) {
        setSelectedPowers(deity.poderes);
      } else if (
        sheet.devoto?.poderes &&
        sheet.devoto.divindade.name === deity.name
      ) {
        // If sheet has previously selected powers for this deity, use them
        setSelectedPowers(sheet.devoto.poderes);
      } else {
        setSelectedPowers([]);
      }
    }
  }, [open, deity.name, deity.poderes, getsAllPowers, sheet.devoto]);

  const handleSave = () => {
    onSave(selectedPowers);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original selections
    if (getsAllPowers) {
      setSelectedPowers(deity.poderes);
    } else if (
      sheet.devoto?.poderes &&
      sheet.devoto.divindade.name === deity.name
    ) {
      setSelectedPowers(sheet.devoto.poderes);
    } else {
      setSelectedPowers([]);
    }
    onClose();
  };

  // If class gets all powers, show confirmation message
  if (getsAllPowers) {
    return (
      <Drawer
        anchor='right'
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 600 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h6'>Poderes Concedidos</Typography>
            <IconButton onClick={handleCancel} size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Como {sheet.classe.name}, você recebe todos os poderes concedidos
            por {deity.name} automaticamente.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Poderes Concedidos Automaticamente:
            </Typography>

            {deity.poderes.map((power) => (
              <Box key={power.name} sx={{ mb: 2 }}>
                <Typography variant='subtitle2' fontWeight='bold'>
                  {power.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {power.description}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Alert severity='success' sx={{ mb: 3 }}>
            Nenhuma seleção necessária - todos os poderes serão concedidos
            automaticamente.
          </Alert>

          <Stack direction='row' spacing={2}>
            <Button fullWidth variant='contained' onClick={handleSave}>
              Confirmar
            </Button>
            <Button fullWidth variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    );
  }

  // User must choose powers
  const handleToggle = (power: GeneralPower) => {
    const isSelected = selectedPowers.some((p) => p.name === power.name);

    if (isSelected) {
      // Remove power
      setSelectedPowers(selectedPowers.filter((p) => p.name !== power.name));
    } else if (selectedPowers.length < requiredCount) {
      // Add power if under limit
      setSelectedPowers([...selectedPowers, power]);
    }
  };

  const isComplete = selectedPowers.length === requiredCount;

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Poderes Concedidos</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          Como {sheet.classe.name}, você pode escolher {requiredCount} poder
          {requiredCount > 1 ? 'es' : ''} concedido
          {requiredCount > 1 ? 's' : ''} por {deity.name}. Selecione abaixo:
        </Typography>

        <Typography
          variant='caption'
          color={isComplete ? 'success.main' : 'warning.main'}
          sx={{ mb: 3, display: 'block' }}
        >
          Selecionados: {selectedPowers.length} / {requiredCount}
        </Typography>

        <Box sx={{ maxHeight: '60vh', overflow: 'auto', mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            {deity.poderes.map((power) => {
              const isSelected = selectedPowers.some(
                (p) => p.name === power.name
              );
              const isDisabled =
                !isSelected && selectedPowers.length >= requiredCount;

              return (
                <Box
                  key={power.name}
                  sx={{
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(power)}
                        disabled={isDisabled}
                      />
                    }
                    label={
                      <Typography fontWeight='bold'>{power.name}</Typography>
                    }
                  />
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ ml: 4 }}
                  >
                    {power.description}
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Box>

        {!isComplete && selectedPowers.length > 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Selecione {requiredCount - selectedPowers.length} poder
            {requiredCount - selectedPowers.length > 1 ? 'es' : ''} adicional
            {requiredCount - selectedPowers.length > 1 ? 'is' : ''} para
            continuar.
          </Alert>
        )}

        {isComplete && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Poderes selecionados com sucesso!
          </Alert>
        )}

        <Stack direction='row' spacing={2}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleSave}
            disabled={!isComplete}
          >
            Salvar
          </Button>
          <Button fullWidth variant='outlined' onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default DeityPowerEditDrawer;
