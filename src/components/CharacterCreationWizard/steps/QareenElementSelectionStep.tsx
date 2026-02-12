import React from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
} from '@mui/material';
import { DamageType } from '@/interfaces/CharacterSheet';

interface QareenElement {
  name: string;
  damageType: DamageType;
  description: string;
}

const QAREEN_ELEMENTS: QareenElement[] = [
  {
    name: 'Qareen da Água',
    damageType: 'Frio',
    description: 'Resistência a dano de frio 10.',
  },
  {
    name: 'Qareen do Ar',
    damageType: 'Eletricidade',
    description: 'Resistência a dano de eletricidade 10.',
  },
  {
    name: 'Qareen do Fogo',
    damageType: 'Fogo',
    description: 'Resistência a dano de fogo 10.',
  },
  {
    name: 'Qareen da Terra',
    damageType: 'Ácido',
    description: 'Resistência a dano de ácido 10.',
  },
  {
    name: 'Qareen da Luz',
    damageType: 'Luz',
    description: 'Resistência a dano de luz 10.',
  },
  {
    name: 'Qareen das Trevas',
    damageType: 'Trevas',
    description: 'Resistência a dano de trevas 10.',
  },
];

interface QareenElementSelectionStepProps {
  selectedElement: DamageType | undefined;
  onChange: (element: DamageType) => void;
}

const QareenElementSelectionStep: React.FC<QareenElementSelectionStepProps> = ({
  selectedElement,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as DamageType);
  };

  const selectedQareen = QAREEN_ELEMENTS.find(
    (e) => e.damageType === selectedElement
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Conforme sua ascendência, escolha o elemento do seu Qareen. Você
        receberá resistência 10 ao tipo de dano correspondente.
      </Typography>

      <RadioGroup value={selectedElement || ''} onChange={handleChange}>
        {QAREEN_ELEMENTS.map((element) => (
          <Paper key={element.damageType} sx={{ p: 2, mb: 1 }}>
            <FormControlLabel
              value={element.damageType}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {element.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {element.description}
                  </Typography>
                </Box>
              }
            />
          </Paper>
        ))}
      </RadioGroup>

      {selectedQareen && (
        <Alert severity='info'>
          Você escolheu {selectedQareen.name}. Receberá RD de{' '}
          {selectedQareen.damageType} 10.
        </Alert>
      )}
    </Box>
  );
};

export default QareenElementSelectionStep;
