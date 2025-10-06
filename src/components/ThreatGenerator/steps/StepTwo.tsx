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
  Divider,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ChallengeLevel, ThreatSheet } from '../../../interfaces/ThreatSheet';
import { getTierByChallengeLevel } from '../../../functions/threatGenerator';

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
        <Grid size={{ xs: 12, md: 6 }}>
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
      </Grid>

      {/* Tabela de patamares - agora clicável */}
      <Box mt={3}>
        <Paper sx={{ p: 3 }}>
          <Box display='flex' alignItems='center' mb={2}>
            <InfoOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant='subtitle1'>
              Selecione por Patamar de Desafio
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary' mb={2}>
            Clique em um patamar para selecionar um ND representativo.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[
              {
                name: 'Iniciante',
                range: 'ND 1/4 - 4',
                tier: 'Iniciante',
                defaultND: ChallengeLevel.ONE,
              },
              {
                name: 'Veterano',
                range: 'ND 5 - 10',
                tier: 'Veterano',
                defaultND: ChallengeLevel.FIVE,
              },
              {
                name: 'Campeão',
                range: 'ND 11 - 16',
                tier: 'Campeão',
                defaultND: ChallengeLevel.ELEVEN,
              },
              {
                name: 'Lenda',
                range: 'ND 17 - 20',
                tier: 'Lenda',
                defaultND: ChallengeLevel.SEVENTEEN,
              },
              {
                name: 'Lenda+',
                range: 'ND S / S+',
                tier: 'L+',
                defaultND: ChallengeLevel.S,
              },
            ].map((item) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={item.name}>
                <Paper
                  elevation={currentTier === item.tier ? 4 : 1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: currentTier === item.tier ? 2 : 0,
                    borderColor: 'primary.main',
                    backgroundColor:
                      currentTier === item.tier
                        ? `${theme.palette.primary.main}15`
                        : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      elevation: 3,
                      backgroundColor:
                        currentTier === item.tier
                          ? `${theme.palette.primary.main}20`
                          : theme.palette.action.hover,
                    },
                  }}
                  onClick={() => handleChallengeLevelChange(item.defaultND)}
                >
                  <Typography
                    variant='subtitle2'
                    gutterBottom
                    color={
                      currentTier === item.tier ? 'primary' : 'text.primary'
                    }
                    fontWeight={currentTier === item.tier ? 'bold' : 'medium'}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant='caption'
                    color={
                      currentTier === item.tier ? 'primary' : 'text.secondary'
                    }
                  >
                    {item.range}
                  </Typography>
                  {currentTier === item.tier && (
                    <Box mt={1}>
                      <Chip
                        label={`ND ${threat.challengeLevel}`}
                        color='primary'
                        size='small'
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default StepTwo;
