import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAlert } from '../../../hooks/useDialog';
import {
  ThreatSheet,
  ThreatAttack,
  BonusDamageDice,
} from '../../../interfaces/ThreatSheet';
import { ALL_DAMAGE_TYPES } from '../../../interfaces/CharacterSheet';
import {
  calculateDiceAverage,
  calculateBonusDiceAverage,
  validateDiceString,
} from '../../../functions/threatGenerator';
import { ConditionsListEditor } from '../../../premium/components/Conditions';
import type { ConditionId } from '../../../premium/data/conditions';

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
    criticalThreshold: '20',
    criticalMultiplier: '2',
  });
  const [bonusDamageDice, setBonusDamageDice] = useState<BonusDamageDice[]>([]);
  const [newBonusDice, setNewBonusDice] = useState({
    dice: '',
    damageType: '',
  });
  const [newAttackConditions, setNewAttackConditions] = useState<ConditionId[]>(
    []
  );

  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editingAttack, setEditingAttack] = useState<{
    id: string;
    name: string;
    attackBonus: string;
    damageDice: string;
    bonusDamage: string;
    criticalThreshold: string;
    criticalMultiplier: string;
  } | null>(null);
  const [editBonusDamageDice, setEditBonusDamageDice] = useState<
    BonusDamageDice[]
  >([]);
  const [editNewBonusDice, setEditNewBonusDice] = useState({
    dice: '',
    damageType: '',
  });
  const [editAttackConditions, setEditAttackConditions] = useState<
    ConditionId[]
  >([]);

  const generateBonusDiceId = () =>
    `bd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddBonusDice = () => {
    if (
      !newBonusDice.dice.trim() ||
      !newBonusDice.damageType.trim() ||
      !validateDiceString(newBonusDice.dice)
    )
      return;

    setBonusDamageDice((prev) => [
      ...prev,
      {
        id: generateBonusDiceId(),
        dice: newBonusDice.dice.trim(),
        damageType: newBonusDice.damageType.trim(),
      },
    ]);
    setNewBonusDice({ dice: '', damageType: '' });
  };

  const handleRemoveBonusDice = (id: string) => {
    setBonusDamageDice((prev) => prev.filter((bd) => bd.id !== id));
  };

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
    const bonusDiceAvg = calculateBonusDiceAverage(bonusDamageDice);
    const averageDamage =
      calculateDiceAverage(newAttack.damageDice, bonusDamage) + bonusDiceAvg;

    const criticalThreshold = parseInt(newAttack.criticalThreshold, 10) || 20;
    const criticalMultiplier = parseInt(newAttack.criticalMultiplier, 10) || 2;

    const attack: ThreatAttack = {
      id: generateAttackId(),
      name: newAttack.name.trim(),
      attackBonus: parseInt(newAttack.attackBonus, 10) || 0,
      damageDice: newAttack.damageDice.trim(),
      bonusDamage,
      bonusDamageDice: bonusDamageDice.length > 0 ? bonusDamageDice : undefined,
      averageDamage,
      criticalThreshold:
        criticalThreshold !== 20 ? criticalThreshold : undefined,
      criticalMultiplier:
        criticalMultiplier !== 2 ? criticalMultiplier : undefined,
      grantsConditions:
        newAttackConditions.length > 0 ? newAttackConditions : undefined,
    };

    const updatedAttacks = [...(threat.attacks || []), attack];
    onUpdate({ attacks: updatedAttacks });

    // Clear form
    setNewAttack({
      name: '',
      attackBonus: threat.combatStats?.attackValue?.toString() || '',
      damageDice: '',
      bonusDamage: '',
      criticalThreshold: '20',
      criticalMultiplier: '2',
    });
    setBonusDamageDice([]);
    setNewBonusDice({ dice: '', damageType: '' });
    setNewAttackConditions([]);
  };

  const handleRemoveAttack = (attackId: string) => {
    const { attacks = [] } = threat;
    const updatedAttacks = attacks.filter((attack) => attack.id !== attackId);
    onUpdate({ attacks: updatedAttacks });
  };

  const handleEditAttack = (attack: ThreatAttack) => {
    setEditingAttack({
      id: attack.id,
      name: attack.name,
      attackBonus: attack.attackBonus.toString(),
      damageDice: attack.damageDice,
      bonusDamage: attack.bonusDamage.toString(),
      criticalThreshold: (attack.criticalThreshold || 20).toString(),
      criticalMultiplier: (attack.criticalMultiplier || 2).toString(),
    });
    setEditBonusDamageDice(
      attack.bonusDamageDice
        ? attack.bonusDamageDice.map((bd) => ({ ...bd }))
        : []
    );
    setEditNewBonusDice({ dice: '', damageType: '' });
    setEditAttackConditions(attack.grantsConditions ?? []);
    setEditDialog(true);
  };

  const handleEditAddBonusDice = () => {
    if (
      !editNewBonusDice.dice.trim() ||
      !editNewBonusDice.damageType.trim() ||
      !validateDiceString(editNewBonusDice.dice)
    )
      return;

    setEditBonusDamageDice((prev) => [
      ...prev,
      {
        id: generateBonusDiceId(),
        dice: editNewBonusDice.dice.trim(),
        damageType: editNewBonusDice.damageType.trim(),
      },
    ]);
    setEditNewBonusDice({ dice: '', damageType: '' });
  };

  const handleEditRemoveBonusDice = (id: string) => {
    setEditBonusDamageDice((prev) => prev.filter((bd) => bd.id !== id));
  };

  const handleSaveEditAttack = () => {
    if (!editingAttack) return;
    if (!editingAttack.name.trim() || !editingAttack.damageDice.trim()) return;

    if (!validateDiceString(editingAttack.damageDice)) {
      showAlert(
        'Formato de dados inválido. Use formatos como "1d8", "2d6", "3d10"',
        'Formato Inválido'
      );
      return;
    }

    const bonusDamage = parseInt(editingAttack.bonusDamage, 10) || 0;
    const bonusDiceAvg = calculateBonusDiceAverage(editBonusDamageDice);
    const averageDamage =
      calculateDiceAverage(editingAttack.damageDice, bonusDamage) +
      bonusDiceAvg;

    const criticalThreshold =
      parseInt(editingAttack.criticalThreshold, 10) || 20;
    const criticalMultiplier =
      parseInt(editingAttack.criticalMultiplier, 10) || 2;

    const updatedAttack: ThreatAttack = {
      id: editingAttack.id,
      name: editingAttack.name.trim(),
      attackBonus: parseInt(editingAttack.attackBonus, 10) || 0,
      damageDice: editingAttack.damageDice.trim(),
      bonusDamage,
      bonusDamageDice:
        editBonusDamageDice.length > 0 ? editBonusDamageDice : undefined,
      averageDamage,
      criticalThreshold:
        criticalThreshold !== 20 ? criticalThreshold : undefined,
      criticalMultiplier:
        criticalMultiplier !== 2 ? criticalMultiplier : undefined,
      grantsConditions:
        editAttackConditions.length > 0 ? editAttackConditions : undefined,
    };

    const updatedAttacks = (threat.attacks || []).map((a) =>
      a.id === updatedAttack.id ? updatedAttack : a
    );
    onUpdate({ attacks: updatedAttacks });

    setEditDialog(false);
    setEditingAttack(null);
    setEditBonusDamageDice([]);
    setEditAttackConditions([]);
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

                {/* Bonus Damage Dice Section */}
                <Grid size={12}>
                  <Typography variant='subtitle2' gutterBottom sx={{ mt: 1 }}>
                    Dados de Dano Bônus
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    sx={{ mb: 1 }}
                  >
                    Dados de dano extra com tipo (ex: 2d12 trevas, 1d6 ácido)
                  </Typography>
                  <Grid container spacing={1} alignItems='flex-start'>
                    <Grid size={4}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Dados'
                        value={newBonusDice.dice}
                        onChange={(e) =>
                          setNewBonusDice({
                            ...newBonusDice,
                            dice: e.target.value,
                          })
                        }
                        placeholder='Ex: 2d12'
                        error={
                          newBonusDice.dice.trim() !== '' &&
                          !validateDiceString(newBonusDice.dice)
                        }
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        freeSolo
                        size='small'
                        options={ALL_DAMAGE_TYPES.filter((t) => t !== 'Geral')}
                        value={newBonusDice.damageType}
                        onInputChange={(_e, value) =>
                          setNewBonusDice({
                            ...newBonusDice,
                            damageType: value,
                          })
                        }
                        renderInput={(params) => {
                          const { InputLabelProps, InputProps, ...rest } =
                            params;
                          return (
                            <TextField
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...rest}
                              InputLabelProps={InputLabelProps}
                              InputProps={InputProps}
                              placeholder='Tipo de dano'
                              label='Tipo de Dano'
                            />
                          );
                        }}
                      />
                    </Grid>
                    <Grid size={2}>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={handleAddBonusDice}
                        disabled={
                          !newBonusDice.dice.trim() ||
                          !newBonusDice.damageType.trim() ||
                          !validateDiceString(newBonusDice.dice)
                        }
                        sx={{ minHeight: '40px' }}
                      >
                        <AddIcon fontSize='small' />
                      </Button>
                    </Grid>
                  </Grid>
                  {bonusDamageDice.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {bonusDamageDice.map((bd) => (
                        <Chip
                          key={bd.id}
                          label={`${bd.dice} ${bd.damageType}`}
                          onDelete={() => handleRemoveBonusDice(bd.id)}
                          size='small'
                          color='secondary'
                          variant='outlined'
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                <Grid size={6}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Margem de Ameaça'
                    value={newAttack.criticalThreshold}
                    onChange={(e) =>
                      setNewAttack({
                        ...newAttack,
                        criticalThreshold: e.target.value,
                      })
                    }
                    placeholder='20'
                    helperText='Crítico em rolagem igual ou maior'
                    slotProps={{
                      htmlInput: { min: 1, max: 20 },
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Multiplicador de Crítico'
                    value={newAttack.criticalMultiplier}
                    onChange={(e) =>
                      setNewAttack({
                        ...newAttack,
                        criticalMultiplier: e.target.value,
                      })
                    }
                    placeholder='2'
                    helperText='x2, x3, x4...'
                    slotProps={{
                      htmlInput: { min: 2, max: 6 },
                    }}
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
                                ) + calculateBonusDiceAverage(bonusDamageDice)}
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
                              const calculated =
                                calculateDiceAverage(
                                  newAttack.damageDice,
                                  parseInt(newAttack.bonusDamage, 10) || 0
                                ) + calculateBonusDiceAverage(bonusDamageDice);
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
                  <ConditionsListEditor
                    value={newAttackConditions}
                    onChange={setNewAttackConditions}
                  />
                </Grid>

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
                  {threat.attacks?.map((attack, index) => {
                    const critThreshold = attack.criticalThreshold || 20;
                    const critMultiplier = attack.criticalMultiplier || 2;
                    const critText =
                      critThreshold === 20 && critMultiplier === 2
                        ? ''
                        : ` | Crítico: ${critThreshold}/x${critMultiplier}`;
                    const bonusDiceText =
                      attack.bonusDamageDice &&
                      attack.bonusDamageDice.length > 0
                        ? ` mais ${attack.bonusDamageDice
                            .map((bd) => `${bd.dice} ${bd.damageType}`)
                            .join(', ')}`
                        : '';

                    return (
                      <React.Fragment key={attack.id}>
                        <ListItem>
                          <ListItemText
                            primary={attack.name}
                            secondary={`Ataque: +${
                              attack.attackBonus
                            } | Dano: ${attack.damageDice}${
                              attack.bonusDamage > 0
                                ? `+${attack.bonusDamage}`
                                : ''
                            }${bonusDiceText} (${
                              attack.averageDamage
                            } médio)${critText}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => handleEditAttack(attack)}
                              size='small'
                              color='primary'
                            >
                              <EditIcon />
                            </IconButton>
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
                        {index < (threat.attacks?.length || 0) - 1 && (
                          <Divider />
                        )}
                      </React.Fragment>
                    );
                  })}
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

      {/* Edit Attack Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Ataque</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label='Nome do Ataque'
                value={editingAttack?.name || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Bônus de Ataque'
                value={editingAttack?.attackBonus || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev ? { ...prev, attackBonus: e.target.value } : null
                  )
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label='Dados de Dano'
                value={editingAttack?.damageDice || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev ? { ...prev, damageDice: e.target.value } : null
                  )
                }
                helperText='Formato: XdY'
                error={
                  (editingAttack?.damageDice || '').trim() !== '' &&
                  !validateDiceString(editingAttack?.damageDice || '')
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                type='number'
                label='Dano Bônus'
                value={editingAttack?.bonusDamage || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev ? { ...prev, bonusDamage: e.target.value } : null
                  )
                }
              />
            </Grid>

            {/* Bonus Damage Dice */}
            <Grid size={12}>
              <Typography variant='subtitle2' gutterBottom>
                Dados de Dano Bônus
              </Typography>
              <Grid container spacing={1} alignItems='flex-start'>
                <Grid size={4}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Dados'
                    value={editNewBonusDice.dice}
                    onChange={(e) =>
                      setEditNewBonusDice({
                        ...editNewBonusDice,
                        dice: e.target.value,
                      })
                    }
                    placeholder='Ex: 2d12'
                    error={
                      editNewBonusDice.dice.trim() !== '' &&
                      !validateDiceString(editNewBonusDice.dice)
                    }
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    size='small'
                    options={ALL_DAMAGE_TYPES.filter((t) => t !== 'Geral')}
                    value={editNewBonusDice.damageType}
                    onInputChange={(_e, value) =>
                      setEditNewBonusDice({
                        ...editNewBonusDice,
                        damageType: value,
                      })
                    }
                    renderInput={(params) => {
                      const { InputLabelProps, InputProps, ...rest } = params;
                      return (
                        <TextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...rest}
                          InputLabelProps={InputLabelProps}
                          InputProps={InputProps}
                          placeholder='Tipo de dano'
                          label='Tipo de Dano'
                        />
                      );
                    }}
                  />
                </Grid>
                <Grid size={2}>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={handleEditAddBonusDice}
                    disabled={
                      !editNewBonusDice.dice.trim() ||
                      !editNewBonusDice.damageType.trim() ||
                      !validateDiceString(editNewBonusDice.dice)
                    }
                    sx={{ minHeight: '40px' }}
                  >
                    <AddIcon fontSize='small' />
                  </Button>
                </Grid>
              </Grid>
              {editBonusDamageDice.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    mt: 1,
                  }}
                >
                  {editBonusDamageDice.map((bd) => (
                    <Chip
                      key={bd.id}
                      label={`${bd.dice} ${bd.damageType}`}
                      onDelete={() => handleEditRemoveBonusDice(bd.id)}
                      size='small'
                      color='secondary'
                      variant='outlined'
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Margem de Ameaça'
                value={editingAttack?.criticalThreshold || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev ? { ...prev, criticalThreshold: e.target.value } : null
                  )
                }
                helperText='Crítico em rolagem igual ou maior'
                slotProps={{
                  htmlInput: { min: 1, max: 20 },
                }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type='number'
                label='Multiplicador de Crítico'
                value={editingAttack?.criticalMultiplier || ''}
                onChange={(e) =>
                  setEditingAttack((prev) =>
                    prev
                      ? { ...prev, criticalMultiplier: e.target.value }
                      : null
                  )
                }
                helperText='x2, x3, x4...'
                slotProps={{
                  htmlInput: { min: 2, max: 6 },
                }}
              />
            </Grid>

            {/* Damage Comparison */}
            {editingAttack &&
              editingAttack.damageDice.trim() !== '' &&
              validateDiceString(editingAttack.damageDice) && (
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
                              editingAttack.damageDice,
                              parseInt(editingAttack.bonusDamage, 10) || 0
                            ) + calculateBonusDiceAverage(editBonusDamageDice)}
                          </strong>
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Dano sugerido:{' '}
                          <strong>{combatStats?.averageDamage || '?'}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )}

            <Grid size={12}>
              <ConditionsListEditor
                value={editAttackConditions}
                onChange={setEditAttackConditions}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={handleSaveEditAttack}
            disabled={
              !editingAttack?.name.trim() ||
              !editingAttack?.damageDice.trim() ||
              !validateDiceString(editingAttack?.damageDice || '')
            }
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StepFour;
