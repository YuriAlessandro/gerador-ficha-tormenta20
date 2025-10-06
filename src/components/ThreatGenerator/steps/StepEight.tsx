import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ThreatSheet } from '../../../interfaces/ThreatSheet';
import {
  getTierDisplayName,
  getTierByChallengeLevel,
} from '../../../functions/threatGenerator';

interface StepEightProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepEight: React.FC<StepEightProps> = ({ threat, onUpdate }) => {
  const handleNameChange = (name: string) => {
    onUpdate({ name });
  };

  const handleCombatStatChange = (
    field: 'defense' | 'hitPoints' | 'standardEffectDC',
    value: number
  ) => {
    onUpdate({
      combatStats: {
        ...threat.combatStats!,
        [field]: value,
      },
    });
  };

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Nome e Resumo Final
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Dê um nome à sua ameaça e revise todas as informações antes de
        finalizar.
      </Typography>

      <Grid container spacing={3}>
        {/* Name Input */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Nome da Ameaça
            </Typography>
            <TextField
              fullWidth
              label='Nome'
              value={threat.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder='Ex: Goblin Guerreiro, Dragão Ancião, Golem de Ferro'
              helperText='Este será o nome exibido na ficha final'
            />
          </Paper>
        </Grid>

        {/* Basic Info Summary */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Resumo das Características
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Tipo
                </Typography>
                <Typography variant='body1'>
                  {threat.type || 'Não definido'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Tamanho
                </Typography>
                <Typography variant='body1'>
                  {threat.size || 'Não definido'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Papel
                </Typography>
                <Typography variant='body1'>
                  {threat.role || 'Não definido'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  ND
                </Typography>
                <Typography variant='body1'>
                  {threat.challengeLevel || 'Não definido'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Combat Stats Summary */}
      {threat.combatStats && (
        <Box mt={3}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Estatísticas de Combate
            </Typography>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Defesa</TableCell>
                    <TableCell>PV</TableCell>
                    {threat.combatStats.manaPoints && <TableCell>PM</TableCell>}
                    <TableCell>Ataque</TableCell>
                    <TableCell>Dano</TableCell>
                    <TableCell>CD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField
                        type='number'
                        value={threat.combatStats.defense}
                        onChange={(e) =>
                          handleCombatStatChange(
                            'defense',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        size='small'
                        variant='outlined'
                        sx={{ width: 80 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type='number'
                        value={threat.combatStats.hitPoints}
                        onChange={(e) =>
                          handleCombatStatChange(
                            'hitPoints',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        size='small'
                        variant='outlined'
                        sx={{ width: 80 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </TableCell>
                    {threat.combatStats.manaPoints && (
                      <TableCell>{threat.combatStats.manaPoints}</TableCell>
                    )}
                    <TableCell>+{threat.combatStats.attackValue}</TableCell>
                    <TableCell>{threat.combatStats.averageDamage}</TableCell>
                    <TableCell>
                      <TextField
                        type='number'
                        value={threat.combatStats.standardEffectDC}
                        onChange={(e) =>
                          handleCombatStatChange(
                            'standardEffectDC',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        size='small'
                        variant='outlined'
                        sx={{ width: 80 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Testes de Resistência:
              </Typography>
              <Box display='flex' gap={2}>
                <Chip
                  label={`Forte: +${threat.combatStats.strongSave}`}
                  color='success'
                  size='small'
                />
                <Chip
                  label={`Médio: +${threat.combatStats.mediumSave}`}
                  color='warning'
                  size='small'
                />
                <Chip
                  label={`Fraco: +${threat.combatStats.weakSave}`}
                  color='error'
                  size='small'
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Attacks and Abilities */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Attacks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Ataques ({threat.attacks?.length || 0})
            </Typography>
            {!threat.attacks || threat.attacks.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Nenhum ataque configurado
              </Typography>
            ) : (
              <List dense>
                {threat.attacks.map((attack) => (
                  <ListItem key={attack.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={attack.name}
                      secondary={`Ataque: +${attack.attackBonus} | Dano: ${
                        attack.damageDice
                      }${
                        attack.bonusDamage > 0 ? `+${attack.bonusDamage}` : ''
                      } (${attack.averageDamage} médio)`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Abilities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Habilidades ({threat.abilities?.length || 0})
            </Typography>
            {!threat.abilities || threat.abilities.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Nenhuma habilidade configurada
              </Typography>
            ) : (
              <List dense>
                {threat.abilities.map((ability) => (
                  <ListItem key={ability.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={ability.name}
                      secondary={
                        ability.description ? (
                          <Typography
                            variant='caption'
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {ability.description}
                          </Typography>
                        ) : (
                          'Sem descrição'
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Equipment and Treasure */}
      <Box mt={3}>
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Equipamentos e Tesouro
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 9 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Equipamentos:
              </Typography>
              <Typography variant='body2'>
                {threat.equipment || 'Nenhum equipamento especificado'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Nível de Tesouro:
              </Typography>
              <Chip
                label={threat.treasureLevel || 'Padrão'}
                color='primary'
                size='small'
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Final Summary */}
      <Box mt={3}>
        <Paper
          variant='outlined'
          sx={{ p: 3, backgroundColor: 'action.hover' }}
        >
          <Typography variant='subtitle1' gutterBottom>
            Resumo da Ameaça
          </Typography>
          <Typography variant='body1'>
            <strong>{threat.name || 'Ameaça Sem Nome'}</strong> é um(a){' '}
            {threat.type?.toLowerCase()} {threat.size?.toLowerCase()} de papel{' '}
            {threat.role?.toLowerCase()} com nível de desafio{' '}
            {threat.challengeLevel}
            {threat.challengeLevel &&
              ` (${getTierDisplayName(
                getTierByChallengeLevel(threat.challengeLevel)
              )})`}
            . Possui {threat.attacks?.length || 0} ataques configurados e{' '}
            {threat.abilities?.length || 0} habilidades especiais.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default StepEight;
