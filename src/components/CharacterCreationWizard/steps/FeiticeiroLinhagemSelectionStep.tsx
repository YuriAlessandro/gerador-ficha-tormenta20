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

type FeiticeiroLinhagem =
  | 'Linhagem Dracônica'
  | 'Linhagem Feérica'
  | 'Linhagem Rubra';

interface LinhagemOption {
  value: FeiticeiroLinhagem;
  name: string;
  description: string;
  benefit: string;
}

interface FeiticeiroLinhagemSelectionStepProps {
  selectedLinhagem: FeiticeiroLinhagem | null;
  onChange: (linhagem: FeiticeiroLinhagem) => void;
}

const linhagemOptions: LinhagemOption[] = [
  {
    value: 'Linhagem Dracônica',
    name: 'Linhagem Dracônica',
    description:
      'Um de seus antepassados foi um majestoso dragão. Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio.',
    benefit:
      'Você soma seu modificador de Carisma em seus pontos de vida iniciais e recebe resistência ao tipo de dano escolhido 5.',
  },
  {
    value: 'Linhagem Feérica',
    name: 'Linhagem Feérica',
    description: 'Seu sangue foi tocado pelas fadas.',
    benefit:
      'Você se torna treinado em Enganação e aprende uma magia de 1º círculo de encantamento ou ilusão, arcana ou divina, a sua escolha.',
  },
  {
    value: 'Linhagem Rubra',
    name: 'Linhagem Rubra',
    description: 'Seu sangue foi corrompido pela Tormenta.',
    benefit:
      'Você recebe um poder da Tormenta. Além disso, pode perder outro atributo em vez de Carisma por poderes da Tormenta.',
  },
];

const FeiticeiroLinhagemSelectionStep: React.FC<
  FeiticeiroLinhagemSelectionStepProps
> = ({ selectedLinhagem, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as FeiticeiroLinhagem);
  };

  const isComplete = selectedLinhagem !== null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Como Feiticeiro, seu poder mágico vem de uma linhagem sobrenatural.
        Escolha a origem de seu poder inato:
      </Typography>

      <RadioGroup value={selectedLinhagem || ''} onChange={handleChange}>
        {linhagemOptions.map((option) => (
          <Paper key={option.value} sx={{ p: 2, mb: 2 }}>
            <FormControlLabel
              value={option.value}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='h6'>{option.name}</Typography>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    {option.description}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='primary.main'
                    sx={{ fontWeight: 'bold' }}
                  >
                    Benefício:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {option.benefit}
                  </Typography>
                </Box>
              }
            />
          </Paper>
        ))}
      </RadioGroup>

      {isComplete && (
        <Alert severity='success'>
          Linhagem selecionada com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}

      {!isComplete && (
        <Alert severity='info'>Selecione uma linhagem para continuar.</Alert>
      )}
    </Box>
  );
};

export default FeiticeiroLinhagemSelectionStep;
