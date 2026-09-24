import React from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import {
  DeityClassChoices,
  DeityClassVariant,
} from '@/data/systems/tormenta20/deuses-de-arton/classes/deityClassVariants';
import { ClassAbility } from '@/interfaces/Class';

interface DeityClassVariantStepProps {
  variant: DeityClassVariant;
  /** Habilidades da classe no catálogo — de onde sai o texto da habilidade padrão. */
  classAbilities: ClassAbility[];
  choices: DeityClassChoices | undefined;
  onChange: (choices: DeityClassChoices) => void;
}

/**
 * Escolhas opcionais de "Paladino de Marah" (Deuses de Arton, p. 30).
 *
 * As duas trocas são independentes — o livro diz "pode" nas duas —, então são
 * dois grupos de rádio separados, ambos com o padrão do livro básico
 * pré-selecionado. A adição de Atuação e Luta às perícias de classe é
 * automática e aparece só como aviso.
 */
const DeityClassVariantStep: React.FC<DeityClassVariantStepProps> = ({
  variant,
  classAbilities,
  choices,
  onChange,
}) => {
  const isMobile = window.innerWidth <= 768;
  const alternative = variant.alternativeAbility;
  const swap = variant.initialSkillSwap;

  const defaultAbility = alternative
    ? classAbilities.find((a) => a.name === alternative.replaces)
    : undefined;

  const cardSx = { p: isMobile ? 1.5 : 2, mb: 2 };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        Como {variant.className} devoto de {variant.deity}, você pode trocar
        parte das habilidades e perícias iniciais da sua classe. As duas
        escolhas são independentes e permanentes.
      </Typography>

      {alternative && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Habilidade de 1º nível
          </Typography>
          <RadioGroup
            value={choices?.alternativeAbility || ''}
            onChange={(event) =>
              onChange({
                ...choices,
                alternativeAbility: event.target.value || undefined,
              })
            }
          >
            <Paper sx={cardSx}>
              <FormControlLabel
                value=''
                control={<Radio />}
                label={
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='h6'>
                        {alternative.replaces}
                      </Typography>
                      <Chip
                        label='Padrão'
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary' }}
                    >
                      {defaultAbility?.text}
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper sx={cardSx}>
              <FormControlLabel
                value={alternative.ability.name}
                control={<Radio />}
                label={
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='h6'>
                        {alternative.ability.name}
                      </Typography>
                      <Chip
                        label='Deuses de Arton'
                        size='small'
                        color='secondary'
                        variant='outlined'
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary' }}
                    >
                      {alternative.ability.text}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </Box>
      )}

      {swap && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Perícia inicial obrigatória
          </Typography>
          <RadioGroup
            value={choices?.swapInitialSkill ? 'swap' : ''}
            onChange={(event) =>
              onChange({
                ...choices,
                swapInitialSkill: event.target.value === 'swap',
              })
            }
          >
            <Paper sx={cardSx}>
              <FormControlLabel
                value=''
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography variant='body1'>{swap.from}</Typography>
                    <Chip
                      label='Padrão'
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                  </Box>
                }
              />
            </Paper>
            <Paper sx={cardSx}>
              <FormControlLabel
                value='swap'
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography variant='body1'>{swap.to}</Typography>
                    <Chip
                      label='Deuses de Arton'
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </Box>
      )}

      {variant.addedClassSkills && variant.addedClassSkills.length > 0 && (
        <Alert severity='info'>
          {variant.addedClassSkills.join(' e ')} entram automaticamente na sua
          lista de perícias de classe.
        </Alert>
      )}
    </Box>
  );
};

export default DeityClassVariantStep;
