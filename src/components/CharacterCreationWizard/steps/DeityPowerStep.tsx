import React from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { ClassDescription } from '@/interfaces/Class';
import Divindade from '@/interfaces/Divindade';
import { GeneralPower } from '@/interfaces/Poderes';

interface DeityPowerStepProps {
  classe: ClassDescription;
  deity: Divindade | null;
  selectedPowers: string[];
  onChange: (powers: string[]) => void;
}

const DeityPowerStep: React.FC<DeityPowerStepProps> = ({
  classe,
  deity,
  selectedPowers,
  onChange,
}) => {
  // Determine how many deity powers to select
  const { qtdPoderesConcedidos } = classe;

  // If no deity selected
  if (!deity) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          Você não selecionou uma divindade.
        </Typography>
        <Alert severity='info'>Você pode continuar para o próximo passo.</Alert>
      </Box>
    );
  }

  // If 'all', grant all powers automatically
  if (qtdPoderesConcedidos === 'all') {
    const allPowerNames = deity.poderes.map((p) => p.name);

    // Auto-select all powers if not already selected
    if (selectedPowers.length !== allPowerNames.length) {
      onChange(allPowerNames);
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          A classe {classe.name} concede todos os poderes de {deity.name}
          automaticamente.
        </Typography>
        <Alert severity='success'>
          Você receberá todos os {allPowerNames.length} poderes da divindade.
          Pode continuar para o próximo passo.
        </Alert>
      </Box>
    );
  }

  // Otherwise, allow selection (default to 1 if undefined)
  const requiredCount = (qtdPoderesConcedidos as number) ?? 1;
  const availablePowers = deity.poderes;

  const handleToggle = (power: GeneralPower) => {
    const isSelected = selectedPowers.includes(power.name);

    if (isSelected) {
      // Remove power
      onChange(selectedPowers.filter((p) => p !== power.name));
    } else if (selectedPowers.length < requiredCount) {
      // Add power if under limit
      onChange([...selectedPowers, power.name]);
    }
  };

  const isComplete = selectedPowers.length === requiredCount;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        A classe {classe.name} permite escolher {requiredCount} poder
        {requiredCount > 1 ? 'es' : ''} concedido{requiredCount > 1 ? 's' : ''}{' '}
        de {deity.name}. Selecione abaixo:
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionados: {selectedPowers.length} / {requiredCount}
      </Typography>

      <Paper sx={{ p: 2 }}>
        {availablePowers.map((power) => {
          const isSelected = selectedPowers.includes(power.name);
          const isDisabled =
            !isSelected && selectedPowers.length >= requiredCount;

          return (
            <Box key={power.name} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggle(power)}
                    disabled={isDisabled}
                  />
                }
                label={
                  <Box>
                    <Typography variant='subtitle1'>{power.name}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {power.description}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          );
        })}
      </Paper>

      {!isComplete && selectedPowers.length > 0 && (
        <Alert severity='warning'>
          Selecione {requiredCount - selectedPowers.length} poder
          {requiredCount - selectedPowers.length > 1 ? 'es' : ''} adicional
          {requiredCount - selectedPowers.length > 1 ? 'is' : ''} para
          continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Poderes selecionados com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default DeityPowerStep;
