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
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import CasinoIcon from '@mui/icons-material/Casino';
import {
  ThreatSheet,
  ThreatAbility,
  ThreatSpell,
  AbilityRoll,
  ThreatActionType,
} from '../../../interfaces/ThreatSheet';
import { getRecommendedAbilityCount } from '../../../functions/threatGenerator';
import {
  ABILITY_SUGGESTIONS,
  ABILITY_CATEGORIES,
} from '../../../data/systems/tormenta20/threats/abilitySuggestions';

interface StepFiveProps {
  threat: Partial<ThreatSheet>;
  onUpdate: (updates: Partial<ThreatSheet>) => void;
}

const StepFive: React.FC<StepFiveProps> = ({ threat, onUpdate }) => {
  const [newAbility, setNewAbility] = useState({
    name: '',
    description: '',
    hasPmCost: false,
    pmCost: 1,
    actionType: 'Padrão' as ThreatActionType,
  });
  const [newAbilityRolls, setNewAbilityRolls] = useState<AbilityRoll[]>([]);
  const [newRoll, setNewRoll] = useState({ name: '', dice: '', bonus: 0 });
  const [suggestionDialog, setSuggestionDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [customizeDialog, setCustomizeDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    name: string;
    description: string;
    rolls?: AbilityRoll[];
    hasPmCost: boolean;
    pmCost: number;
    actionType: ThreatActionType;
  } | null>(null);
  const [selectedSuggestionRolls, setSelectedSuggestionRolls] = useState<
    AbilityRoll[]
  >([]);
  const [newSuggestionRoll, setNewSuggestionRoll] = useState({
    name: '',
    dice: '',
    bonus: 0,
  });

  // Estados para magias
  const [newSpell, setNewSpell] = useState({
    name: '',
    description: '',
    hasPmCost: true,
    pmCost: 1,
    actionType: 'Padrão' as ThreatActionType,
  });
  const [newSpellRolls, setNewSpellRolls] = useState<AbilityRoll[]>([]);
  const [newSpellRoll, setNewSpellRoll] = useState({
    name: '',
    dice: '',
    bonus: 0,
  });

  const generateAbilityId = () =>
    `ability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const generateRollId = () =>
    `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle adding a roll to the new ability form
  const handleAddRoll = () => {
    if (!newRoll.name.trim() || !newRoll.dice.trim()) return;

    const roll: AbilityRoll = {
      id: generateRollId(),
      name: newRoll.name.trim(),
      dice: newRoll.dice.trim(),
      bonus: newRoll.bonus,
    };

    setNewAbilityRolls([...newAbilityRolls, roll]);
    setNewRoll({ name: '', dice: '', bonus: 0 });
  };

  // Handle removing a roll from the new ability form
  const handleRemoveRoll = (rollId: string) => {
    setNewAbilityRolls(newAbilityRolls.filter((r) => r.id !== rollId));
  };

  // Handle adding a roll to the suggestion dialog
  const handleAddSuggestionRoll = () => {
    if (!newSuggestionRoll.name.trim() || !newSuggestionRoll.dice.trim())
      return;

    const roll: AbilityRoll = {
      id: generateRollId(),
      name: newSuggestionRoll.name.trim(),
      dice: newSuggestionRoll.dice.trim(),
      bonus: newSuggestionRoll.bonus,
    };

    setSelectedSuggestionRolls([...selectedSuggestionRolls, roll]);
    setNewSuggestionRoll({ name: '', dice: '', bonus: 0 });
  };

  // Handle removing a roll from the suggestion dialog
  const handleRemoveSuggestionRoll = (rollId: string) => {
    setSelectedSuggestionRolls(
      selectedSuggestionRolls.filter((r) => r.id !== rollId)
    );
  };

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
    };

    const updatedAbilities = [...(threat.abilities || []), ability];
    onUpdate({ abilities: updatedAbilities });

    // Clear form
    setNewAbility({
      name: '',
      description: '',
      hasPmCost: false,
      pmCost: 1,
      actionType: 'Padrão',
    });
    setNewAbilityRolls([]);
  };

  const handleRemoveAbility = (abilityId: string) => {
    const updatedAbilities = (threat.abilities || []).filter(
      (ability) => ability.id !== abilityId
    );
    onUpdate({ abilities: updatedAbilities });
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
    setNewSuggestionRoll({ name: '', dice: '', bonus: 0 });
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
    };

    const updatedAbilities = [...(threat.abilities || []), ability];
    onUpdate({ abilities: updatedAbilities });

    setSelectedSuggestion(null);
    setSelectedSuggestionRolls([]);
    setCustomizeDialog(false);
  };

  // Handlers para magias
  const generateSpellId = () =>
    `spell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddSpellRoll = () => {
    if (!newSpellRoll.name.trim() || !newSpellRoll.dice.trim()) return;

    const roll: AbilityRoll = {
      id: generateRollId(),
      name: newSpellRoll.name.trim(),
      dice: newSpellRoll.dice.trim(),
      bonus: newSpellRoll.bonus,
    };

    setNewSpellRolls([...newSpellRolls, roll]);
    setNewSpellRoll({ name: '', dice: '', bonus: 0 });
  };

  const handleRemoveSpellRoll = (rollId: string) => {
    setNewSpellRolls(newSpellRolls.filter((r) => r.id !== rollId));
  };

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
    };

    const updatedSpells = [...(threat.spells || []), spell];
    onUpdate({ spells: updatedSpells });

    // Clear form
    setNewSpell({
      name: '',
      description: '',
      hasPmCost: true,
      pmCost: 1,
      actionType: 'Padrão',
    });
    setNewSpellRolls([]);
  };

  const handleRemoveSpell = (spellId: string) => {
    const updatedSpells = (threat.spells || []).filter(
      (spell) => spell.id !== spellId
    );
    onUpdate({ spells: updatedSpells });
  };

  // Get ability recommendations
  const abilityRecommendation =
    threat.role && threat.challengeLevel
      ? getRecommendedAbilityCount(threat.role, threat.challengeLevel)
      : null;

  const currentAbilityCount = threat.abilities?.length || 0;

  // Filter suggestions by category
  const filteredSuggestions =
    selectedCategory === 'Todas'
      ? ABILITY_SUGGESTIONS
      : ABILITY_SUGGESTIONS.filter(
          (suggestion) => suggestion.category === selectedCategory
        );

  return (
    <Box p={3}>
      <Typography variant='h6' gutterBottom>
        Habilidades Especiais
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Adicione habilidades especiais que tornam a ameaça única. Você pode
        criar habilidades personalizadas ou escolher das sugestões.
      </Typography>

      {/* Ability Recommendations */}
      {abilityRecommendation && (
        <Alert severity='info' sx={{ mb: 3 }}>
          <Box display='flex' alignItems='center' gap={1}>
            <InfoIcon fontSize='small' />
            <Typography variant='body2'>
              <strong>
                Recomendação para {threat.role} ND {threat.challengeLevel}:
              </strong>{' '}
              {abilityRecommendation.min} a {abilityRecommendation.max}{' '}
              habilidades (Patamar: {abilityRecommendation.tier})
            </Typography>
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Add New Ability Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Adicionar Nova Habilidade
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => setSuggestionDialog(true)}
                  startIcon={<LibraryAddIcon />}
                  sx={{ mb: 2 }}
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

              {/* Tipo de Ação */}
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Ação</InputLabel>
                  <Select
                    value={newAbility.actionType}
                    label='Tipo de Ação'
                    onChange={(e) =>
                      setNewAbility({
                        ...newAbility,
                        actionType: e.target.value as ThreatActionType,
                      })
                    }
                  >
                    <MenuItem value='Padrão'>Padrão</MenuItem>
                    <MenuItem value='Movimento'>Movimento</MenuItem>
                    <MenuItem value='Completa'>Completa</MenuItem>
                    <MenuItem value='Livre'>Livre</MenuItem>
                    <MenuItem value='Reação'>Reação</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Custo de PM */}
              <Grid size={12}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newAbility.hasPmCost}
                        onChange={(e) =>
                          setNewAbility({
                            ...newAbility,
                            hasPmCost: e.target.checked,
                          })
                        }
                      />
                    }
                    label='Esta habilidade custa PM?'
                  />
                  {newAbility.hasPmCost && (
                    <TextField
                      fullWidth
                      type='number'
                      label='Custo em PM'
                      value={newAbility.pmCost}
                      onChange={(e) =>
                        setNewAbility({
                          ...newAbility,
                          pmCost: Math.max(
                            1,
                            parseInt(e.target.value, 10) || 1
                          ),
                        })
                      }
                      inputProps={{ min: 1 }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Rolls Section */}
              <Grid size={12}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    <CasinoIcon
                      fontSize='small'
                      sx={{ mr: 0.5, verticalAlign: 'middle' }}
                    />
                    Rolagens (Opcional)
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    mb={1}
                  >
                    Adicione rolagens de dados para esta habilidade. Ex: Dano de
                    Sopro de Fogo (2d6+3)
                  </Typography>

                  {/* List of added rolls */}
                  {newAbilityRolls.length > 0 && (
                    <Box mb={2}>
                      {newAbilityRolls.map((roll) => (
                        <Chip
                          key={roll.id}
                          label={`${roll.name}: ${roll.dice}${
                            roll.bonus >= 0 ? `+${roll.bonus}` : roll.bonus
                          }`}
                          onDelete={() => handleRemoveRoll(roll.id)}
                          size='small'
                          sx={{ mr: 0.5, mb: 0.5 }}
                          icon={<CasinoIcon />}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Add new roll form */}
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Nome'
                        value={newRoll.name}
                        onChange={(e) =>
                          setNewRoll({ ...newRoll, name: e.target.value })
                        }
                        placeholder='Dano'
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Dado'
                        value={newRoll.dice}
                        onChange={(e) =>
                          setNewRoll({ ...newRoll, dice: e.target.value })
                        }
                        placeholder='2d6'
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Bônus'
                        type='number'
                        value={newRoll.bonus}
                        onChange={(e) =>
                          setNewRoll({
                            ...newRoll,
                            bonus: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button
                        size='small'
                        variant='outlined'
                        fullWidth
                        onClick={handleAddRoll}
                        disabled={!newRoll.name.trim() || !newRoll.dice.trim()}
                        sx={{ height: '40px' }}
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid size={12}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleAddAbility}
                  disabled={!newAbility.name.trim()}
                  startIcon={<AddIcon />}
                >
                  Adicionar Habilidade Personalizada
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Current Abilities List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, height: 'fit-content' }}>
            <Box display='flex' alignItems='center' gap={2} mb={2}>
              <Typography variant='subtitle1'>
                Habilidades Configuradas ({currentAbilityCount})
              </Typography>
              {abilityRecommendation && (
                <Chip
                  size='small'
                  label={(() => {
                    if (
                      currentAbilityCount >= abilityRecommendation.min &&
                      currentAbilityCount <= abilityRecommendation.max
                    ) {
                      return 'Ideal';
                    }
                    if (currentAbilityCount < abilityRecommendation.min) {
                      return 'Poucas';
                    }
                    return 'Muitas';
                  })()}
                  color={
                    currentAbilityCount >= abilityRecommendation.min &&
                    currentAbilityCount <= abilityRecommendation.max
                      ? 'success'
                      : 'warning'
                  }
                />
              )}
            </Box>

            {!threat.abilities || threat.abilities.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
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
                                color='text.secondary'
                                sx={{ ml: 1 }}
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
                              color='text.secondary'
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {ability.description || 'Sem descrição fornecida'}
                            </Typography>
                            {ability.rolls && ability.rolls.length > 0 && (
                              <Box mt={1}>
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
          </Paper>
        </Grid>
      </Grid>

      {/* Seção de Magias */}
      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' gutterBottom>
        Magias
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Adicione magias que a ameaça pode conjurar. Magias aparecem em uma seção
        separada na ficha.
      </Typography>

      <Grid container spacing={3}>
        {/* Add New Spell Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3 }}>
            <Typography variant='subtitle1' gutterBottom>
              Adicionar Nova Magia
            </Typography>

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
                    setNewSpell({
                      ...newSpell,
                      description: e.target.value,
                    })
                  }
                  placeholder='Descreva o efeito da magia...'
                />
              </Grid>

              {/* Tipo de Ação */}
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Ação</InputLabel>
                  <Select
                    value={newSpell.actionType}
                    label='Tipo de Ação'
                    onChange={(e) =>
                      setNewSpell({
                        ...newSpell,
                        actionType: e.target.value as ThreatActionType,
                      })
                    }
                  >
                    <MenuItem value='Padrão'>Padrão</MenuItem>
                    <MenuItem value='Movimento'>Movimento</MenuItem>
                    <MenuItem value='Completa'>Completa</MenuItem>
                    <MenuItem value='Livre'>Livre</MenuItem>
                    <MenuItem value='Reação'>Reação</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Custo de PM */}
              <Grid size={12}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSpell.hasPmCost}
                        onChange={(e) =>
                          setNewSpell({
                            ...newSpell,
                            hasPmCost: e.target.checked,
                          })
                        }
                      />
                    }
                    label='Esta magia custa PM?'
                  />
                  {newSpell.hasPmCost && (
                    <TextField
                      fullWidth
                      type='number'
                      label='Custo em PM'
                      value={newSpell.pmCost}
                      onChange={(e) =>
                        setNewSpell({
                          ...newSpell,
                          pmCost: Math.max(
                            1,
                            parseInt(e.target.value, 10) || 1
                          ),
                        })
                      }
                      inputProps={{ min: 1 }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Rolls Section */}
              <Grid size={12}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    <CasinoIcon
                      fontSize='small'
                      sx={{ mr: 0.5, verticalAlign: 'middle' }}
                    />
                    Rolagens (Opcional)
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    mb={1}
                  >
                    Adicione rolagens de dados para esta magia. Ex: Dano (8d6)
                  </Typography>

                  {/* List of added rolls */}
                  {newSpellRolls.length > 0 && (
                    <Box mb={2}>
                      {newSpellRolls.map((roll) => (
                        <Chip
                          key={roll.id}
                          label={`${roll.name}: ${roll.dice}${
                            roll.bonus >= 0 ? `+${roll.bonus}` : roll.bonus
                          }`}
                          onDelete={() => handleRemoveSpellRoll(roll.id)}
                          size='small'
                          sx={{ mr: 0.5, mb: 0.5 }}
                          icon={<CasinoIcon />}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Add new roll form */}
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Nome'
                        value={newSpellRoll.name}
                        onChange={(e) =>
                          setNewSpellRoll({
                            ...newSpellRoll,
                            name: e.target.value,
                          })
                        }
                        placeholder='Dano'
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Dado'
                        value={newSpellRoll.dice}
                        onChange={(e) =>
                          setNewSpellRoll({
                            ...newSpellRoll,
                            dice: e.target.value,
                          })
                        }
                        placeholder='8d6'
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        size='small'
                        fullWidth
                        label='Bônus'
                        type='number'
                        value={newSpellRoll.bonus}
                        onChange={(e) =>
                          setNewSpellRoll({
                            ...newSpellRoll,
                            bonus: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Button
                        size='small'
                        variant='outlined'
                        fullWidth
                        onClick={handleAddSpellRoll}
                        disabled={
                          !newSpellRoll.name.trim() || !newSpellRoll.dice.trim()
                        }
                        sx={{ height: '40px' }}
                      >
                        <AddIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
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
          </Paper>
        </Grid>

        {/* Current Spells List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant='subtitle1' mb={2}>
              Magias Configuradas ({threat.spells?.length || 0})
            </Typography>

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
          </Paper>
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
                      color='text.secondary'
                      sx={{
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

          {/* Tipo de Ação */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Ação</InputLabel>
            <Select
              value={selectedSuggestion?.actionType || 'Padrão'}
              label='Tipo de Ação'
              onChange={(e) =>
                setSelectedSuggestion((prev) =>
                  prev
                    ? {
                        ...prev,
                        actionType: e.target.value as ThreatActionType,
                      }
                    : null
                )
              }
            >
              <MenuItem value='Padrão'>Padrão</MenuItem>
              <MenuItem value='Movimento'>Movimento</MenuItem>
              <MenuItem value='Completa'>Completa</MenuItem>
              <MenuItem value='Livre'>Livre</MenuItem>
              <MenuItem value='Reação'>Reação</MenuItem>
            </Select>
          </FormControl>

          {/* Custo de PM */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={selectedSuggestion?.hasPmCost || false}
                  onChange={(e) =>
                    setSelectedSuggestion((prev) =>
                      prev ? { ...prev, hasPmCost: e.target.checked } : null
                    )
                  }
                />
              }
              label='Esta habilidade custa PM?'
            />
            {selectedSuggestion?.hasPmCost && (
              <TextField
                fullWidth
                type='number'
                label='Custo em PM'
                value={selectedSuggestion?.pmCost || 1}
                onChange={(e) =>
                  setSelectedSuggestion((prev) =>
                    prev
                      ? {
                          ...prev,
                          pmCost: Math.max(
                            1,
                            parseInt(e.target.value, 10) || 1
                          ),
                        }
                      : null
                  )
                }
                inputProps={{ min: 1 }}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          {/* Rolls Section in Customize Dialog */}
          <Box
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
          >
            <Typography variant='subtitle2' gutterBottom>
              <CasinoIcon
                fontSize='small'
                sx={{ mr: 0.5, verticalAlign: 'middle' }}
              />
              Rolagens (Opcional)
            </Typography>

            {/* List of added rolls */}
            {selectedSuggestionRolls.length > 0 && (
              <Box mb={2}>
                {selectedSuggestionRolls.map((roll) => (
                  <Chip
                    key={roll.id}
                    label={`${roll.name}: ${roll.dice}${
                      roll.bonus >= 0 ? `+${roll.bonus}` : roll.bonus
                    }`}
                    onDelete={() => handleRemoveSuggestionRoll(roll.id)}
                    size='small'
                    sx={{ mr: 0.5, mb: 0.5 }}
                    icon={<CasinoIcon />}
                  />
                ))}
              </Box>
            )}

            {/* Add new roll form */}
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  size='small'
                  fullWidth
                  label='Nome'
                  value={newSuggestionRoll.name}
                  onChange={(e) =>
                    setNewSuggestionRoll({
                      ...newSuggestionRoll,
                      name: e.target.value,
                    })
                  }
                  placeholder='Dano'
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  size='small'
                  fullWidth
                  label='Dado'
                  value={newSuggestionRoll.dice}
                  onChange={(e) =>
                    setNewSuggestionRoll({
                      ...newSuggestionRoll,
                      dice: e.target.value,
                    })
                  }
                  placeholder='2d6'
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  size='small'
                  fullWidth
                  label='Bônus'
                  type='number'
                  value={newSuggestionRoll.bonus}
                  onChange={(e) =>
                    setNewSuggestionRoll({
                      ...newSuggestionRoll,
                      bonus: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button
                  size='small'
                  variant='outlined'
                  fullWidth
                  onClick={handleAddSuggestionRoll}
                  disabled={
                    !newSuggestionRoll.name.trim() ||
                    !newSuggestionRoll.dice.trim()
                  }
                  sx={{ height: '40px' }}
                >
                  <AddIcon />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizeDialog(false)}>Cancelar</Button>
          <Button variant='contained' onClick={handleAddSuggestion}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StepFive;
