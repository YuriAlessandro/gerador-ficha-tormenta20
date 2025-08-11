import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Chip,
  useTheme,
  ListSubheader,
} from '@mui/material';
import { ChallengeLevel, ThreatSheet } from '../../../interfaces/ThreatSheet';
import {
  getTierByChallengeLevel,
  getTierDisplayName,
} from '../../../functions/threatGenerator';

interface StepTwoProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();

  const handleChallengeLevelChange = (value: ChallengeLevel) => {
    onUpdate({ challengeLevel: value });
  };

  // Organizar NDs por categoria
  const fractionalLevels = [
    ChallengeLevel.QUARTER,
    ChallengeLevel.THIRD,
    ChallengeLevel.HALF,
  ];

  const integerLevels = [
    ChallengeLevel.ONE,
    ChallengeLevel.TWO,
    ChallengeLevel.THREE,
    ChallengeLevel.FOUR,
    ChallengeLevel.FIVE,
    ChallengeLevel.SIX,
    ChallengeLevel.SEVEN,
    ChallengeLevel.EIGHT,
    ChallengeLevel.NINE,
    ChallengeLevel.TEN,
    ChallengeLevel.ELEVEN,
    ChallengeLevel.TWELVE,
    ChallengeLevel.THIRTEEN,
    ChallengeLevel.FOURTEEN,
    ChallengeLevel.FIFTEEN,
    ChallengeLevel.SIXTEEN,
    ChallengeLevel.SEVENTEEN,
    ChallengeLevel.EIGHTEEN,
    ChallengeLevel.NINETEEN,
    ChallengeLevel.TWENTY,
  ];

  const epicLevels = [ChallengeLevel.S, ChallengeLevel.S_PLUS];

  const currentTier = threat.challengeLevel
    ? getTierByChallengeLevel(threat.challengeLevel)
    : null;

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Nível de Desafio
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Escolha a dificuldade da ameaça. O ND determina todas as estatísticas
        base da criatura.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Nível de Desafio (ND)</InputLabel>
            <Select
              value={threat.challengeLevel || ''}
              label='Nível de Desafio (ND)'
              onChange={(e) =>
                handleChallengeLevelChange(e.target.value as ChallengeLevel)
              }
            >
              <ListSubheader>Níveis Fracionários</ListSubheader>
              {fractionalLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  ND {level}
                </MenuItem>
              ))}

              <ListSubheader>Níveis Inteiros</ListSubheader>
              {integerLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  ND {level}
                </MenuItem>
              ))}

              <ListSubheader>Níveis Épicos</ListSubheader>
              {epicLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  ND {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Informações sobre o patamar */}
        {currentTier && (
          <Grid item xs={12} md={6}>
            <Paper
              variant='outlined'
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant='subtitle1' gutterBottom>
                Patamar de Poder
              </Typography>
              <Chip
                label={getTierDisplayName(currentTier)}
                color='primary'
                size='medium'
                sx={{ mb: 2, fontSize: '1rem', py: 1 }}
              />
              <Typography variant='body2' color='text.secondary'>
                ND {threat.challengeLevel} pertence ao patamar{' '}
                <strong>{getTierDisplayName(currentTier)}</strong>
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Tabela de patamares */}
      <Box mt={4}>
        <Typography variant='subtitle1' gutterBottom>
          Patamares de Desafio
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3} md={2.4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor:
                  currentTier === 'Iniciante'
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Iniciante</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ND 1/4 - 4
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor:
                  currentTier === 'Veterano'
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Veterano</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ND 5 - 10
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor:
                  currentTier === 'Campeão'
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Campeão</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ND 11 - 16
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor:
                  currentTier === 'Lenda'
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Lenda</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ND 17 - 20
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor:
                  currentTier === 'L+'
                    ? `${theme.palette.primary.light}20`
                    : 'transparent',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                <strong>Lenda+</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ND S / S+
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepTwo;
