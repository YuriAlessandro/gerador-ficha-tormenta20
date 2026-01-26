import React from 'react';
import { Box, TextField, Typography, Paper, Divider } from '@mui/material';
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
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
          gap: 1.5,
        }}
      >
        {allAttributes.map((atributo) => {
          const baseValue = baseAttributes[atributo] || 10;
          const baseMod = getModifier(baseValue);
          const racialModifier = getRacialModifier(atributo);
          const finalMod = baseMod + racialModifier;

          return (
            <Paper key={atributo} sx={{ p: 1.5 }}>
              <Typography
                variant='subtitle2'
                fontWeight='bold'
                sx={{ mb: 1, fontFamily: 'Tfont, serif' }}
              >
                {atributo}
              </Typography>

              <TextField
                size='small'
                type='number'
                label='Valor Base'
                value={baseValue}
                onChange={(e) => handleChange(atributo, e.target.value)}
                inputProps={{ min: 0, max: 30 }}
                sx={{
                  width: 100,
                  mb: 1,
                  '& .MuiInputBase-input': { textAlign: 'center' },
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  Mod. Racial:
                </Typography>
                <Typography
                  variant='caption'
                  color={racialModifier > 0 ? 'success.main' : 'text.secondary'}
                  fontWeight='bold'
                >
                  {racialModifier > 0
                    ? `+${racialModifier}`
                    : racialModifier || '0'}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant='caption' fontWeight='bold'>
                  Final:
                </Typography>
                <Typography
                  variant='body2'
                  color='primary.main'
                  fontWeight='bold'
                >
                  {baseValue} ({finalMod >= 0 ? `+${finalMod}` : finalMod})
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default AttributeBaseValuesStep;
