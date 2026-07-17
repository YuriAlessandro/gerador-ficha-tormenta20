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
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CasinoIcon from '@mui/icons-material/Casino';
import {
  ThreatSheet,
  ThreatAbility,
  AbilityRoll,
  ThreatActionType,
} from '../../../interfaces/ThreatSheet';
import { getRecommendedAbilityCount } from '../../../functions/threatGenerator';
import {
  ABILITY_SUGGESTIONS,
  ABILITY_CATEGORIES,
} from '../../../data/systems/tormenta20/threats/abilitySuggestions';
import { ConditionsListEditor } from '../../../premium/components/Conditions';
import type { ConditionId } from '../../../premium/data/conditions';
import SectionCard from './shared/SectionCard';
import RollsEditor from './shared/RollsEditor';
import AbilityFormFields from './shared/AbilityFormFields';

interface StepAbilitiesProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const generateAbilityId = () =>
  `ability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const StepAbilities: React.FC<StepAbilitiesProps> = ({ threat, onUpdate }) => {
  const [newAbility, setNewAbility] = useState({
    name: '',
    description: '',
    hasPmCost: false,
    pmCost: 1,
    actionType: 'Padrão' as ThreatActionType,
  });
  const [newAbilityRolls, setNewAbilityRolls] = useState<AbilityRoll[]>([]);
  const [newAbilityConditions, setNewAbilityConditions] = useState<
    ConditionId[]
  >([]);

  const [suggestionDialog, setSuggestionDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [customizeDialog, setCustomizeDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    name: string;
    description: string;
    hasPmCost: boolean;
    pmCost: number;
    actionType: ThreatActionType;
  } | null>(null);
  const [selectedSuggestionRolls, setSelectedSuggestionRolls] = useState<
    AbilityRoll[]
  >([]);
  const [selectedSuggestionConditions, setSelectedSuggestionConditions] =
    useState<ConditionId[]>([]);

  const [editAbilityDialog, setEditAbilityDialog] = useState(false);
  const [editingAbility, setEditingAbility] = useState<{
    id: string;
    name: string;
    description: string;
    hasPmCost: boolean;
    pmCost: number;
    actionType: ThreatActionType;
  } | null>(null);
  const [editAbilityRolls, setEditAbilityRolls] = useState<AbilityRoll[]>([]);
  const [editAbilityConditions, setEditAbilityConditions] = useState<
    ConditionId[]
  >([]);

  const handleAddAbility = () => {
    if (!newAbility.name.trim()) return;

    const ability: ThreatAbility = {
      id: generateAbilityId(),
      name: newAbility.name.trim(),
      description: newAbility.description.trim(),
      rolls: newAbilityRolls.length > 0 ? newAbilityRolls : undefined,
      pmCost:
        newAbility.hasPmCost && newAbility.pmCost > 0
          ? newAbility.pmCost
          : undefined,
      actionType:
        newAbility.actionType !== 'Padrão' ? newAbility.actionType : undefined,
      grantsConditions:
        newAbilityConditions.length > 0 ? newAbilityConditions : undefined,
    };

    onUpdate({ abilities: [...(threat.abilities || []), ability] });

    setNewAbility({
      name: '',
      description: '',
      hasPmCost: false,
      pmCost: 1,
      actionType: 'Padrão',
    });
    setNewAbilityRolls([]);
    setNewAbilityConditions([]);
  };

  const handleRemoveAbility = (abilityId: string) => {
    onUpdate({
      abilities: (threat.abilities || []).filter((a) => a.id !== abilityId),
    });
  };

  const handleSelectSuggestion = (suggestion: {
    name: string;
    description: string;
  }) => {
    setSelectedSuggestion({
      ...suggestion,
      hasPmCost: false,
      pmCost: 1,
      actionType: 'Padrão',
    });
    setSelectedSuggestionRolls([]);
    setSelectedSuggestionConditions([]);
    setSuggestionDialog(false);
    setCustomizeDialog(true);
  };

  const handleAddSuggestion = () => {
    if (!selectedSuggestion) return;

    const ability: ThreatAbility = {
      id: generateAbilityId(),
      name: selectedSuggestion.name,
      description: selectedSuggestion.description,
      rolls:
        selectedSuggestionRolls.length > 0
          ? selectedSuggestionRolls
          : undefined,
      pmCost:
        selectedSuggestion.hasPmCost && selectedSuggestion.pmCost > 0
          ? selectedSuggestion.pmCost
          : undefined,
      actionType:
        selectedSuggestion.actionType !== 'Padrão'
          ? selectedSuggestion.actionType
          : undefined,
      grantsConditions:
        selectedSuggestionConditions.length > 0
          ? selectedSuggestionConditions
          : undefined,
    };

    onUpdate({ abilities: [...(threat.abilities || []), ability] });

    setSelectedSuggestion(null);
    setSelectedSuggestionRolls([]);
    setSelectedSuggestionConditions([]);
    setCustomizeDialog(false);
  };

  const handleEditAbility = (ability: ThreatAbility) => {
    setEditingAbility({
      id: ability.id,
      name: ability.name,
      description: ability.description,
      hasPmCost: (ability.pmCost ?? 0) > 0,
      pmCost: ability.pmCost || 1,
      actionType: ability.actionType || 'Padrão',
    });
    setEditAbilityRolls(
      ability.rolls ? ability.rolls.map((r) => ({ ...r })) : []
    );
    setEditAbilityConditions(ability.grantsConditions ?? []);
    setEditAbilityDialog(true);
  };

  const handleSaveEditAbility = () => {
    if (!editingAbility || !editingAbility.name.trim()) return;

    const updatedAbility: ThreatAbility = {
      id: editingAbility.id,
      name: editingAbility.name.trim(),
      description: editingAbility.description.trim(),
      rolls: editAbilityRolls.length > 0 ? editAbilityRolls : undefined,
      pmCost:
        editingAbility.hasPmCost && editingAbility.pmCost > 0
          ? editingAbility.pmCost
          : undefined,
      actionType:
        editingAbility.actionType !== 'Padrão'
          ? editingAbility.actionType
          : undefined,
      grantsConditions:
        editAbilityConditions.length > 0 ? editAbilityConditions : undefined,
    };

    onUpdate({
      abilities: (threat.abilities || []).map((a) =>
        a.id === updatedAbility.id ? updatedAbility : a
      ),
    });

    setEditAbilityDialog(false);
    setEditingAbility(null);
    setEditAbilityRolls([]);
    setEditAbilityConditions([]);
  };

  const abilityRecommendation =
    threat.role && threat.challengeLevel
      ? getRecommendedAbilityCount(threat.role, threat.challengeLevel)
      : null;

  const currentAbilityCount = threat.abilities?.length || 0;

  const filteredSuggestions =
    selectedCategory === 'Todas'
      ? ABILITY_SUGGESTIONS
      : ABILITY_SUGGESTIONS.filter((s) => s.category === selectedCategory);

  let recommendationLabel = 'Ideal';
  let recommendationColor: 'success' | 'warning' = 'success';
  if (abilityRecommendation) {
    if (currentAbilityCount < abilityRecommendation.min) {
      recommendationLabel = 'Poucas';
      recommendationColor = 'warning';
    } else if (currentAbilityCount > abilityRecommendation.max) {
      recommendationLabel = 'Muitas';
      recommendationColor = 'warning';
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant='h6' gutterBottom>
        Habilidades
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 3,
        }}
      >
        Adicione habilidades especiais que tornam a ameaça única. Crie do zero
        ou escolha das sugestões.
      </Typography>
      {abilityRecommendation && (
        <Alert severity='info' sx={{ mb: 3 }} icon={<InfoIcon />}>
          <Typography variant='body2'>
            <strong>
              Recomendação para {threat.role} ND {threat.challengeLevel}:
            </strong>{' '}
            {abilityRecommendation.min} a {abilityRecommendation.max}{' '}
            habilidades (Patamar: {abilityRecommendation.tier})
          </Typography>
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Add New Ability */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<AutoAwesomeIcon />}
            title='Adicionar Habilidade'
            subtitle='Personalizada ou a partir das sugestões.'
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => setSuggestionDialog(true)}
                  startIcon={<LibraryAddIcon />}
                >
                  Escolher das Sugestões
                </Button>
              </Grid>
              <Grid size={12}>
                <Divider>OU</Divider>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Nome da Habilidade'
                  value={newAbility.name}
                  onChange={(e) =>
                    setNewAbility({ ...newAbility, name: e.target.value })
                  }
                  placeholder='Ex: Resistência a Fogo, Regeneração, Voo'
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Descrição'
                  value={newAbility.description}
                  onChange={(e) =>
                    setNewAbility({
                      ...newAbility,
                      description: e.target.value,
                    })
                  }
                  placeholder='Descreva o efeito da habilidade...'
                />
              </Grid>
              <Grid size={12}>
                <AbilityFormFields
                  actionType={newAbility.actionType}
                  onActionTypeChange={(actionType) =>
                    setNewAbility({ ...newAbility, actionType })
                  }
                  hasPmCost={newAbility.hasPmCost}
                  onHasPmCostChange={(hasPmCost) =>
                    setNewAbility({ ...newAbility, hasPmCost })
                  }
                  pmCost={newAbility.pmCost}
                  onPmCostChange={(pmCost) =>
                    setNewAbility({ ...newAbility, pmCost })
                  }
                />
              </Grid>
              <Grid size={12}>
                <RollsEditor
                  value={newAbilityRolls}
                  onChange={setNewAbilityRolls}
                  helperText='Adicione rolagens de dados. Ex: Sopro de Fogo (2d6+3)'
                />
              </Grid>
              <Grid size={12}>
                <ConditionsListEditor
                  value={newAbilityConditions}
                  onChange={setNewAbilityConditions}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleAddAbility}
                  disabled={!newAbility.name.trim()}
                  startIcon={<AddIcon />}
                >
                  Adicionar Habilidade
                </Button>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* Configured Abilities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<FormatListBulletedIcon />}
            title={`Habilidades (${currentAbilityCount})`}
            action={
              abilityRecommendation ? (
                <Chip
                  size='small'
                  label={recommendationLabel}
                  color={recommendationColor}
                />
              ) : undefined
            }
          >
            {!threat.abilities || threat.abilities.length === 0 ? (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  py: 2,
                }}
              >
                Nenhuma habilidade configurada ainda.
              </Typography>
            ) : (
              <List dense>
                {threat.abilities?.map((ability, index) => (
                  <React.Fragment key={ability.id}>
                    <ListItem alignItems='flex-start'>
                      <ListItemText
                        primary={
                          <Box>
                            {ability.name}
                            {(ability.pmCost ||
                              (ability.actionType &&
                                ability.actionType !== 'Padrão')) && (
                              <Typography
                                component='span'
                                variant='body2'
                                sx={{
                                  color: 'text.secondary',
                                  ml: 1,
                                }}
                              >
                                (
                                {[
                                  ability.actionType &&
                                  ability.actionType !== 'Padrão'
                                    ? ability.actionType
                                    : null,
                                  ability.pmCost
                                    ? `${ability.pmCost} PM`
                                    : null,
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
                              sx={{
                                color: 'text.secondary',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {ability.description || 'Sem descrição fornecida'}
                            </Typography>
                            {ability.rolls && ability.rolls.length > 0 && (
                              <Box
                                sx={{
                                  mt: 1,
                                }}
                              >
                                {ability.rolls.map((roll) => (
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
                          onClick={() => handleEditAbility(ability)}
                          size='small'
                          color='primary'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge='end'
                          onClick={() => handleRemoveAbility(ability.id)}
                          size='small'
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < (threat.abilities?.length || 0) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>
      {/* Suggestions Dialog */}
      <Dialog
        open={suggestionDialog}
        onClose={() => setSuggestionDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Escolher Habilidade das Sugestões</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={selectedCategory}
              label='Categoria'
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {ABILITY_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            {filteredSuggestions.map((suggestion) => (
              <Grid size={{ xs: 12, md: 6 }} key={suggestion.name}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      {suggestion.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        height: '80px',
                        overflow: 'auto',
                      }}
                    >
                      {suggestion.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size='small'
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      Selecionar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuggestionDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
      {/* Customize Dialog */}
      <Dialog
        open={customizeDialog}
        onClose={() => setCustomizeDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Personalizar Habilidade</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Nome'
            value={selectedSuggestion?.name || ''}
            onChange={(e) =>
              setSelectedSuggestion((prev) =>
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
            value={selectedSuggestion?.description || ''}
            onChange={(e) =>
              setSelectedSuggestion((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
            sx={{ mb: 2 }}
          />
          {selectedSuggestion && (
            <Box sx={{ mb: 2 }}>
              <AbilityFormFields
                actionType={selectedSuggestion.actionType}
                onActionTypeChange={(actionType) =>
                  setSelectedSuggestion((prev) =>
                    prev ? { ...prev, actionType } : null
                  )
                }
                hasPmCost={selectedSuggestion.hasPmCost}
                onHasPmCostChange={(hasPmCost) =>
                  setSelectedSuggestion((prev) =>
                    prev ? { ...prev, hasPmCost } : null
                  )
                }
                pmCost={selectedSuggestion.pmCost}
                onPmCostChange={(pmCost) =>
                  setSelectedSuggestion((prev) =>
                    prev ? { ...prev, pmCost } : null
                  )
                }
              />
            </Box>
          )}
          <RollsEditor
            value={selectedSuggestionRolls}
            onChange={setSelectedSuggestionRolls}
          />
          <Box
            sx={{
              mt: 3,
            }}
          >
            <ConditionsListEditor
              value={selectedSuggestionConditions}
              onChange={setSelectedSuggestionConditions}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizeDialog(false)}>Cancelar</Button>
          <Button variant='contained' onClick={handleAddSuggestion}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Ability Dialog */}
      <Dialog
        open={editAbilityDialog}
        onClose={() => setEditAbilityDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Habilidade</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Nome'
            value={editingAbility?.name || ''}
            onChange={(e) =>
              setEditingAbility((prev) =>
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
            value={editingAbility?.description || ''}
            onChange={(e) =>
              setEditingAbility((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
            sx={{ mb: 2 }}
          />
          {editingAbility && (
            <Box sx={{ mb: 2 }}>
              <AbilityFormFields
                actionType={editingAbility.actionType}
                onActionTypeChange={(actionType) =>
                  setEditingAbility((prev) =>
                    prev ? { ...prev, actionType } : null
                  )
                }
                hasPmCost={editingAbility.hasPmCost}
                onHasPmCostChange={(hasPmCost) =>
                  setEditingAbility((prev) =>
                    prev ? { ...prev, hasPmCost } : null
                  )
                }
                pmCost={editingAbility.pmCost}
                onPmCostChange={(pmCost) =>
                  setEditingAbility((prev) =>
                    prev ? { ...prev, pmCost } : null
                  )
                }
              />
            </Box>
          )}
          <RollsEditor
            value={editAbilityRolls}
            onChange={setEditAbilityRolls}
          />
          <Box
            sx={{
              mt: 3,
            }}
          >
            <ConditionsListEditor
              value={editAbilityConditions}
              onChange={setEditAbilityConditions}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAbilityDialog(false)}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={handleSaveEditAbility}
            disabled={!editingAbility?.name.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepAbilities;
