import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { CustomPower } from '@/interfaces/CustomPower';
import { isValidDiceString } from '@/utils/diceRoller';

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

  // Power validation errors
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

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
      } else {
        setName('');
        setDescription('');
        setLocalRolls([]);
      }
      resetRollForm();
      setNameError('');
      setDescriptionError('');
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

    const customPower: CustomPower = {
      id: power?.id || uuid(),
      name: name.trim(),
      description: description.trim(),
      rolls: localRolls.length > 0 ? localRolls : undefined,
    };

    onSave(customPower);
  };

  const handleCancel = () => {
    resetRollForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth='md' fullWidth>
      <DialogTitle>
        {power ? 'Editar Poder Personalizado' : 'Novo Poder Personalizado'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Campos do poder */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2 }}>
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
            </Stack>
          </Box>

          <Divider />

          {/* Seção de rolagens */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
              Rolagens (Opcional)
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
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

export default CustomPowerDialog;
