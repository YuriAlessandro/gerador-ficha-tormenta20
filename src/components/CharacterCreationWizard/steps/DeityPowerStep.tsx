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

  const maxPowers =
    typeof qtdPoderesConcedidos === 'number' ? qtdPoderesConcedidos : 1;
  const isLimitReached = selectedPowers.length >= maxPowers;

  const availablePowers = deity.poderes;

  const handleToggle = (power: GeneralPower) => {
    const isSelected = selectedPowers.includes(power.name);

    if (isSelected) {
      onChange(selectedPowers.filter((p) => p !== power.name));
    } else if (selectedPowers.length < maxPowers) {
      onChange([...selectedPowers, power.name]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Selecione até {maxPowers} {maxPowers === 1 ? 'poder' : 'poderes'}{' '}
        {maxPowers === 1 ? 'concedido' : 'concedidos'} por {deity.name}. Esta
        etapa é opcional.
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionados: {selectedPowers.length} / {maxPowers}
      </Typography>

      <Paper sx={{ p: 2 }}>
        {availablePowers.map((power) => {
          const isSelected = selectedPowers.includes(power.name);
          const isDisabled = !isSelected && isLimitReached;

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

      {isLimitReached && (
        <Alert severity='info'>
          Limite de {maxPowers} {maxPowers === 1 ? 'poder' : 'poderes'}{' '}
          atingido.
        </Alert>
      )}

      {selectedPowers.length > 0 && !isLimitReached && (
        <Alert severity='success'>
          Poderes selecionados com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}

      {selectedPowers.length === 0 && (
        <Alert severity='info'>
          Você pode continuar sem selecionar poderes concedidos ou escolher até{' '}
          {maxPowers}.
        </Alert>
      )}
    </Box>
  );
};

export default DeityPowerStep;
