import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuid } from 'uuid';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { isValidDiceString } from '@/utils/diceRoller';

interface RollsEditorPanelProps {
  rolls: DiceRoll[];
  onChange: (rolls: DiceRoll[]) => void;
}

/**
 * Conteúdo do editor de rolagens — extraído de `RollsEditDialog` para que
 * possa ser usado dentro de outras estruturas (ex.: abas em
 * `PowerSettingsDialog`) sem aninhar Dialogs. O Dialog em si fica em
 * `RollsEditDialog`, que é apenas um wrapper sobre este painel.
 */
const RollsEditorPanel: React.FC<RollsEditorPanelProps> = ({
  rolls,
  onChange,
}) => {
  const [editingRoll, setEditingRoll] = useState<DiceRoll | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [label, setLabel] = useState('');
  const [dice, setDice] = useState('');
  const [description, setDescription] = useState('');
  const [labelError, setLabelError] = useState('');
  const [diceError, setDiceError] = useState('');

  useEffect(() => {
    setEditingRoll(null);
    setEditingIndex(null);
    setLabel('');
    setDice('');
    setDescription('');
    setLabelError('');
    setDiceError('');
  }, [rolls.length === 0]);

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
    onChange([...rolls, newRoll]);
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
    const newRolls = [...rolls];
    newRolls[editingIndex] = updatedRoll;
    onChange(newRolls);
    resetForm();
  };

  const handleDeleteRoll = (index: number) => {
    onChange(rolls.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <Box>
        <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
          Rolagens Configuradas
        </Typography>
        {rolls.length > 0 ? (
          <List dense>
            {rolls.map((roll, index) => (
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
            helperText={labelError || 'Ex: "Dano de Fogo", "Cura", "Ataque"'}
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
  );
};

export default RollsEditorPanel;
