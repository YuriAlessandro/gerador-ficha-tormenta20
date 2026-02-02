import React from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import { AttributeVariant } from '../../../interfaces/Race';

interface Props {
  variants: AttributeVariant[];
  selectedVariant: AttributeVariant | null;
  onChange: (variant: AttributeVariant) => void;
}

export const RaceAttributeVariantStep: React.FC<Props> = ({
  variants,
  selectedVariant,
  onChange,
}) => (
  <Box>
    <Typography variant='h6' gutterBottom>
      Escolha sua variante de atributos
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
      Esta raca permite escolher entre diferentes configuracoes de bonus de
      atributos.
    </Typography>
    <RadioGroup
      value={selectedVariant?.label || ''}
      onChange={(e) => {
        const variant = variants.find((v) => v.label === e.target.value);
        if (variant) onChange(variant);
      }}
    >
      {variants.map((variant) => (
        <Paper
          key={variant.label}
          sx={{
            p: 2,
            mb: 1,
            cursor: 'pointer',
            border: '1px solid',
            borderColor:
              selectedVariant?.label === variant.label
                ? 'primary.main'
                : 'divider',
            '&:hover': {
              borderColor: 'primary.light',
            },
          }}
          onClick={() => onChange(variant)}
        >
          <FormControlLabel
            value={variant.label}
            control={<Radio />}
            label={
              <Box>
                <Typography variant='subtitle1'>{variant.label}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {variant.attrs.length === 1
                    ? `Escolha 1 atributo para receber +${variant.attrs[0].mod}`
                    : `Escolha ${variant.attrs.length} atributos para receber +${variant.attrs[0].mod} cada`}
                </Typography>
              </Box>
            }
            sx={{ m: 0, width: '100%' }}
          />
        </Paper>
      ))}
    </RadioGroup>
  </Box>
);

export default RaceAttributeVariantStep;
