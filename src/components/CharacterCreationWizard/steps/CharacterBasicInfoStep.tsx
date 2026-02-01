import React from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Link,
} from '@mui/material';

interface CharacterBasicInfo {
  name?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
}

interface CharacterBasicInfoStepProps {
  basicInfo: CharacterBasicInfo;
  onChange: (info: CharacterBasicInfo) => void;
}

const CharacterBasicInfoStep: React.FC<CharacterBasicInfoStepProps> = ({
  basicInfo,
  onChange,
}) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...basicInfo,
      name: event.target.value,
    });
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...basicInfo,
      gender: event.target.value as 'Masculino' | 'Feminino' | 'Outro',
    });
  };

  const isComplete = basicInfo.name && basicInfo.name.trim().length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='warning' sx={{ mb: 1 }}>
        <Typography variant='body2' gutterBottom>
          O Fichas de Nimb <strong>não substitui</strong> a necessidade de
          possuir os materiais de jogo. Você deve conhecer as regras do sistema
          e estar ciente sobre o processo de criação de fichas.
        </Typography>
        <Typography variant='body2' gutterBottom>
          Se você não possui Tormenta 20 ou seus suplementos, nunca jogou
          utilizando esse sistema e não possui domínio sobre as regras, compre o
          material no site oficial da{' '}
          <Link
            href='https://jamboeditora.com.br/'
            target='_blank'
            rel='noopener noreferrer'
            sx={{ fontWeight: 'bold' }}
          >
            Jambô Editora
          </Link>
          .
        </Typography>
        <Typography variant='body2'>
          É importante salientar que o Fichas de Nimb pode cometer erros.
          Verifique suas fichas com atenção.
        </Typography>
      </Alert>

      <Typography variant='body1' color='text.secondary'>
        Defina as informações básicas do seu personagem.
      </Typography>

      <TextField
        fullWidth
        label='Nome do Personagem'
        value={basicInfo.name || ''}
        onChange={handleNameChange}
        placeholder='Ex: Thorin Escudo de Pedra'
        required
        helperText='Digite o nome do seu personagem'
      />

      <FormControl component='fieldset'>
        <FormLabel component='legend'>Gênero (Opcional)</FormLabel>
        <RadioGroup
          value={basicInfo.gender || ''}
          onChange={handleGenderChange}
          row
        >
          <FormControlLabel
            value='Masculino'
            control={<Radio />}
            label='Masculino'
          />
          <FormControlLabel
            value='Feminino'
            control={<Radio />}
            label='Feminino'
          />
          <FormControlLabel value='Outro' control={<Radio />} label='Outro' />
        </RadioGroup>
      </FormControl>

      {isComplete ? (
        <Alert severity='success'>
          Informações básicas preenchidas! Você pode continuar.
        </Alert>
      ) : (
        <Alert severity='info'>
          Preencha pelo menos o nome do personagem para continuar.
        </Alert>
      )}
    </Box>
  );
};

export default CharacterBasicInfoStep;
