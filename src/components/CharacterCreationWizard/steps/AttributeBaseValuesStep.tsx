import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import Race, { RaceAttributeAbility } from '@/interfaces/Race';

interface AttributeBaseValuesStepProps {
  race: Race;
  baseAttributes: Record<Atributo, number>;
  raceAttributeChoices?: Atributo[]; // For races with 'any' attributes
  onChange: (attributes: Record<Atributo, number>) => void;
}

const AttributeBaseValuesStep: React.FC<AttributeBaseValuesStepProps> = ({
  race,
  baseAttributes,
  raceAttributeChoices,
  onChange,
}) => {
  const handleChange = (atributo: Atributo, value: string) => {
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 30) {
      onChange({
        ...baseAttributes,
        [atributo]: numValue,
      });
    }
  };

  // Calculate racial modifier (applied to modifier, not value)
  const getRacialModifier = (atributo: Atributo): number => {
    let modifier = 0;

    race.attributes.attrs.forEach((attr: RaceAttributeAbility) => {
      if (attr.attr === atributo) {
        modifier += attr.mod;
      } else if (
        attr.attr === 'any' &&
        raceAttributeChoices?.includes(atributo)
      ) {
        modifier += attr.mod;
      }
    });

    return modifier;
  };

  const getModifier = (value: number): number => Math.floor((value - 10) / 2);

  const allAttributes = Object.values(Atributo);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Defina os valores base dos atributos do seu personagem. Os modificadores
        da raça {race.name} serão aplicados automaticamente.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {allAttributes.map((atributo) => {
          const baseValue = baseAttributes[atributo] || 10;
          const baseMod = getModifier(baseValue);
          const racialModifier = getRacialModifier(atributo);
          const finalMod = baseMod + racialModifier;

          return (
            <Box key={atributo}>
              <Paper sx={{ p: 2 }}>
                <Typography variant='h6' gutterBottom>
                  {atributo}
                </Typography>

                <TextField
                  fullWidth
                  type='number'
                  label='Valor Base'
                  value={baseValue}
                  onChange={(e) => handleChange(atributo, e.target.value)}
                  inputProps={{ min: 0, max: 30 }}
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Modificador Racial:
                  </Typography>
                  <Typography
                    variant='body2'
                    color={
                      racialModifier > 0 ? 'success.main' : 'text.secondary'
                    }
                    fontWeight='bold'
                  >
                    {racialModifier > 0
                      ? `+${racialModifier}`
                      : racialModifier || '0'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                  }}
                >
                  <Typography variant='body1' fontWeight='bold'>
                    Valor Final:
                  </Typography>
                  <Typography variant='h6' color='primary.main'>
                    {baseValue} ({finalMod >= 0 ? `+${finalMod}` : finalMod})
                  </Typography>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </Box>

      <Alert severity='info'>
        Valores recomendados: distribua 78 pontos entre os atributos usando
        point-buy, ou use os valores padrão (15, 14, 13, 12, 10, 8) conforme o
        manual.
      </Alert>
    </Box>
  );
};

export default AttributeBaseValuesStep;
