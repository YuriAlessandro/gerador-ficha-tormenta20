import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
} from '@mui/material';
import { CompanionSheet, CompanionTrick } from '@/interfaces/Companion';
import { getAvailableTricks } from '@/data/systems/tormenta20/herois-de-arton/companion';
import { CompanionTrickDefinition } from '@/data/systems/tormenta20/herois-de-arton/companion/companionTricks';
import { Atributo } from '@/data/systems/tormenta20/atributos';

const COMPANION_ATTRIBUTE_OPTIONS = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

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

  const handleChoiceChange = (choiceKey: string, value: string) => {
    if (selectedTrick) {
      onSelectTrick({
        ...selectedTrick,
        choices: { ...selectedTrick.choices, [choiceKey]: value },
      });
    }
  };

  const companionName = companion.name || 'Melhor Amigo';

  const isSelectionComplete = useMemo(() => {
    if (!selectedTrick) return false;
    const def = availableTricks.find((t) => t.name === selectedTrick.name);
    if (!def?.hasSubChoice) return true;
    if (def.subChoiceType === 'attribute')
      return (
        !!selectedTrick.choices?.primary && !!selectedTrick.choices?.secondary
      );
    if (def.subChoiceType === 'movement') return !!selectedTrick.choices?.type;
    return true;
  }, [selectedTrick, availableTricks]);

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
                {isSelected &&
                  trick.hasSubChoice &&
                  trick.subChoiceType === 'attribute' && (
                    <Box
                      sx={{
                        ml: 4,
                        mt: 1,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <FormControl size='small' sx={{ minWidth: 160 }}>
                        <InputLabel>Primário (+2)</InputLabel>
                        <Select
                          label='Primário (+2)'
                          value={selectedTrick?.choices?.primary || ''}
                          onChange={(e) =>
                            handleChoiceChange('primary', e.target.value)
                          }
                        >
                          {COMPANION_ATTRIBUTE_OPTIONS.map((attr) => (
                            <MenuItem key={attr} value={attr}>
                              {attr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size='small' sx={{ minWidth: 160 }}>
                        <InputLabel>Secundário (+1)</InputLabel>
                        <Select
                          label='Secundário (+1)'
                          value={selectedTrick?.choices?.secondary || ''}
                          onChange={(e) =>
                            handleChoiceChange('secondary', e.target.value)
                          }
                        >
                          {COMPANION_ATTRIBUTE_OPTIONS.filter(
                            (attr) => attr !== selectedTrick?.choices?.primary
                          ).map((attr) => (
                            <MenuItem key={attr} value={attr}>
                              {attr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                {isSelected &&
                  trick.hasSubChoice &&
                  trick.subChoiceType === 'movement' && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <RadioGroup
                        row
                        value={selectedTrick?.choices?.type || ''}
                        onChange={(e) =>
                          handleChoiceChange('type', e.target.value)
                        }
                      >
                        <FormControlLabel
                          value='Escalada'
                          control={<Radio size='small' />}
                          label='Escalada'
                        />
                        <FormControlLabel
                          value='Natação'
                          control={<Radio size='small' />}
                          label='Natação'
                        />
                      </RadioGroup>
                    </Box>
                  )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Alert severity='info'>
          Nenhum truque disponível para este nível e tipo de parceiro.
        </Alert>
      )}

      {selectedTrick && isSelectionComplete && (
        <Alert severity='success'>
          Truque selecionado: <strong>{selectedTrick.name}</strong>
        </Alert>
      )}

      {selectedTrick && !isSelectionComplete && (
        <Alert severity='warning'>
          Preencha as escolhas do truque para continuar.
        </Alert>
      )}

      <Typography variant='caption' color='text.secondary'>
        Truques atuais: {companion.tricks.map((t) => t.name).join(', ')}
      </Typography>
    </Box>
  );
};

export default CompanionTrickSelectionStep;
