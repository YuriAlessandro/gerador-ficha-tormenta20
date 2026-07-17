import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
  ListSubheader,
  Avatar,
  useTheme,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import {
  ThreatType,
  ThreatSize,
  ThreatRole,
  ChallengeLevel,
  ThreatSheet,
} from '../../../interfaces/ThreatSheet';
import { getTierByChallengeLevel } from '../../../functions/threatGenerator';
import {
  getDefaultDisplacement,
  getDisplacementSuggestions,
  DisplacementPosture,
} from '../utils/displacementSuggestions';
import SectionCard from './shared/SectionCard';

interface StepGeneralProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

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

const tierCards = [
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
];

const roleCards = [
  {
    role: ThreatRole.SOLO,
    title: 'Solo',
    description:
      'Inimigo único poderoso, projetado para enfrentar um grupo de aventureiros sozinho.',
  },
  {
    role: ThreatRole.LACAIO,
    title: 'Lacaio',
    description:
      'Inimigos mais fracos, projetados para lutar em grupos e apoiar outras ameaças.',
  },
  {
    role: ThreatRole.ESPECIAL,
    title: 'Especial',
    description:
      'Ameaças únicas com características especiais, geralmente chefes ou criaturas importantes.',
  },
];

const StepGeneral: React.FC<StepGeneralProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();
  const [imageError, setImageError] = React.useState(false);

  const handleSizeChange = (value: ThreatSize) => {
    onUpdate({ size: value, displacement: getDefaultDisplacement(value) });
  };

  const handleDisplacementChange = (value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (value === '' || (numericValue > 0 && !Number.isNaN(numericValue))) {
      onUpdate({ displacement: value });
    }
  };

  const isDisplacementValid = (): boolean => {
    if (!threat.displacement) return true;
    const numericValue = parseInt(
      threat.displacement.replace(/[^0-9]/g, ''),
      10
    );
    return numericValue > 0 && !Number.isNaN(numericValue);
  };

  const currentTier = threat.challengeLevel
    ? getTierByChallengeLevel(threat.challengeLevel)
    : null;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant='h6' gutterBottom>
        Informações Gerais
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 3,
        }}
      >
        Comece pela identidade e classificação da ameaça. O ND determina todas
        as estatísticas base da criatura.
      </Typography>
      <Stack spacing={3}>
        {/* Identidade */}
        <SectionCard
          icon={<BadgeOutlinedIcon />}
          title='Identidade'
          subtitle='Nome e imagem que aparecerão na ficha.'
        >
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: 'flex-start',
            }}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Nome'
                value={threat.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder='Ex: Goblin Guerreiro, Dragão Ancião, Golem de Ferro'
                helperText='Nome exibido na ficha final'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  fullWidth
                  label='URL da Imagem (opcional)'
                  placeholder='https://exemplo.com/imagem.jpg'
                  helperText='Cole a URL de uma imagem para ilustrar a ameaça'
                  value={threat.imageUrl || ''}
                  onChange={(e) => {
                    setImageError(false);
                    onUpdate({ imageUrl: e.target.value });
                  }}
                />
                <Avatar
                  src={
                    threat.imageUrl && !imageError ? threat.imageUrl : undefined
                  }
                  variant='rounded'
                  sx={{ width: 56, height: 56, flexShrink: 0 }}
                  slotProps={{
                    img: { onError: () => setImageError(true) },
                  }}
                >
                  <PetsOutlinedIcon />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Classificação */}
        <SectionCard
          icon={<CategoryOutlinedIcon />}
          title='Classificação'
          subtitle='Tipo, tamanho e papel da ameaça no encontro.'
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={threat.type || ''}
                  label='Tipo'
                  onChange={(e) =>
                    onUpdate({ type: e.target.value as ThreatType })
                  }
                >
                  {Object.values(ThreatType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Tamanho</InputLabel>
                <Select
                  value={threat.size || ''}
                  label='Tamanho'
                  onChange={(e) =>
                    handleSizeChange(e.target.value as ThreatSize)
                  }
                >
                  {Object.values(ThreatSize).map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Papel</InputLabel>
                <Select
                  value={threat.role || ''}
                  label='Papel'
                  onChange={(e) =>
                    onUpdate({ role: e.target.value as ThreatRole })
                  }
                >
                  {Object.values(ThreatRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            sx={{
              mt: 0.5,
            }}
          >
            {roleCards.map((card) => {
              const selected = threat.role === card.role;
              return (
                <Grid size={{ xs: 12, md: 4 }} key={card.role}>
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2,
                      height: '100%',
                      borderColor: selected ? 'primary.main' : 'divider',
                      backgroundColor: selected
                        ? `${theme.palette.primary.main}14`
                        : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      <strong>{card.title}</strong>
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {card.description}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </SectionCard>

        {/* Nível de Desafio */}
        <SectionCard
          icon={<MilitaryTechOutlinedIcon />}
          title='Nível de Desafio'
          subtitle='Escolha o ND diretamente ou selecione um patamar representativo.'
        >
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth>
                <InputLabel>Nível de Desafio (ND)</InputLabel>
                <Select
                  value={threat.challengeLevel || ''}
                  label='Nível de Desafio (ND)'
                  onChange={(e) =>
                    onUpdate({
                      challengeLevel: e.target.value as ChallengeLevel,
                    })
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

          <Grid
            container
            spacing={2}
            sx={{
              mt: 0.5,
            }}
          >
            {tierCards.map((item) => {
              const selected = currentTier === item.tier;
              return (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={item.name}>
                  <Paper
                    elevation={selected ? 4 : 0}
                    variant={selected ? 'elevation' : 'outlined'}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderColor: selected ? 'primary.main' : 'divider',
                      backgroundColor: selected
                        ? `${theme.palette.primary.main}15`
                        : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: selected
                          ? `${theme.palette.primary.main}20`
                          : theme.palette.action.hover,
                      },
                    }}
                    onClick={() => onUpdate({ challengeLevel: item.defaultND })}
                  >
                    <Typography
                      variant='subtitle2'
                      gutterBottom
                      color={selected ? 'primary' : 'text.primary'}
                      sx={{
                        fontWeight: selected ? 'bold' : 'medium',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      color={selected ? 'primary' : 'text.secondary'}
                    >
                      {item.range}
                    </Typography>
                    {selected && (
                      <Box
                        sx={{
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={`ND ${threat.challengeLevel}`}
                          color='primary'
                          size='small'
                        />
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </SectionCard>

        {/* Deslocamento */}
        <SectionCard
          icon={<DirectionsRunOutlinedIcon />}
          title='Deslocamento'
          subtitle='Digite um valor ou escolha uma sugestão pelo tamanho.'
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label='Deslocamento'
                value={threat.displacement || ''}
                onChange={(e) => handleDisplacementChange(e.target.value)}
                placeholder='Ex: 9m'
                error={!isDisplacementValid()}
                helperText={
                  !isDisplacementValid()
                    ? 'Deve ser um número positivo'
                    : 'Digite ou escolha uma sugestão ao lado'
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 8 }}>
              {threat.size ? (
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {`Sugestões baseadas no tamanho ${threat.size}:`}
                  </Typography>
                  {(['Bípede', 'Quadrúpede'] as DisplacementPosture[]).map(
                    (posture) => {
                      const chipsForPosture = getDisplacementSuggestions(
                        threat.size
                      ).filter((s) => s.posture === posture);
                      if (chipsForPosture.length === 0) return null;
                      return (
                        <Box
                          key={posture}
                          sx={{
                            mt: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{ minWidth: 90, fontWeight: 600 }}
                          >
                            {posture}:
                          </Typography>
                          <Stack
                            direction='row'
                            sx={{
                              flexWrap: 'wrap',
                              gap: 0.5,
                            }}
                          >
                            {chipsForPosture.map((suggestion) => {
                              const isSelected =
                                threat.displacement === suggestion.value;
                              return (
                                <Chip
                                  key={`${posture}-${suggestion.pace}`}
                                  label={suggestion.label}
                                  size='small'
                                  clickable
                                  color={isSelected ? 'primary' : 'default'}
                                  variant={isSelected ? 'filled' : 'outlined'}
                                  onClick={() =>
                                    onUpdate({ displacement: suggestion.value })
                                  }
                                />
                              );
                            })}
                          </Stack>
                        </Box>
                      );
                    }
                  )}
                </Box>
              ) : (
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Selecione um tamanho para ver sugestões de deslocamento.
                </Typography>
              )}
            </Grid>
          </Grid>
        </SectionCard>
      </Stack>
    </Box>
  );
};

export default StepGeneral;
