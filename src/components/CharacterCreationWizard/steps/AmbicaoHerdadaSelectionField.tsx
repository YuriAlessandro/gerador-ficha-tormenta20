import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';

interface AmbicaoHerdadaSelectionFieldProps {
  availableGeneralPowers: GeneralPower[];
  availableOriginPowers: OriginPower[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const AmbicaoHerdadaSelectionField: React.FC<
  AmbicaoHerdadaSelectionFieldProps
> = ({
  availableGeneralPowers,
  availableOriginPowers,
  selections,
  onChange,
}) => {
  const [choiceType, setChoiceType] = useState<'generalPower' | 'originPower'>(
    () => (selections.originPower ? 'originPower' : 'generalPower')
  );

  const selectedGeneralPower = selections.powers?.[0];
  const selectedOriginPower = selections.originPower;

  const handleChoiceTypeChange = (type: 'generalPower' | 'originPower') => {
    setChoiceType(type);
    onChange({
      ...selections,
      powers: [],
      originPower: undefined,
    });
  };

  const handleGeneralPowerChange = (powerName: string) => {
    const power = availableGeneralPowers.find((p) => p.name === powerName);
    if (power) {
      onChange({
        ...selections,
        powers: [power],
        originPower: undefined,
      });
    }
  };

  const handleOriginPowerChange = (powerName: string) => {
    const power = availableOriginPowers.find((p) => p.name === powerName);
    if (power) {
      onChange({
        ...selections,
        powers: [],
        originPower: power,
      });
    }
  };

  const sortedGeneralPowers = [...availableGeneralPowers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedOriginPowers = [...availableOriginPowers].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Ambição Herdada:</strong> Você recebe um poder geral ou poder
          único de origem a sua escolha.
        </Typography>
      </Alert>
      <FormControl component='fieldset'>
        <RadioGroup
          row
          value={choiceType}
          onChange={(e) =>
            handleChoiceTypeChange(
              e.target.value as 'generalPower' | 'originPower'
            )
          }
        >
          <FormControlLabel
            value='generalPower'
            control={<Radio />}
            label='Poder Geral'
          />
          <FormControlLabel
            value='originPower'
            control={<Radio />}
            label='Poder Único de Origem'
          />
        </RadioGroup>
      </FormControl>
      {choiceType === 'generalPower' && (
        <FormControl fullWidth>
          <InputLabel id='ambicao-herdada-general-power-label'>
            Poder Geral *
          </InputLabel>
          <Select
            labelId='ambicao-herdada-general-power-label'
            value={selectedGeneralPower?.name || ''}
            label='Poder Geral *'
            onChange={(e) => handleGeneralPowerChange(e.target.value as string)}
          >
            {sortedGeneralPowers.map((power) => (
              <MenuItem key={power.name} value={power.name}>
                <Box>
                  <Typography>{power.name}</Typography>
                  {power.description && (
                    <Typography
                      variant='caption'
                      component='div'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {power.description.length > 100
                        ? `${power.description.substring(0, 100)}...`
                        : power.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {choiceType === 'originPower' && (
        <FormControl fullWidth>
          <InputLabel id='ambicao-herdada-origin-power-label'>
            Poder Único de Origem *
          </InputLabel>
          <Select
            labelId='ambicao-herdada-origin-power-label'
            value={selectedOriginPower?.name || ''}
            label='Poder Único de Origem *'
            onChange={(e) => handleOriginPowerChange(e.target.value as string)}
          >
            {sortedOriginPowers.map((power) => (
              <MenuItem key={power.name} value={power.name}>
                <Box>
                  <Typography>{power.name}</Typography>
                  {power.description && (
                    <Typography
                      variant='caption'
                      component='div'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {power.description.length > 100
                        ? `${power.description.substring(0, 100)}...`
                        : power.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box sx={{ mt: 1 }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
          }}
        >
          <strong>Resumo:</strong>
          {choiceType === 'generalPower' && selectedGeneralPower && (
            <>
              {' '}
              Poder Geral: <em>{selectedGeneralPower.name}</em>
            </>
          )}
          {choiceType === 'originPower' && selectedOriginPower && (
            <>
              {' '}
              Poder Único de Origem: <em>{selectedOriginPower.name}</em>
            </>
          )}
          {!selectedGeneralPower && !selectedOriginPower && (
            <> Nenhuma seleção ainda</>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default AmbicaoHerdadaSelectionField;
