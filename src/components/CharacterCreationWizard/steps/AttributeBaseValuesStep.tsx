import React, { useState } from 'react';
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
  // Estado local para permitir input vazio temporariamente
  const [inputValues, setInputValues] = useState<Record<Atributo, string>>(() =>
    Object.values(Atributo).reduce(
      (acc, attr) => ({ ...acc, [attr]: String(baseAttributes[attr] ?? 0) }),
      {} as Record<Atributo, string>
    )
  );

  const handleChange = (atributo: Atributo, value: string) => {
    // Só aceita números e o símbolo '-'
    if (value !== '' && !/^-?\d*$/.test(value)) {
      return;
    }

    // Sempre atualiza o estado local (permite vazio ou apenas '-')
    setInputValues((prev) => ({ ...prev, [atributo]: value }));

    // Só propaga para o parent se for número válido
    const numValue = parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue >= -4 && numValue <= 10) {
      onChange({
        ...baseAttributes,
        [atributo]: numValue,
      });
    }
  };

  // Calculate racial modifier bonus
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

  const allAttributes = Object.values(Atributo);

  // Helper to format modifier with sign
  const formatMod = (mod: number): string => {
    if (mod > 0) return `+${mod}`;
    return mod.toString();
  };

  // Helper to get color for racial modifier
  const getRacialModifierColor = (mod: number): string => {
    if (mod > 0) return 'success.main';
    if (mod < 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Defina os modificadores dos atributos do seu personagem. Os
        modificadores da raça {race.name} serão aplicados automaticamente ao
        valor final.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
          gap: 1.5,
        }}
      >
        {allAttributes.map((atributo) => {
          const baseModifier = baseAttributes[atributo] ?? 0;
          const racialModifier = getRacialModifier(atributo);
          const finalValue = baseModifier + racialModifier;

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
                label='Modificador'
                value={inputValues[atributo]}
                onChange={(e) => handleChange(atributo, e.target.value)}
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
                  fontSize: '0.85rem',
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.85rem' }}
                  color='text.secondary'
                >
                  Mod. Racial:
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.85rem' }}
                  color={getRacialModifierColor(racialModifier)}
                  fontWeight='bold'
                >
                  {formatMod(racialModifier)}
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
                  {formatMod(finalValue)}
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
