import React, { useState, useEffect } from 'react';
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
  Autocomplete,
} from '@mui/material';
import { SupplementId } from '@/types/supplement.types';
import getNameSuggestions from '@/functions/nameSuggestions';
import Race from '@/interfaces/Race';
import {
  getEffectiveRaceAttrs,
  raceHasSexDimorphism,
} from '@/functions/general';

interface CharacterBasicInfo {
  name?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  imageUrl?: string;
  dimorphismChoice?: 'Masculino' | 'Feminino';
}

interface CharacterBasicInfoStepProps {
  basicInfo: CharacterBasicInfo;
  onChange: (info: CharacterBasicInfo) => void;
  raceName: string;
  race?: Race;
  supplements: SupplementId[];
}

const formatAttrSet = (race: Race, sex: 'Masculino' | 'Feminino'): string =>
  getEffectiveRaceAttrs(race, sex)
    .map((attr) =>
      attr.attr === 'any'
        ? `Qualquer ${attr.mod > 0 ? '+' : ''}${attr.mod}`
        : `${attr.attr} ${attr.mod > 0 ? '+' : ''}${attr.mod}`
    )
    .join(', ');

const CharacterBasicInfoStep: React.FC<CharacterBasicInfoStepProps> = ({
  basicInfo,
  onChange,
  raceName,
  race,
  supplements,
}) => {
  const [nameSuggestions, setNameSuggestions] = useState<string[]>(() =>
    getNameSuggestions(raceName, basicInfo.gender || 'Masculino', supplements)
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setNameSuggestions(
      getNameSuggestions(raceName, basicInfo.gender || 'Masculino', supplements)
    );
  }, [raceName, basicInfo.gender, supplements]);

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const gender = event.target.value as 'Masculino' | 'Feminino' | 'Outro';
    onChange({
      ...basicInfo,
      gender,
      // A escolha de dimorfismo só se aplica ao gênero 'Outro'
      dimorphismChoice:
        gender === 'Outro' ? basicInfo.dimorphismChoice : undefined,
    });
  };

  const handleDimorphismChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...basicInfo,
      dimorphismChoice: event.target.value as 'Masculino' | 'Feminino',
    });
  };

  const needsDimorphismChoice =
    !!race && raceHasSexDimorphism(race) && basicInfo.gender === 'Outro';

  const isComplete =
    basicInfo.name &&
    basicInfo.name.trim().length > 0 &&
    (!needsDimorphismChoice || !!basicInfo.dimorphismChoice);

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
      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
        }}
      >
        Defina as informações básicas do seu personagem.
      </Typography>
      <Autocomplete
        freeSolo
        options={nameSuggestions}
        value={basicInfo.name || ''}
        onChange={(_event, newValue) => {
          onChange({ ...basicInfo, name: newValue || '' });
        }}
        onInputChange={(_event, newInputValue) => {
          onChange({ ...basicInfo, name: newInputValue });
        }}
        renderInput={(params) => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            fullWidth
            label='Nome do Personagem'
            placeholder='Ex: Thorin Escudo de Pedra'
            required
            helperText='Digite ou selecione um nome baseado na raça e gênero'
          />
        )}
      />
      <TextField
        fullWidth
        label='URL da Imagem (opcional)'
        placeholder='https://exemplo.com/imagem.jpg'
        helperText='Cole a URL de uma imagem para ilustrar seu personagem'
        value={basicInfo.imageUrl || ''}
        onChange={(e) => {
          setImageError(false);
          onChange({ ...basicInfo, imageUrl: e.target.value });
        }}
      />
      {basicInfo.imageUrl && !imageError && (
        <Box
          component='img'
          src={basicInfo.imageUrl}
          alt='Preview'
          onError={() => setImageError(true)}
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: 2,
          }}
        />
      )}
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
      {needsDimorphismChoice && race && (
        <FormControl component='fieldset'>
          <FormLabel component='legend'>Atributos Raciais</FormLabel>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
            A raça {race.name} possui atributos diferentes conforme o
            dimorfismo. Escolha qual conjunto seu personagem recebe.
          </Typography>
          <RadioGroup
            value={basicInfo.dimorphismChoice || ''}
            onChange={handleDimorphismChange}
          >
            <FormControlLabel
              value='Masculino'
              control={<Radio />}
              label={`Aspecto físico (${formatAttrSet(race, 'Masculino')})`}
            />
            <FormControlLabel
              value='Feminino'
              control={<Radio />}
              label={`Aspecto mental (${formatAttrSet(race, 'Feminino')})`}
            />
          </RadioGroup>
        </FormControl>
      )}
      {isComplete ? (
        <Alert severity='success'>
          Informações básicas preenchidas! Você pode continuar.
        </Alert>
      ) : (
        <Alert severity='info'>
          {needsDimorphismChoice && !basicInfo.dimorphismChoice
            ? 'Preencha o nome do personagem e escolha o conjunto de atributos raciais para continuar.'
            : 'Preencha pelo menos o nome do personagem para continuar.'}
        </Alert>
      )}
    </Box>
  );
};

export default CharacterBasicInfoStep;
