import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAlert } from '../../../hooks/useDialog';
import { ThreatSheet, ThreatAttack } from '../../../interfaces/ThreatSheet';
import {
  calculateDiceAverage,
  validateDiceString,
} from '../../../functions/threatGenerator';

interface StepFourProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepFour: React.FC<StepFourProps> = ({ threat, onUpdate }) => {
  const { showAlert, AlertDialog } = useAlert();
  const [newAttack, setNewAttack] = useState({
    name: '',
    attackBonus: threat.combatStats?.attackValue?.toString() || '',
    damageDice: '',
    bonusDamage: '',
  });

  // Update attack bonus when combat stats change
  React.useEffect(() => {
    if (threat.combatStats?.attackValue) {
      setNewAttack((prev) => ({
        ...prev,
        attackBonus: threat.combatStats?.attackValue?.toString() || '',
      }));
    }
  }, [threat.combatStats?.attackValue]);

  const generateAttackId = () =>
    `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddAttack = () => {
    if (!newAttack.name.trim() || !newAttack.damageDice.trim()) return;

    // Validate dice string
    if (!validateDiceString(newAttack.damageDice)) {
      showAlert(
        'Formato de dados inválido. Use formatos como "1d8", "2d6", "3d10"',
        'Formato Inválido'
      );
      return;
    }

    const bonusDamage = parseInt(newAttack.bonusDamage, 10) || 0;
    const averageDamage = calculateDiceAverage(
      newAttack.damageDice,
      bonusDamage
    );

    const attack: ThreatAttack = {
      id: generateAttackId(),
      name: newAttack.name.trim(),
      attackBonus: parseInt(newAttack.attackBonus, 10) || 0,
      damageDice: newAttack.damageDice.trim(),
      bonusDamage,
      averageDamage,
    };

    const updatedAttacks = [...(threat.attacks || []), attack];
    onUpdate({ attacks: updatedAttacks });

    // Clear form
    setNewAttack({
      name: '',
      attackBonus: threat.combatStats?.attackValue?.toString() || '',
      damageDice: '',
      bonusDamage: '',
    });
  };

  const handleRemoveAttack = (attackId: string) => {
    const { attacks = [] } = threat;
    const updatedAttacks = attacks.filter((attack) => attack.id !== attackId);
    onUpdate({ attacks: updatedAttacks });
  };

  const { combatStats } = threat;

  return (
    <>
      <AlertDialog />
      <Box p={3}>
        <Typography variant='h6' gutterBottom>
          Ataques
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={3}>
          Configure os ataques da ameaça. Use o valor de ataque e dano médio
          calculados como referência.
        </Typography>

        {/* Combat Stats Reference */}
        {combatStats && (
          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='body2'>
              <strong>Referência do Sistema:</strong> Valor de Ataque: +
              {combatStats.attackValue} | Dano Médio Sugerido:{' '}
              {combatStats.averageDamage}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Add New Attack Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='subtitle1' gutterBottom>
                Adicionar Novo Ataque
              </Typography>

              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label='Nome do Ataque'
                    value={newAttack.name}
                    onChange={(e) =>
                      setNewAttack({ ...newAttack, name: e.target.value })
                    }
                    placeholder='Ex: Garra, Mordida, Espada Longa'
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Bônus de Ataque'
                    value={newAttack.attackBonus}
                    onChange={(e) =>
                      setNewAttack({
                        ...newAttack,
                        attackBonus: e.target.value,
                      })
                    }
                    placeholder='0'
                    helperText={`Padrão: +${
                      threat.combatStats?.attackValue || '?'
                    } (pode ser alterado)`}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Dados de Dano'
                    value={newAttack.damageDice}
                    onChange={(e) =>
                      setNewAttack({ ...newAttack, damageDice: e.target.value })
                    }
                    placeholder='Ex: 1d8, 2d6, 3d10'
                    helperText='Formato: XdY'
                    error={
                      newAttack.damageDice.trim() !== '' &&
                      !validateDiceString(newAttack.damageDice)
                    }
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Dano Bônus'
                    value={newAttack.bonusDamage}
                    onChange={(e) =>
                      setNewAttack({
                        ...newAttack,
                        bonusDamage: e.target.value,
                      })
                    }
                    placeholder='0'
                    helperText='Dano adicional fixo'
                  />
                </Grid>

                {/* Damage Comparison */}
                {newAttack.damageDice.trim() !== '' &&
                  validateDiceString(newAttack.damageDice) && (
                    <Grid size={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant='body2' gutterBottom>
                          <strong>Comparação de Dano:</strong>
                        </Typography>
                        <Box
                          display='flex'
                          justifyContent='space-between'
                          alignItems='center'
                        >
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Dano calculado:{' '}
                              <strong>
                                {calculateDiceAverage(
                                  newAttack.damageDice,
                                  parseInt(newAttack.bonusDamage, 10) || 0
                                )}
                              </strong>
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant='body2' color='text.secondary'>
                              Dano sugerido:{' '}
                              <strong>
                                {combatStats?.averageDamage || '?'}
                              </strong>
                            </Typography>
                          </Box>
                          <Box>
                            {(() => {
                              const calculated = calculateDiceAverage(
                                newAttack.damageDice,
                                parseInt(newAttack.bonusDamage, 10) || 0
                              );
                              const suggested = combatStats?.averageDamage || 0;
                              const diff = Math.abs(calculated - suggested);
                              const isClose = diff <= 2;

                              let colorValue = 'error.main';
                              let statusText = '✗ Muito distante';

                              if (isClose) {
                                colorValue = 'success.main';
                                statusText = '✓ Próximo';
                              } else if (diff <= 5) {
                                colorValue = 'warning.main';
                                statusText = '⚠ Distante';
                              }

                              return (
                                <Typography
                                  variant='body2'
                                  color={colorValue}
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {statusText}
                                </Typography>
                              );
                            })()}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                <Grid size={12}>
                  <Button
                    variant='contained'
                    fullWidth
                    onClick={handleAddAttack}
                    disabled={
                      !newAttack.name.trim() ||
                      !newAttack.damageDice.trim() ||
                      !validateDiceString(newAttack.damageDice)
                    }
                    startIcon={<AddIcon />}
                  >
                    Adicionar Ataque
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Current Attacks List */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant='outlined' sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant='subtitle1' gutterBottom>
                Ataques Configurados ({threat.attacks?.length || 0})
              </Typography>

              {!threat.attacks || threat.attacks.length === 0 ? (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ py: 2 }}
                >
                  Nenhum ataque configurado ainda.
                </Typography>
              ) : (
                <List dense>
                  {threat.attacks?.map((attack, index) => (
                    <React.Fragment key={attack.id}>
                      <ListItem>
                        <ListItemText
                          primary={attack.name}
                          secondary={`Ataque: +${attack.attackBonus} | Dano: ${
                            attack.damageDice
                          }${
                            attack.bonusDamage > 0
                              ? `+${attack.bonusDamage}`
                              : ''
                          } (${attack.averageDamage} médio)`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge='end'
                            onClick={() => handleRemoveAttack(attack.id)}
                            size='small'
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < (threat.attacks?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Attack Guidelines */}
        <Box mt={4}>
          <Typography variant='subtitle1' gutterBottom>
            Dicas para Ataques
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant='outlined' sx={{ p: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  <strong>Dados de Dano</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Use formatos como &quot;1d8&quot;, &quot;2d6&quot;,
                  &quot;3d10&quot;. O dano médio é calculado automaticamente.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant='outlined' sx={{ p: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  <strong>Dano Bônus</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Dano adicional de modificadores, habilidades especiais ou
                  efeitos mágicos.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant='outlined' sx={{ p: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  <strong>Bônus de Ataque</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Valor calculado pelo sistema (+
                  {combatStats?.attackValue || '?'}
                  ). Pode ser personalizado se necessário.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default StepFour;
