import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Typography,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import {
  Spell,
  SpellSchool,
  allSpellSchools,
  spellsCircles,
  Aprimoramento,
} from '@/interfaces/Spells';
import { isValidDiceString } from '@/utils/diceRoller';

interface CustomSpellDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (spell: Spell) => void;
  spell?: Spell;
  existingSpellNames?: string[];
}

const EXECUCAO_OPTIONS = ['Padrão', 'Movimento', 'Completa', 'Reação'];
const ALCANCE_OPTIONS = ['Pessoal', 'Toque', 'Curto', 'Médio', 'Longo'];
const DURACAO_OPTIONS = ['Instantânea', 'Cena'];

const SCHOOL_LABELS: Record<SpellSchool, string> = {
  Abjur: 'Abjuração',
  Adiv: 'Adivinhação',
  Conv: 'Convocação',
  Encan: 'Encantamento',
  Evoc: 'Evocação',
  Ilusão: 'Ilusão',
  Necro: 'Necromancia',
  Trans: 'Transmutação',
};

const CustomSpellDialog: React.FC<CustomSpellDialogProps> = ({
  open,
  onClose,
  onSave,
  spell,
  existingSpellNames,
}) => {
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  // Spell fields
  const [nome, setNome] = useState('');
  const [description, setDescription] = useState('');
  const [school, setSchool] = useState<SpellSchool | ''>('');
  const [spellCircle, setSpellCircle] = useState<spellsCircles | ''>('');
  const [execucao, setExecucao] = useState('');
  const [execucaoCustom, setExecucaoCustom] = useState('');
  const [alcance, setAlcance] = useState('');
  const [alcanceCustom, setAlcanceCustom] = useState('');
  const [duracao, setDuracao] = useState('');
  const [duracaoCustom, setDuracaoCustom] = useState('');
  const [resistencia, setResistencia] = useState('');
  const [alvo, setAlvo] = useState('');
  const [area, setArea] = useState('');
  const [manaExpense, setManaExpense] = useState('');

  // Validation errors
  const [nomeError, setNomeError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [schoolError, setSchoolError] = useState('');
  const [circleError, setCircleError] = useState('');
  const [execucaoError, setExecucaoError] = useState('');
  const [alcanceError, setAlcanceError] = useState('');
  const [duracaoError, setDuracaoError] = useState('');

  // Aprimoramentos
  const [localAprimoramentos, setLocalAprimoramentos] = useState<
    Aprimoramento[]
  >([]);
  const [aprimAddPm, setAprimAddPm] = useState('');
  const [aprimText, setAprimText] = useState('');
  const [aprimTrick, setAprimTrick] = useState(false);
  const [aprimTextError, setAprimTextError] = useState('');
  const [editingAprimIndex, setEditingAprimIndex] = useState<number | null>(
    null
  );

  // Rolls
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);
  const [rollLabel, setRollLabel] = useState('');
  const [rollDice, setRollDice] = useState('');
  const [rollDescription, setRollDescription] = useState('');
  const [rollLabelError, setRollLabelError] = useState('');
  const [rollDiceError, setRollDiceError] = useState('');
  const [editingRoll, setEditingRoll] = useState<DiceRoll | null>(null);
  const [editingRollIndex, setEditingRollIndex] = useState<number | null>(null);

  const resetAprimForm = () => {
    setAprimAddPm('');
    setAprimText('');
    setAprimTrick(false);
    setAprimTextError('');
    setEditingAprimIndex(null);
  };

  const resetRollForm = () => {
    setRollLabel('');
    setRollDice('');
    setRollDescription('');
    setRollLabelError('');
    setRollDiceError('');
    setEditingRoll(null);
    setEditingRollIndex(null);
  };

  useEffect(() => {
    if (open) {
      if (spell) {
        setNome(spell.nome);
        setDescription(spell.description);
        setSchool(spell.school);
        setSpellCircle(spell.spellCircle);

        // Handle execucao
        if (EXECUCAO_OPTIONS.includes(spell.execucao)) {
          setExecucao(spell.execucao);
          setExecucaoCustom('');
        } else {
          setExecucao('outro');
          setExecucaoCustom(spell.execucao);
        }

        // Handle alcance
        if (ALCANCE_OPTIONS.includes(spell.alcance)) {
          setAlcance(spell.alcance);
          setAlcanceCustom('');
        } else {
          setAlcance('outro');
          setAlcanceCustom(spell.alcance);
        }

        // Handle duracao
        if (DURACAO_OPTIONS.includes(spell.duracao)) {
          setDuracao(spell.duracao);
          setDuracaoCustom('');
        } else {
          setDuracao('outro');
          setDuracaoCustom(spell.duracao);
        }

        setResistencia(spell.resistencia || '');
        setAlvo(spell.alvo || '');
        setArea(spell.area || '');
        setManaExpense(
          spell.manaExpense !== undefined ? String(spell.manaExpense) : ''
        );
        setLocalAprimoramentos(
          spell.aprimoramentos ? [...spell.aprimoramentos] : []
        );
        setLocalRolls(spell.rolls ? [...spell.rolls] : []);
      } else {
        setNome('');
        setDescription('');
        setSchool('');
        setSpellCircle('');
        setExecucao('');
        setExecucaoCustom('');
        setAlcance('');
        setAlcanceCustom('');
        setDuracao('');
        setDuracaoCustom('');
        setResistencia('');
        setAlvo('');
        setArea('');
        setManaExpense('');
        setLocalAprimoramentos([]);
        setLocalRolls([]);
      }
      resetAprimForm();
      resetRollForm();
      setNomeError('');
      setDescriptionError('');
      setSchoolError('');
      setCircleError('');
      setExecucaoError('');
      setAlcanceError('');
      setDuracaoError('');
    }
  }, [open, spell]);

  const getExecucaoValue = (): string => {
    if (execucao === 'outro') return execucaoCustom.trim();
    return execucao;
  };

  const getAlcanceValue = (): string => {
    if (alcance === 'outro') return alcanceCustom.trim();
    return alcance;
  };

  const getDuracaoValue = (): string => {
    if (duracao === 'outro') return duracaoCustom.trim();
    return duracao;
  };

  const validateSpell = (): boolean => {
    let isValid = true;

    if (nome.trim().length < 3) {
      setNomeError('Nome deve ter pelo menos 3 caracteres');
      isValid = false;
    } else if (
      existingSpellNames?.includes(nome.trim()) &&
      nome.trim() !== spell?.nome
    ) {
      setNomeError('Já existe uma magia com este nome');
      isValid = false;
    } else {
      setNomeError('');
    }

    if (description.trim().length < 10) {
      setDescriptionError('Descrição deve ter pelo menos 10 caracteres');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    if (!school) {
      setSchoolError('Selecione uma escola');
      isValid = false;
    } else {
      setSchoolError('');
    }

    if (!spellCircle) {
      setCircleError('Selecione um círculo');
      isValid = false;
    } else {
      setCircleError('');
    }

    const execucaoVal = getExecucaoValue();
    if (!execucaoVal) {
      setExecucaoError('Execução é obrigatória');
      isValid = false;
    } else {
      setExecucaoError('');
    }

    const alcanceVal = getAlcanceValue();
    if (!alcanceVal) {
      setAlcanceError('Alcance é obrigatório');
      isValid = false;
    } else {
      setAlcanceError('');
    }

    const duracaoVal = getDuracaoValue();
    if (!duracaoVal) {
      setDuracaoError('Duração é obrigatória');
      isValid = false;
    } else {
      setDuracaoError('');
    }

    return isValid;
  };

  // Aprimoramento handlers
  const validateAprim = (): boolean => {
    if (aprimText.trim().length < 5) {
      setAprimTextError('Texto deve ter pelo menos 5 caracteres');
      return false;
    }
    setAprimTextError('');
    return true;
  };

  const handleAddAprim = () => {
    if (!validateAprim()) return;

    const newAprim: Aprimoramento = {
      addPm: aprimTrick ? 0 : Number(aprimAddPm) || 0,
      text: aprimText.trim(),
      trick: aprimTrick || undefined,
    };

    setLocalAprimoramentos([...localAprimoramentos, newAprim]);
    resetAprimForm();
  };

  const handleEditAprim = (aprim: Aprimoramento, index: number) => {
    setEditingAprimIndex(index);
    setAprimAddPm(String(aprim.addPm));
    setAprimText(aprim.text);
    setAprimTrick(aprim.trick ?? false);
  };

  const handleUpdateAprim = () => {
    if (!validateAprim() || editingAprimIndex === null) return;

    const updatedAprim: Aprimoramento = {
      addPm: aprimTrick ? 0 : Number(aprimAddPm) || 0,
      text: aprimText.trim(),
      trick: aprimTrick || undefined,
    };

    const newAprims = [...localAprimoramentos];
    newAprims[editingAprimIndex] = updatedAprim;
    setLocalAprimoramentos(newAprims);
    resetAprimForm();
  };

  const handleDeleteAprim = (index: number) => {
    setLocalAprimoramentos(localAprimoramentos.filter((_, i) => i !== index));
  };

  // Roll handlers (same pattern as CustomPowerDialog)
  const validateRoll = (): boolean => {
    let isValid = true;

    if (rollLabel.trim().length < 3) {
      setRollLabelError('Nome deve ter pelo menos 3 caracteres');
      isValid = false;
    } else {
      setRollLabelError('');
    }

    if (!isValidDiceString(rollDice)) {
      setRollDiceError(
        'Formato inválido. Use: XdY, XdY+Z ou XdY-Z (ex: 3d6+2)'
      );
      isValid = false;
    } else {
      setRollDiceError('');
    }

    return isValid;
  };

  const handleAddRoll = () => {
    if (!validateRoll()) return;

    const newRoll: DiceRoll = {
      id: uuid(),
      label: rollLabel.trim(),
      dice: rollDice.trim(),
      description: rollDescription.trim() || undefined,
    };

    setLocalRolls([...localRolls, newRoll]);
    resetRollForm();
  };

  const handleEditRoll = (roll: DiceRoll, index: number) => {
    setEditingRoll(roll);
    setEditingRollIndex(index);
    setRollLabel(roll.label);
    setRollDice(roll.dice);
    setRollDescription(roll.description || '');
  };

  const handleUpdateRoll = () => {
    if (!validateRoll() || editingRollIndex === null) return;

    const updatedRoll: DiceRoll = {
      ...editingRoll,
      id: editingRoll?.id || uuid(),
      label: rollLabel.trim(),
      dice: rollDice.trim(),
      description: rollDescription.trim() || undefined,
    };

    const newRolls = [...localRolls];
    newRolls[editingRollIndex] = updatedRoll;
    setLocalRolls(newRolls);
    resetRollForm();
  };

  const handleDeleteRoll = (index: number) => {
    setLocalRolls(localRolls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!validateSpell()) return;

    const customSpell: Spell = {
      nome: nome.trim(),
      execucao: getExecucaoValue(),
      alcance: getAlcanceValue(),
      alvo: alvo.trim() || undefined,
      area: area.trim() || undefined,
      duracao: getDuracaoValue(),
      description: description.trim(),
      resistencia: resistencia.trim() || undefined,
      spellCircle: spellCircle as spellsCircles,
      school: school as SpellSchool,
      manaExpense: manaExpense ? Number(manaExpense) : undefined,
      aprimoramentos:
        localAprimoramentos.length > 0 ? localAprimoramentos : undefined,
      rolls: localRolls.length > 0 ? localRolls : undefined,
      isCustom: true,
    };

    onSave(customSpell);
  };

  const handleCancel = () => {
    resetAprimForm();
    resetRollForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        {spell ? 'Editar Magia Personalizada' : 'Nova Magia Personalizada'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Informações da Magia */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2 }}>
              Informações da Magia
            </Typography>
            <Stack spacing={2}>
              <TextField
                label='Nome da Magia'
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                fullWidth
                required
                error={!!nomeError}
                helperText={
                  nomeError || 'Ex: "Raio Arcano", "Bênção da Natureza"'
                }
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required error={!!schoolError}>
                    <InputLabel>Escola</InputLabel>
                    <Select
                      value={school}
                      label='Escola'
                      onChange={(e) => setSchool(e.target.value as SpellSchool)}
                    >
                      {allSpellSchools.map((s) => (
                        <MenuItem key={s} value={s}>
                          {SCHOOL_LABELS[s]}
                        </MenuItem>
                      ))}
                    </Select>
                    {schoolError && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {schoolError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required error={!!circleError}>
                    <InputLabel>Círculo</InputLabel>
                    <Select
                      value={spellCircle}
                      label='Círculo'
                      onChange={(e) =>
                        setSpellCircle(e.target.value as spellsCircles)
                      }
                    >
                      {Object.values(spellsCircles).map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                    {circleError && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {circleError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Execução */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: execucao === 'outro' ? 6 : 12 }}>
                  <FormControl fullWidth required error={!!execucaoError}>
                    <InputLabel>Execução</InputLabel>
                    <Select
                      value={execucao}
                      label='Execução'
                      onChange={(e) => {
                        setExecucao(e.target.value);
                        if (e.target.value !== 'outro') setExecucaoCustom('');
                      }}
                    >
                      {EXECUCAO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                      <MenuItem value='outro'>Outro...</MenuItem>
                    </Select>
                    {execucaoError && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {execucaoError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                {execucao === 'outro' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label='Execução personalizada'
                      value={execucaoCustom}
                      onChange={(e) => setExecucaoCustom(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>

              {/* Alcance */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: alcance === 'outro' ? 6 : 12 }}>
                  <FormControl fullWidth required error={!!alcanceError}>
                    <InputLabel>Alcance</InputLabel>
                    <Select
                      value={alcance}
                      label='Alcance'
                      onChange={(e) => {
                        setAlcance(e.target.value);
                        if (e.target.value !== 'outro') setAlcanceCustom('');
                      }}
                    >
                      {ALCANCE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                      <MenuItem value='outro'>Outro...</MenuItem>
                    </Select>
                    {alcanceError && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {alcanceError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                {alcance === 'outro' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label='Alcance personalizado'
                      value={alcanceCustom}
                      onChange={(e) => setAlcanceCustom(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>

              {/* Duração */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: duracao === 'outro' ? 6 : 12 }}>
                  <FormControl fullWidth required error={!!duracaoError}>
                    <InputLabel>Duração</InputLabel>
                    <Select
                      value={duracao}
                      label='Duração'
                      onChange={(e) => {
                        setDuracao(e.target.value);
                        if (e.target.value !== 'outro') setDuracaoCustom('');
                      }}
                    >
                      {DURACAO_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                      <MenuItem value='outro'>Outro...</MenuItem>
                    </Select>
                    {duracaoError && (
                      <Typography
                        variant='caption'
                        color='error'
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {duracaoError}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                {duracao === 'outro' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label='Duração personalizada'
                      value={duracaoCustom}
                      onChange={(e) => setDuracaoCustom(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>

              <TextField
                label='Resistência'
                value={resistencia}
                onChange={(e) => setResistencia(e.target.value)}
                fullWidth
                helperText='Ex: "Vontade anula", "Fortitude parcial"'
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='Alvo'
                    value={alvo}
                    onChange={(e) => setAlvo(e.target.value)}
                    fullWidth
                    helperText='Ex: "1 criatura", "Você"'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='Área'
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    fullWidth
                    helperText='Ex: "Esfera com 6m de raio"'
                  />
                </Grid>
              </Grid>

              <TextField
                label='Custo PM'
                value={manaExpense}
                onChange={(e) => setManaExpense(e.target.value)}
                fullWidth
                type='number'
                helperText='Opcional. Se não informado, usa o custo padrão do círculo'
                inputProps={{ min: 0 }}
              />

              <TextField
                label='Descrição'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                error={!!descriptionError}
                helperText={
                  descriptionError ||
                  'Descreva o efeito da magia e como ela funciona'
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Aprimoramentos */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
              Aprimoramentos (Opcional)
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Adicione modificadores de PM para esta magia
            </Typography>

            {localAprimoramentos.length > 0 && (
              <List dense sx={{ mb: 2 }}>
                {localAprimoramentos.map((aprim, index) => (
                  <ListItem
                    key={`${aprim.addPm}-${aprim.text.slice(0, 20)}`}
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        aprim.trick
                          ? `Truque: ${aprim.text}`
                          : `+${aprim.addPm} PM: ${aprim.text}`
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size='small'
                        onClick={() => handleEditAprim(aprim, index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge='end'
                        size='small'
                        onClick={() => handleDeleteAprim(index)}
                        color='error'
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='body2' fontWeight='bold' sx={{ mb: 2 }}>
                {editingAprimIndex !== null
                  ? 'Editar Aprimoramento'
                  : 'Adicionar Aprimoramento'}
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={aprimTrick}
                      onChange={(e) => setAprimTrick(e.target.checked)}
                      size='small'
                    />
                  }
                  label='Truque (custo 0 PM)'
                />
                {!aprimTrick && (
                  <TextField
                    label='Custo adicional de PM'
                    value={aprimAddPm}
                    onChange={(e) => setAprimAddPm(e.target.value)}
                    fullWidth
                    size='small'
                    type='number'
                    inputProps={{ min: 0 }}
                    helperText='Ex: 2 para "+2 PM"'
                  />
                )}
                <TextField
                  label='Descrição do aprimoramento'
                  value={aprimText}
                  onChange={(e) => setAprimText(e.target.value)}
                  fullWidth
                  size='small'
                  multiline
                  rows={2}
                  error={!!aprimTextError}
                  helperText={
                    aprimTextError || 'Descreva o efeito do aprimoramento'
                  }
                />
                <Box>
                  {editingAprimIndex !== null ? (
                    <Stack direction='row' spacing={1}>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={handleUpdateAprim}
                        fullWidth
                      >
                        Atualizar
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={resetAprimForm}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<AddIcon />}
                      onClick={handleAddAprim}
                      fullWidth
                    >
                      Adicionar Aprimoramento
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Rolagens */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
              Rolagens (Opcional)
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Adicione rolagens de dados associadas a esta magia
            </Typography>

            {localRolls.length > 0 && (
              <List dense sx={{ mb: 2 }}>
                {localRolls.map((roll, index) => (
                  <ListItem
                    key={roll.id || index}
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={`${roll.label} - ${roll.dice}`}
                      secondary={roll.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size='small'
                        onClick={() => handleEditRoll(roll, index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge='end'
                        size='small'
                        onClick={() => handleDeleteRoll(index)}
                        color='error'
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='body2' fontWeight='bold' sx={{ mb: 2 }}>
                {editingRoll ? 'Editar Rolagem' : 'Adicionar Rolagem'}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label='Nome da Rolagem'
                  value={rollLabel}
                  onChange={(e) => setRollLabel(e.target.value)}
                  fullWidth
                  size='small'
                  error={!!rollLabelError}
                  helperText={rollLabelError || 'Ex: "Dano", "Cura", "Teste"'}
                />
                <TextField
                  label='Dado'
                  value={rollDice}
                  onChange={(e) => setRollDice(e.target.value)}
                  fullWidth
                  size='small'
                  error={!!rollDiceError}
                  helperText={rollDiceError || 'Ex: "3d6", "1d20+5", "2d10-2"'}
                />
                <TextField
                  label='Descrição da Rolagem (Opcional)'
                  value={rollDescription}
                  onChange={(e) => setRollDescription(e.target.value)}
                  fullWidth
                  size='small'
                  multiline
                  rows={2}
                />
                <Box>
                  {editingRoll ? (
                    <Stack direction='row' spacing={1}>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={handleUpdateRoll}
                        fullWidth
                      >
                        Atualizar
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={resetRollForm}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<AddIcon />}
                      onClick={handleAddRoll}
                      fullWidth
                    >
                      Adicionar Rolagem
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancelar</Button>
        <Button onClick={handleSave} variant='contained'>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomSpellDialog;
