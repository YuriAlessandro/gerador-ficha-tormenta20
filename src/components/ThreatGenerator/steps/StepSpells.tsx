import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CasinoIcon from '@mui/icons-material/Casino';
import {
  ThreatSheet,
  ThreatSpell,
  AbilityRoll,
  ThreatActionType,
} from '../../../interfaces/ThreatSheet';
import { ConditionsListEditor } from '../../../premium/components/Conditions';
import type { ConditionId } from '../../../premium/data/conditions';
import SectionCard from './shared/SectionCard';
import RollsEditor from './shared/RollsEditor';
import AbilityFormFields from './shared/AbilityFormFields';

interface StepSpellsProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const generateSpellId = () =>
  `spell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const StepSpells: React.FC<StepSpellsProps> = ({ threat, onUpdate }) => {
  const [newSpell, setNewSpell] = useState({
    name: '',
    description: '',
    hasPmCost: true,
    pmCost: 1,
    actionType: 'Padrão' as ThreatActionType,
  });
  const [newSpellRolls, setNewSpellRolls] = useState<AbilityRoll[]>([]);
  const [newSpellConditions, setNewSpellConditions] = useState<ConditionId[]>(
    []
  );

  const [editSpellDialog, setEditSpellDialog] = useState(false);
  const [editingSpell, setEditingSpell] = useState<{
    id: string;
    name: string;
    description: string;
    hasPmCost: boolean;
    pmCost: number;
    actionType: ThreatActionType;
  } | null>(null);
  const [editSpellRolls, setEditSpellRolls] = useState<AbilityRoll[]>([]);
  const [editSpellConditions, setEditSpellConditions] = useState<ConditionId[]>(
    []
  );

  const handleAddSpell = () => {
    if (!newSpell.name.trim()) return;

    const spell: ThreatSpell = {
      id: generateSpellId(),
      name: newSpell.name.trim(),
      description: newSpell.description.trim(),
      rolls: newSpellRolls.length > 0 ? newSpellRolls : undefined,
      pmCost:
        newSpell.hasPmCost && newSpell.pmCost > 0 ? newSpell.pmCost : undefined,
      actionType:
        newSpell.actionType !== 'Padrão' ? newSpell.actionType : undefined,
      grantsConditions:
        newSpellConditions.length > 0 ? newSpellConditions : undefined,
    };

    onUpdate({ spells: [...(threat.spells || []), spell] });

    setNewSpell({
      name: '',
      description: '',
      hasPmCost: true,
      pmCost: 1,
      actionType: 'Padrão',
    });
    setNewSpellRolls([]);
    setNewSpellConditions([]);
  };

  const handleRemoveSpell = (spellId: string) => {
    onUpdate({
      spells: (threat.spells || []).filter((s) => s.id !== spellId),
    });
  };

  const handleEditSpell = (spell: ThreatSpell) => {
    setEditingSpell({
      id: spell.id,
      name: spell.name,
      description: spell.description,
      hasPmCost: (spell.pmCost ?? 0) > 0,
      pmCost: spell.pmCost || 1,
      actionType: spell.actionType || 'Padrão',
    });
    setEditSpellRolls(spell.rolls ? spell.rolls.map((r) => ({ ...r })) : []);
    setEditSpellConditions(spell.grantsConditions ?? []);
    setEditSpellDialog(true);
  };

  const handleSaveEditSpell = () => {
    if (!editingSpell || !editingSpell.name.trim()) return;

    const updatedSpell: ThreatSpell = {
      id: editingSpell.id,
      name: editingSpell.name.trim(),
      description: editingSpell.description.trim(),
      rolls: editSpellRolls.length > 0 ? editSpellRolls : undefined,
      pmCost:
        editingSpell.hasPmCost && editingSpell.pmCost > 0
          ? editingSpell.pmCost
          : undefined,
      actionType:
        editingSpell.actionType !== 'Padrão'
          ? editingSpell.actionType
          : undefined,
      grantsConditions:
        editSpellConditions.length > 0 ? editSpellConditions : undefined,
    };

    onUpdate({
      spells: (threat.spells || []).map((s) =>
        s.id === updatedSpell.id ? updatedSpell : s
      ),
    });

    setEditSpellDialog(false);
    setEditingSpell(null);
    setEditSpellRolls([]);
    setEditSpellConditions([]);
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Typography variant='h6' gutterBottom>
        Magias
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Adicione magias que a ameaça pode conjurar. Elas aparecem em uma seção
        separada na ficha.
      </Typography>

      <Grid container spacing={3}>
        {/* Add New Spell */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<AutoFixHighIcon />}
            title='Adicionar Magia'
            subtitle='Nome, efeito, custo de PM e rolagens.'
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Nome da Magia'
                  value={newSpell.name}
                  onChange={(e) =>
                    setNewSpell({ ...newSpell, name: e.target.value })
                  }
                  placeholder='Ex: Bola de Fogo, Curar Ferimentos, Relâmpago'
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Descrição'
                  value={newSpell.description}
                  onChange={(e) =>
                    setNewSpell({ ...newSpell, description: e.target.value })
                  }
                  placeholder='Descreva o efeito da magia...'
                />
              </Grid>
              <Grid size={12}>
                <AbilityFormFields
                  actionType={newSpell.actionType}
                  onActionTypeChange={(actionType) =>
                    setNewSpell({ ...newSpell, actionType })
                  }
                  hasPmCost={newSpell.hasPmCost}
                  onHasPmCostChange={(hasPmCost) =>
                    setNewSpell({ ...newSpell, hasPmCost })
                  }
                  pmCost={newSpell.pmCost}
                  onPmCostChange={(pmCost) =>
                    setNewSpell({ ...newSpell, pmCost })
                  }
                  pmLabel='Esta magia custa PM?'
                />
              </Grid>
              <Grid size={12}>
                <RollsEditor
                  value={newSpellRolls}
                  onChange={setNewSpellRolls}
                  helperText='Adicione rolagens de dados. Ex: Dano (8d6)'
                  dicePlaceholder='8d6'
                />
              </Grid>
              <Grid size={12}>
                <ConditionsListEditor
                  value={newSpellConditions}
                  onChange={setNewSpellConditions}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleAddSpell}
                  disabled={!newSpell.name.trim()}
                  startIcon={<AddIcon />}
                >
                  Adicionar Magia
                </Button>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* Configured Spells */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<FormatListBulletedIcon />}
            title={`Magias (${threat.spells?.length || 0})`}
          >
            {!threat.spells || threat.spells.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
                Nenhuma magia configurada ainda.
              </Typography>
            ) : (
              <List dense>
                {threat.spells?.map((spell, index) => (
                  <React.Fragment key={spell.id}>
                    <ListItem alignItems='flex-start'>
                      <ListItemText
                        primary={
                          <Box>
                            {spell.name}
                            {(spell.pmCost ||
                              (spell.actionType &&
                                spell.actionType !== 'Padrão')) && (
                              <Typography
                                component='span'
                                variant='body2'
                                color='text.secondary'
                                sx={{ ml: 1 }}
                              >
                                (
                                {[
                                  spell.actionType &&
                                  spell.actionType !== 'Padrão'
                                    ? spell.actionType
                                    : null,
                                  spell.pmCost ? `${spell.pmCost} PM` : null,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                                )
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {spell.description || 'Sem descrição fornecida'}
                            </Typography>
                            {spell.rolls && spell.rolls.length > 0 && (
                              <Box mt={1}>
                                {spell.rolls.map((roll) => (
                                  <Chip
                                    key={roll.id}
                                    label={`${roll.name}: ${roll.dice}${
                                      roll.bonus >= 0
                                        ? `+${roll.bonus}`
                                        : roll.bonus
                                    }`}
                                    size='small'
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                    icon={<CasinoIcon />}
                                    variant='outlined'
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => handleEditSpell(spell)}
                          size='small'
                          color='primary'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge='end'
                          onClick={() => handleRemoveSpell(spell.id)}
                          size='small'
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < (threat.spells?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Edit Spell Dialog */}
      <Dialog
        open={editSpellDialog}
        onClose={() => setEditSpellDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Magia</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Nome'
            value={editingSpell?.name || ''}
            onChange={(e) =>
              setEditingSpell((prev) =>
                prev ? { ...prev, name: e.target.value } : null
              )
            }
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Descrição'
            value={editingSpell?.description || ''}
            onChange={(e) =>
              setEditingSpell((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
            sx={{ mb: 2 }}
          />
          {editingSpell && (
            <Box sx={{ mb: 2 }}>
              <AbilityFormFields
                actionType={editingSpell.actionType}
                onActionTypeChange={(actionType) =>
                  setEditingSpell((prev) =>
                    prev ? { ...prev, actionType } : null
                  )
                }
                hasPmCost={editingSpell.hasPmCost}
                onHasPmCostChange={(hasPmCost) =>
                  setEditingSpell((prev) =>
                    prev ? { ...prev, hasPmCost } : null
                  )
                }
                pmCost={editingSpell.pmCost}
                onPmCostChange={(pmCost) =>
                  setEditingSpell((prev) => (prev ? { ...prev, pmCost } : null))
                }
                pmLabel='Esta magia custa PM?'
              />
            </Box>
          )}
          <RollsEditor value={editSpellRolls} onChange={setEditSpellRolls} />
          <Box mt={3}>
            <ConditionsListEditor
              value={editSpellConditions}
              onChange={setEditSpellConditions}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSpellDialog(false)}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={handleSaveEditSpell}
            disabled={!editingSpell?.name.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepSpells;
