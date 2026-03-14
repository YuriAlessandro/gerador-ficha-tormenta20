import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { CompanionSheet, CompanionTrick } from '@/interfaces/Companion';
import { getAvailableTricks } from '@/data/systems/tormenta20/herois-de-arton/companion';
import { CompanionTrickDefinition } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';

interface CompanionTrickSelectionStepProps {
  companion: CompanionSheet;
  trainerLevel: number;
  selectedTrick?: CompanionTrick;
  onSelectTrick: (trick: CompanionTrick | undefined) => void;
}

const CompanionTrickSelectionStep: React.FC<
  CompanionTrickSelectionStepProps
> = ({ companion, trainerLevel, selectedTrick, onSelectTrick }) => {
  const naturalWeaponCount = companion.naturalWeapons.length;

  const availableTricks: CompanionTrickDefinition[] = useMemo(
    () =>
      getAvailableTricks(
        trainerLevel,
        companion.companionType,
        companion.size,
        companion.tricks,
        naturalWeaponCount,
        false
      ),
    [
      trainerLevel,
      companion.companionType,
      companion.size,
      companion.tricks,
      naturalWeaponCount,
    ]
  );

  const handleToggleTrick = (trick: CompanionTrickDefinition) => {
    if (selectedTrick?.name === trick.name) {
      onSelectTrick(undefined);
    } else {
      onSelectTrick({ name: trick.name });
    }
  };

  const companionName = companion.name || 'Melhor Amigo';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='body1' color='text.secondary'>
        Escolha um novo truque para {companionName} ({companion.companionType}{' '}
        {companion.size}):
      </Typography>

      {availableTricks.length > 0 ? (
        <Box>
          {availableTricks.map((trick) => {
            const isSelected = selectedTrick?.name === trick.name;
            return (
              <Box key={trick.name} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleTrick(trick)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='subtitle1'>{trick.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {trick.text}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </Box>
            );
          })}
        </Box>
      ) : (
        <Alert severity='info'>
          Nenhum truque disponível para este nível e tipo de parceiro.
        </Alert>
      )}

      {selectedTrick && (
        <Alert severity='success'>
          Truque selecionado: <strong>{selectedTrick.name}</strong>
        </Alert>
      )}

      <Typography variant='caption' color='text.secondary'>
        Truques atuais: {companion.tricks.map((t) => t.name).join(', ')}
      </Typography>
    </Box>
  );
};

export default CompanionTrickSelectionStep;
