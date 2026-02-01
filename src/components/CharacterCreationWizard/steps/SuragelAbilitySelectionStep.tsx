import React from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Chip,
} from '@mui/material';
import { SURAGEL_ALTERNATIVE_ABILITIES } from '@/data/systems/tormenta20/deuses-de-arton/races/suragelAbilities';

interface SuragelAbilitySelectionStepProps {
  raceName: string;
  selectedAbility: string | undefined;
  onChange: (ability: string | undefined) => void;
}

const SuragelAbilitySelectionStep: React.FC<
  SuragelAbilitySelectionStepProps
> = ({ raceName, selectedAbility, onChange }) => {
  const isAggelus = raceName.includes('Aggelus');
  const defaultAbilityName = isAggelus ? 'Luz Sagrada' : 'Sombras Profanas';
  const defaultAbilityDescription = isAggelus
    ? 'Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.'
    : 'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // Empty string means keep default (undefined)
    onChange(value === '' ? undefined : value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Como Suraggel, você pode substituir sua habilidade racial padrão (
        {defaultAbilityName}) por uma habilidade de outro Plano. Esta escolha é
        permanente.
      </Typography>

      <RadioGroup value={selectedAbility || ''} onChange={handleChange}>
        {/* Default ability option */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value=''
            control={<Radio />}
            label={
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant='h6'>{defaultAbilityName}</Typography>
                  <Chip
                    label='Padrão'
                    size='small'
                    color='primary'
                    variant='outlined'
                  />
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {defaultAbilityDescription}
                </Typography>
              </Box>
            }
          />
        </Paper>

        {/* Alternative abilities */}
        {SURAGEL_ALTERNATIVE_ABILITIES.map((ability) => (
          <Paper key={ability.name} sx={{ p: 2, mb: 2 }}>
            <FormControlLabel
              value={ability.name}
              control={<Radio />}
              label={
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='h6'>{ability.name}</Typography>
                    <Chip
                      label='Deuses de Arton'
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                    <Chip
                      label={ability.plano}
                      size='small'
                      variant='outlined'
                      sx={{ opacity: 0.7 }}
                    />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {ability.description}
                  </Typography>
                  {ability.sheetBonuses && ability.sheetBonuses.length > 0 && (
                    <Typography
                      variant='caption'
                      color='success.main'
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Bônus automáticos aplicados
                    </Typography>
                  )}
                  {ability.sheetActions && ability.sheetActions.length > 0 && (
                    <Typography
                      variant='caption'
                      color='info.main'
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Requer seleção adicional
                    </Typography>
                  )}
                </Box>
              }
            />
          </Paper>
        ))}
      </RadioGroup>

      <Alert severity='info'>
        {selectedAbility
          ? `Você escolheu ${selectedAbility}. Esta habilidade substituirá ${defaultAbilityName}.`
          : `Você manterá a habilidade padrão: ${defaultAbilityName}.`}
      </Alert>
    </Box>
  );
};

export default SuragelAbilitySelectionStep;
