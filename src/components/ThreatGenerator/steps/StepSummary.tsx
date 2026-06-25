import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import { ThreatSheet } from '../../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../../functions/threatGenerator';
import SectionCard from './shared/SectionCard';

interface StepSummaryProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({ threat, onUpdate }) => {
  const theme = useTheme();
  const [imageError, setImageError] = React.useState(false);

  const handleCombatStatChange = (
    field: 'defense' | 'hitPoints' | 'manaPoints',
    value: number
  ) => {
    if (!threat.combatStats) return;
    onUpdate({
      combatStats: { ...threat.combatStats, [field]: value },
    });
  };

  const { combatStats } = threat;
  const hasMana =
    threat.hasManaPoints &&
    combatStats?.manaPoints !== undefined &&
    combatStats.manaPoints > 0;

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Typography variant='h6' gutterBottom>
        Resumo
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Revise a ameaça e faça ajustes finais de nome e estatísticas vitais
        antes de finalizar.
      </Typography>

      <Stack spacing={3}>
        {/* Ajustes finais */}
        <SectionCard
          icon={<TuneOutlinedIcon />}
          title='Ajustes Finais'
          subtitle='Altere o nome e os valores vitais sem voltar etapas.'
        >
          <Grid container spacing={2} alignItems='center'>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box display='flex' gap={2} alignItems='center'>
                <Avatar
                  src={
                    threat.imageUrl && !imageError ? threat.imageUrl : undefined
                  }
                  variant='rounded'
                  imgProps={{ onError: () => setImageError(true) }}
                  sx={{ width: 56, height: 56, flexShrink: 0 }}
                >
                  <PetsOutlinedIcon />
                </Avatar>
                <TextField
                  fullWidth
                  label='Nome'
                  value={threat.name || ''}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder='Nome da ameaça'
                />
              </Box>
            </Grid>
            {combatStats && (
              <>
                <Grid size={{ xs: 4, md: hasMana ? 2 : 3 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Defesa'
                    value={combatStats.defense}
                    onChange={(e) =>
                      handleCombatStatChange(
                        'defense',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4, md: hasMana ? 2 : 4 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='PV'
                    value={combatStats.hitPoints}
                    onChange={(e) =>
                      handleCombatStatChange(
                        'hitPoints',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </Grid>
                {hasMana && (
                  <Grid size={{ xs: 4, md: 3 }}>
                    <TextField
                      fullWidth
                      type='number'
                      label='PM'
                      value={combatStats.manaPoints ?? 0}
                      onChange={(e) =>
                        handleCombatStatChange(
                          'manaPoints',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </SectionCard>

        {/* Resumo geral */}
        <SectionCard
          icon={<FactCheckOutlinedIcon />}
          title='Visão Geral'
          subtitle='Confira tudo o que foi configurado.'
        >
          <Typography variant='body1' mb={2}>
            <strong>{threat.name || 'Ameaça Sem Nome'}</strong> é um(a){' '}
            {threat.type?.toLowerCase()} {threat.size?.toLowerCase()} de papel{' '}
            {threat.role?.toLowerCase()} com nível de desafio{' '}
            {threat.challengeLevel}
            {threat.challengeLevel &&
              ` (${getTierDisplayName(
                getTierByChallengeLevel(threat.challengeLevel)
              )})`}
            . Possui {threat.attacks?.length || 0} ataques,{' '}
            {threat.abilities?.length || 0} habilidades e{' '}
            {threat.spells?.length || 0} magias.
          </Typography>

          <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
            {threat.type && (
              <Chip label={`Tipo: ${threat.type}`} size='small' />
            )}
            {threat.size && (
              <Chip label={`Tamanho: ${threat.size}`} size='small' />
            )}
            {threat.role && (
              <Chip label={`Papel: ${threat.role}`} size='small' />
            )}
            {threat.challengeLevel && (
              <Chip
                label={`ND ${threat.challengeLevel}`}
                size='small'
                color='primary'
              />
            )}
            {threat.displacement && (
              <Chip
                label={`Deslocamento: ${threat.displacement}`}
                size='small'
              />
            )}
          </Box>

          {combatStats && (
            <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
              <Chip
                label={`Ataque: +${combatStats.attackValue}`}
                size='small'
                variant='outlined'
              />
              <Chip
                label={`Dano: ${combatStats.averageDamage}`}
                size='small'
                variant='outlined'
              />
              <Chip
                label={`CD: ${combatStats.standardEffectDC}`}
                size='small'
                variant='outlined'
              />
              <Chip
                label={`Forte +${combatStats.strongSave}`}
                size='small'
                color='success'
              />
              <Chip
                label={`Média +${combatStats.mediumSave}`}
                size='small'
                color='warning'
              />
              <Chip
                label={`Fraca +${combatStats.weakSave}`}
                size='small'
                color='error'
              />
            </Box>
          )}

          <Grid container spacing={2}>
            {[
              { title: 'Ataques', items: threat.attacks },
              { title: 'Habilidades', items: threat.abilities },
              { title: 'Magias', items: threat.spells },
            ].map((section) => (
              <Grid size={{ xs: 12, md: 4 }} key={section.title}>
                <Typography variant='subtitle2' gutterBottom>
                  {section.title} ({section.items?.length || 0})
                </Typography>
                {!section.items || section.items.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    Nenhum(a) configurado(a)
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {section.items.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0, py: 0.25 }}>
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            ))}
          </Grid>

          {(threat.specialQualities || threat.equipment) && (
            <Divider sx={{ my: 2 }} />
          )}

          {threat.specialQualities && (
            <Box mb={1.5}>
              <Typography variant='subtitle2'>Qualidades Especiais</Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {threat.specialQualities}
              </Typography>
            </Box>
          )}

          {threat.equipment && (
            <Box>
              <Typography variant='subtitle2'>
                Equipamentos{' '}
                <Chip
                  label={`Tesouro: ${threat.treasureLevel || 'Padrão'}`}
                  size='small'
                  sx={{ ml: 1, bgcolor: theme.palette.action.hover }}
                />
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {threat.equipment}
              </Typography>
            </Box>
          )}
        </SectionCard>
      </Stack>
    </Box>
  );
};

export default StepSummary;
