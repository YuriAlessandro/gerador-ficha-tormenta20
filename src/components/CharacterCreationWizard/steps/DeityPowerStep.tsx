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
import {
  getPowerDeityNames,
  isDualDevotionPower,
} from '@/functions/powers/grantedPowerPool';

interface DeityPowerStepProps {
  classe: ClassDescription;
  deity: Divindade | null;
  /** Devoção Dupla: a segunda divindade, quando houver. */
  secondaryDeity?: Divindade | null;
  /**
   * Piscina de onde escolher — a união das listas dos deuses da devoção, já
   * montada pelo assistente. A QUANTIDADE escolhível não muda com a devoção
   * dupla, só a origem das opções.
   */
  powerPool: GeneralPower[];
  selectedPowers: string[];
  onChange: (powers: string[]) => void;
}

const DeityPowerStep: React.FC<DeityPowerStepProps> = ({
  classe,
  deity,
  secondaryDeity = null,
  powerPool,
  selectedPowers,
  onChange,
}) => {
  // Determine how many deity powers to select
  const { qtdPoderesConcedidos } = classe;

  // If no deity selected
  if (!deity) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant='body1'
          sx={{
            color: 'text.secondary',
          }}
        >
          Você não selecionou uma divindade.
        </Typography>
        <Alert severity='info'>Você pode continuar para o próximo passo.</Alert>
      </Box>
    );
  }

  // If 'all', grant all powers automatically
  if (qtdPoderesConcedidos === 'all') {
    const allPowerNames = powerPool.map((p) => p.name);

    // Auto-select all powers if not already selected
    if (selectedPowers.length !== allPowerNames.length) {
      onChange(allPowerNames);
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
          variant='body1'
          sx={{
            color: 'text.secondary',
          }}
        >
          A classe {classe.name} concede todos os poderes de{' '}
          {[deity.name, ...(secondaryDeity ? [secondaryDeity.name] : [])].join(
            ' e '
          )}{' '}
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

  const availablePowers = powerPool;
  const deityNames = [
    deity.name,
    ...(secondaryDeity ? [secondaryDeity.name] : []),
  ];
  const deityLabel = deityNames.join(' e ');

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
      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
        }}
      >
        Selecione até {maxPowers} {maxPowers === 1 ? 'poder' : 'poderes'}{' '}
        {maxPowers === 1 ? 'concedido' : 'concedidos'} por {deityLabel}. Esta
        etapa é opcional.
      </Typography>
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
        }}
      >
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
                    <Typography variant='subtitle1'>
                      {power.name}
                      {secondaryDeity && (
                        <Typography
                          component='span'
                          variant='caption'
                          sx={{ ml: 1, color: 'text.secondary' }}
                        >
                          {isDualDevotionPower(power)
                            ? '· exclusivo do sincretismo'
                            : `· ${getPowerDeityNames(power, deityNames).join(
                                ' e '
                              )}`}
                        </Typography>
                      )}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
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
