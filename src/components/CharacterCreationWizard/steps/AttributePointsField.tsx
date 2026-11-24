import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface AttributePointsFieldProps {
  /** Quantos pontos há para distribuir. */
  pick: number;
  attributes: string[];
  /** Um item por ponto gasto; o mesmo atributo pode se repetir. */
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Distribuição de pontos de atributo em que o mesmo atributo pode receber mais
 * de um ponto (ex.: Rei Mercenário, "3 pontos para distribuir como quiser").
 */
const AttributePointsField: React.FC<AttributePointsFieldProps> = ({
  pick,
  attributes,
  selected,
  onChange,
}) => {
  const removeOne = (attribute: string) => {
    const index = selected.lastIndexOf(attribute);
    onChange(selected.filter((_attr, i) => i !== index));
  };

  return (
    <Box sx={{ maxWidth: 360 }}>
      {attributes.map((attribute) => {
        const points = selected.filter((attr) => attr === attribute).length;
        return (
          <Box
            key={attribute}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.5,
            }}
          >
            <Typography variant='body1'>{attribute}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                aria-label={`Remover ponto de ${attribute}`}
                disabled={points === 0}
                onClick={() => removeOne(attribute)}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ minWidth: 28, textAlign: 'center' }}>
                +{points}
              </Typography>
              <IconButton
                aria-label={`Adicionar ponto em ${attribute}`}
                disabled={selected.length >= pick}
                onClick={() => onChange([...selected, attribute])}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default AttributePointsField;
