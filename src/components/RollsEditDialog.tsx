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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { isValidDiceString } from '@/utils/diceRoller';

interface RollsEditDialogProps {
  open: boolean;
  onClose: () => void;
  rolls: DiceRoll[];
  onSave: (rolls: DiceRoll[]) => void;
  title?: string;
}

const RollsEditDialog: React.FC<RollsEditDialogProps> = ({
  open,
  onClose,
  rolls,
  onSave,
  title = 'Editar Rolagens',
}) => {
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);
  const [editingRoll, setEditingRoll] = useState<DiceRoll | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [dice, setDice] = useState('');
  const [description, setDescription] = useState('');
  const [labelError, setLabelError] = useState('');
  const [diceError, setDiceError] = useState('');

  useEffect(() => {
    setLocalRolls([...rolls]);
  }, [rolls, open]);

  const resetForm = () => {
    setLabel('');
    setDice('');
    setDescription('');
    setLabelError('');
    setDiceError('');
    setEditingRoll(null);
    setEditingIndex(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (label.trim().length < 3) {
      setLabelError('Nome deve ter pelo menos 3 caracteres');
      isValid = false;
    } else {
      setLabelError('');
    }

    if (!isValidDiceString(dice)) {
      setDiceError('Formato inválido. Use: XdY, XdY+Z ou XdY-Z (ex: 3d6+2)');
      isValid = false;
    } else {
      setDiceError('');
    }

    return isValid;
  };

  const handleAddRoll = () => {
    if (!validateForm()) return;

    const newRoll: DiceRoll = {
      id: uuid(),
      label: label.trim(),
      dice: dice.trim(),
      description: description.trim() || undefined,
    };

    setLocalRolls([...localRolls, newRoll]);
    resetForm();
  };

  const handleEditRoll = (roll: DiceRoll, index: number) => {
    setEditingRoll(roll);
    setEditingIndex(index);
    setLabel(roll.label);
    setDice(roll.dice);
    setDescription(roll.description || '');
  };

  const handleUpdateRoll = () => {
    if (!validateForm() || editingIndex === null) return;

    const updatedRoll: DiceRoll = {
      ...editingRoll,
      label: label.trim(),
      dice: dice.trim(),
      description: description.trim() || undefined,
    };

    const newRolls = [...localRolls];
    newRolls[editingIndex] = updatedRoll;
    setLocalRolls(newRolls);
    resetForm();
  };

  const handleDeleteRoll = (index: number) => {
    setLocalRolls(localRolls.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localRolls);
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Lista de rolagens existentes */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
              Rolagens Configuradas
            </Typography>
            {localRolls.length > 0 ? (
              <List dense>
                {localRolls.map((roll, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ListItem key={index}>
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
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Nenhuma rolagem configurada
              </Typography>
            )}
          </Box>

          {/* Formulário para adicionar/editar */}
          <Box>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2 }}>
              {editingRoll ? 'Editar Rolagem' : 'Adicionar Rolagem'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label='Nome da Rolagem'
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                fullWidth
                required
                error={!!labelError}
                helperText={
                  labelError || 'Ex: "Dano de Fogo", "Cura", "Ataque"'
                }
              />
              <TextField
                label='Dado'
                value={dice}
                onChange={(e) => setDice(e.target.value)}
                fullWidth
                required
                error={!!diceError}
                helperText={diceError || 'Ex: "3d6", "1d20+5", "2d10-2"'}
              />
              <TextField
                label='Descrição (Opcional)'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText='Descrição adicional sobre esta rolagem'
              />
              <Box>
                {editingRoll ? (
                  <Stack direction='row' spacing={1}>
                    <Button
                      variant='contained'
                      onClick={handleUpdateRoll}
                      fullWidth
                    >
                      Atualizar
                    </Button>
                    <Button variant='outlined' onClick={resetForm} fullWidth>
                      Cancelar Edição
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant='contained'
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

export default RollsEditDialog;
