import React, { useState } from 'react';
import { Box, Typography, Grid, TextField, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CasinoIcon from '@mui/icons-material/Casino';
import NumberField from '@/components/common/NumberField';
import { AbilityRoll } from '../../../../interfaces/ThreatSheet';

interface RollsEditorProps {
  value: AbilityRoll[];
  onChange: (rolls: AbilityRoll[]) => void;
  helperText?: string;
  dicePlaceholder?: string;
}

const generateRollId = () =>
  `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Editor de rolagens reutilizável (habilidades e magias): lista de chips +
 * formulário para adicionar nome/dado/bônus. Mantém o rascunho internamente e
 * só propaga a lista final via onChange.
 */
const RollsEditor: React.FC<RollsEditorProps> = ({
  value,
  onChange,
  helperText,
  dicePlaceholder = '2d6',
}) => {
  const [draft, setDraft] = useState({ name: '', dice: '', bonus: 0 });

  const handleAdd = () => {
    if (!draft.name.trim() || !draft.dice.trim()) return;
    onChange([
      ...value,
      {
        id: generateRollId(),
        name: draft.name.trim(),
        dice: draft.dice.trim(),
        bonus: draft.bonus,
      },
    ]);
    setDraft({ name: '', dice: '', bonus: 0 });
  };

  const handleRemove = (rollId: string) => {
    onChange(value.filter((roll) => roll.id !== rollId));
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant='subtitle2' gutterBottom>
        <CasinoIcon
          fontSize='small'
          sx={{ mr: 0.5, verticalAlign: 'middle' }}
        />
        Rolagens (Opcional)
      </Typography>
      {helperText && (
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            display: 'block',
            mb: 1,
          }}
        >
          {helperText}
        </Typography>
      )}
      {value.length > 0 && (
        <Box
          sx={{
            mb: 2,
          }}
        >
          {value.map((roll) => (
            <Chip
              key={roll.id}
              label={`${roll.name}: ${roll.dice}${
                roll.bonus >= 0 ? `+${roll.bonus}` : roll.bonus
              }`}
              onDelete={() => handleRemove(roll.id)}
              size='small'
              sx={{ mr: 0.5, mb: 0.5 }}
              icon={<CasinoIcon />}
            />
          ))}
        </Box>
      )}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size='small'
            fullWidth
            label='Nome'
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder='Dano'
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            size='small'
            fullWidth
            label='Dado'
            value={draft.dice}
            onChange={(e) => setDraft({ ...draft, dice: e.target.value })}
            placeholder={dicePlaceholder}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <NumberField
            size='small'
            fullWidth
            label='Bônus'
            value={draft.bonus}
            onValueChange={(v) => setDraft({ ...draft, bonus: v ?? 0 })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button
            size='small'
            variant='outlined'
            fullWidth
            onClick={handleAdd}
            disabled={!draft.name.trim() || !draft.dice.trim()}
            sx={{ height: '40px' }}
          >
            <AddIcon />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RollsEditor;
