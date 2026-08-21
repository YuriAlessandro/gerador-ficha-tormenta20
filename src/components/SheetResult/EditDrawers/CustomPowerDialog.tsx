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
  Checkbox,
  FormControlLabel,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { CustomPower } from '@/interfaces/CustomPower';
import { SheetBonus, StatModifierTarget } from '@/interfaces/CharacterSheet';
import { isValidDiceString } from '@/utils/diceRoller';
import {
  MAX_CUSTOM_POWER_BONUSES,
  sanitizeCustomPowerBonuses,
} from '@/functions/powers/customPowerBonuses';
import SheetBonusBuilder from '@/premium/components/Homebrew/SheetBonusBuilder';

/**
 * Alvos que o poder personalizado não sabe aplicar — ver a lista de permitidos
 * em `functions/powers/customPowerBonuses.ts`. `TrainSkill` só existe como
 * marcador de compilação do homebrew, e `Proficiency` escreve em
 * `classe.proficiencias`, que o recálculo nunca reseta (sobreviveria à remoção
 * do poder).
 */
const HIDDEN_CUSTOM_POWER_TARGETS: StatModifierTarget['type'][] = [
  'TrainSkill',
  'Proficiency',
];

interface CustomPowerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (power: CustomPower) => void;
  power?: CustomPower; // Para edição de poder existente
}

const CustomPowerDialog: React.FC<CustomPowerDialogProps> = ({
  open,
  onClose,
  onSave,
  power,
}) => {
  // Power fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);
  const [localBonuses, setLocalBonuses] = useState<SheetBonus[]>([]);
  const [advancedBonuses, setAdvancedBonuses] = useState(false);
  const [countAsTormentaPower, setCountAsTormentaPower] = useState(false);
  const [excludesCharisma, setExcludesCharisma] = useState(false);

  // Power validation errors
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [bonusesError, setBonusesError] = useState('');

  // O construtor de bônus tem linhas largas; em telas pequenas o diálogo
  // precisa da tela inteira. Mesmo padrão do `CustomSpellDialog`.
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  // Roll form states
  const [rollLabel, setRollLabel] = useState('');
  const [rollDice, setRollDice] = useState('');
  const [rollDescription, setRollDescription] = useState('');
  const [rollLabelError, setRollLabelError] = useState('');
  const [rollDiceError, setRollDiceError] = useState('');
  const [editingRoll, setEditingRoll] = useState<DiceRoll | null>(null);
  const [editingRollIndex, setEditingRollIndex] = useState<number | null>(null);

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
      if (power) {
        setName(power.name);
        setDescription(power.description);
        setLocalRolls(power.rolls ? [...power.rolls] : []);
        // Hidratado mesmo quando o builder não renderiza (build OSS sem o
        // submódulo premium): sem isto, abrir e salvar o poder apagaria em
        // silêncio os bônus de quem os criou.
        setLocalBonuses(power.sheetBonuses ? [...power.sheetBonuses] : []);
        setCountAsTormentaPower(!!power.countAsTormentaPower);
        setExcludesCharisma(!!power.tormentaCountExcludesCharisma);
      } else {
        setName('');
        setDescription('');
        setLocalRolls([]);
        setLocalBonuses([]);
        setCountAsTormentaPower(false);
        setExcludesCharisma(false);
      }
      resetRollForm();
      setAdvancedBonuses(false);
      setNameError('');
      setDescriptionError('');
      setBonusesError('');
    }
  }, [open, power]);

  const validatePower = (): boolean => {
    let isValid = true;

    if (name.trim().length < 3) {
      setNameError('Nome deve ter pelo menos 3 caracteres');
      isValid = false;
    } else {
      setNameError('');
    }

    if (description.trim().length < 10) {
      setDescriptionError('Descrição deve ter pelo menos 10 caracteres');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    if (localBonuses.length > MAX_CUSTOM_POWER_BONUSES) {
      setBonusesError(
        `No máximo ${MAX_CUSTOM_POWER_BONUSES} bônus por poder personalizado`
      );
      isValid = false;
    } else {
      setBonusesError('');
    }

    return isValid;
  };

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
    if (!validatePower()) return;

    const trimmedName = name.trim();
    // O carimbo aqui é cosmético (deixa o JSON salvo/exportado legível); a
    // autoridade é o Step 7.1 do `recalculateSheet`, que re-carimba a cada
    // recálculo para o vínculo sobreviver a renomear o poder.
    const sanitizedBonuses = sanitizeCustomPowerBonuses(localBonuses).map(
      (bonus) => ({
        ...bonus,
        source: { type: 'power' as const, name: trimmedName },
      })
    );

    const customPower: CustomPower = {
      id: power?.id || uuid(),
      name: trimmedName,
      description: description.trim(),
      rolls: localRolls.length > 0 ? localRolls : undefined,
      sheetBonuses: sanitizedBonuses.length > 0 ? sanitizedBonuses : undefined,
      customEffects: power?.customEffects,
      countAsTormentaPower: countAsTormentaPower || undefined,
      tormentaCountExcludesCharisma:
        countAsTormentaPower && excludesCharisma ? true : undefined,
    };

    onSave(customPower);
  };

  const handleCancel = () => {
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
        {power ? 'Editar Poder Personalizado' : 'Novo Poder Personalizado'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Campos do poder */}
          <Box>
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Informações do Poder
            </Typography>
            <Stack spacing={2}>
              <TextField
                label='Nome do Poder'
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                error={!!nameError}
                helperText={
                  nameError || 'Ex: "Golpe Devastador", "Aura de Proteção"'
                }
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
                  'Descreva o efeito do poder e como ele funciona'
                }
              />
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={countAsTormentaPower}
                      onChange={(e) =>
                        setCountAsTormentaPower(e.target.checked)
                      }
                    />
                  }
                  label='Conta como poder da Tormenta'
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  component='p'
                  sx={{ ml: 4, mt: -0.5 }}
                >
                  Entra no total de poderes da Tormenta da ficha: faz os poderes
                  que escalam com esse total subirem e aplica a perda de
                  Carisma. Ex.: o poder da origem &quot;Escolhido dos
                  Deuses&quot; (Aharadak).
                </Typography>
                {countAsTormentaPower && (
                  <Box sx={{ ml: 4, mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={excludesCharisma}
                          onChange={(e) =>
                            setExcludesCharisma(e.target.checked)
                          }
                        />
                      }
                      label='Exceto para perda de Carisma'
                    />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      component='p'
                      sx={{ ml: 4, mt: -0.5 }}
                    >
                      Conta para a escala, mas não reduz Carisma — como
                      &quot;Corrupção Rubra&quot; e &quot;Forma Aberrante&quot;.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Bônus passivos */}
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                Bônus Passivos (Opcional)
              </Typography>
              <ToggleButtonGroup
                size='small'
                exclusive
                value={advancedBonuses ? 'advanced' : 'basic'}
                onChange={(_e, next) => {
                  if (next !== null) setAdvancedBonuses(next === 'advanced');
                }}
              >
                <ToggleButton value='basic'>Básico</ToggleButton>
                <ToggleButton value='advanced'>Avançado</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Bônus que a ficha calcula sozinha (atributo, perícia, PV, PM,
              Defesa, dano…). No máximo {MAX_CUSTOM_POWER_BONUSES}. O modo
              avançado libera fórmulas por nível e mais alvos.
            </Typography>
            <SheetBonusBuilder
              value={localBonuses}
              onChange={setLocalBonuses}
              advanced={advancedBonuses}
              scaleBy='level'
              hiddenTargets={HIDDEN_CUSTOM_POWER_TARGETS}
              allowPlayerChoice={false}
            />
            {!!bonusesError && (
              <FormHelperText error sx={{ mt: 1 }}>
                {bonusesError}
              </FormHelperText>
            )}
          </Box>

          <Divider />

          {/* Seção de rolagens */}
          <Box>
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Rolagens (Opcional)
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Adicione rolagens de dados associadas a este poder
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

            {/* Formulário para adicionar/editar rolagem */}
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
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

export default CustomPowerDialog;
