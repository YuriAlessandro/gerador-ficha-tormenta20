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

type ArcanistaSubtypes = 'Bruxo' | 'Mago' | 'Feiticeiro';

interface SubtypeOption {
  value: ArcanistaSubtypes;
  name: string;
  description: string;
  spellDetails: string;
}

interface ArcanistSubtypeSelectionStepProps {
  selectedSubtype: ArcanistaSubtypes | null;
  onChange: (subtype: ArcanistaSubtypes) => void;
}

const subtypeOptions: SubtypeOption[] = [
  {
    value: 'Bruxo',
    name: 'Bruxo',
    description:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um bruxo, capaz de lançar magias através de um foco como uma varinha, cajado, chapéu, etc.',
    spellDetails:
      '3 magias iniciais, aprende 1 magia por nível (exceto nível 1)',
  },
  {
    value: 'Mago',
    name: 'Mago',
    description:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um mago, capaz de lançar magia através de todo o seu estudo mágico. Seu livro de magias contém todas as suas magias, e a cada dia você pode preparar até metade de suas magias para usar durante o dia.',
    spellDetails:
      '4 magias iniciais, aprende 2 magias em níveis 5, 9, 13, 17, e 1 magia nos demais níveis',
  },
  {
    value: 'Feiticeiro',
    name: 'Feiticeiro',
    description:
      'A magia é um poder incrível, capaz de alterar a realidade. Esse poder tem fontes distintas e cada uma opera conforme suas próprias regras. Você é um feiticeiro, capaz de lançar magias atráves de um poder inato que corre no seu sangue.',
    spellDetails: '3 magias iniciais, aprende 1 magia em níveis ímpares',
  },
];

const ArcanistSubtypeSelectionStep: React.FC<
  ArcanistSubtypeSelectionStepProps
> = ({ selectedSubtype, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as ArcanistaSubtypes);
  };

  const isComplete = selectedSubtype !== null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Como Arcanista, você deve escolher seu Caminho: Bruxo, Mago ou
        Feiticeiro. Esta escolha define seu atributo-chave para magias e a forma
        como você aprende novas magias.
      </Typography>

      <RadioGroup value={selectedSubtype || ''} onChange={handleChange}>
        {subtypeOptions.map((option) => (
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
                    variant='caption'
                    color='primary'
                    sx={{ fontStyle: 'italic' }}
                  >
                    {option.spellDetails}
                  </Typography>
                </Box>
              }
            />
          </Paper>
        ))}
      </RadioGroup>

      {isComplete && (
        <Alert severity='success'>
          Caminho selecionado com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}

      {!isComplete && (
        <Alert severity='info'>Selecione um caminho para continuar.</Alert>
      )}
    </Box>
  );
};

export default ArcanistSubtypeSelectionStep;
