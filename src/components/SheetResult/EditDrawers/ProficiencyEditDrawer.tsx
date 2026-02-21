import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CharacterSheet from '@/interfaces/CharacterSheet';
import PROFICIENCIAS from '@/data/systems/tormenta20/proficiencias';

interface ProficiencyEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet>) => void;
}

const ALL_PREDEFINED = Object.values(PROFICIENCIAS);

const ProficiencyEditDrawer: React.FC<ProficiencyEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const [editedProficiencies, setEditedProficiencies] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    if (open) {
      const base = sheet.classe.proficiencias.filter(
        (p) => !(sheet.removedProficiencias ?? []).includes(p)
      );
      const custom = sheet.customProficiencias ?? [];
      setEditedProficiencies([...base, ...custom]);
      setCustomInput('');
    }
  }, [open, sheet]);

  const handleRemove = (proficiency: string) => {
    setEditedProficiencies((prev) => prev.filter((p) => p !== proficiency));
  };

  const handleAddPredefined = (proficiency: string) => {
    if (!editedProficiencies.includes(proficiency)) {
      setEditedProficiencies((prev) => [...prev, proficiency]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed === '') return;

    const alreadyExists = editedProficiencies.some(
      (p) => p.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) return;

    setEditedProficiencies((prev) => [...prev, trimmed]);
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleSave = () => {
    const baseProficiencies = sheet.classe.proficiencias;

    const removedProficiencias = baseProficiencies.filter(
      (p) => !editedProficiencies.includes(p)
    );

    const customProficiencias = editedProficiencies.filter(
      (p) => !baseProficiencies.includes(p)
    );

    onSave({
      customProficiencias:
        customProficiencias.length > 0 ? customProficiencias : undefined,
      removedProficiencias:
        removedProficiencias.length > 0 ? removedProficiencias : undefined,
    });
    onClose();
  };

  const handleCancel = () => {
    const base = sheet.classe.proficiencias.filter(
      (p) => !(sheet.removedProficiencias ?? []).includes(p)
    );
    const custom = sheet.customProficiencias ?? [];
    setEditedProficiencies([...base, ...custom]);
    setCustomInput('');
    onClose();
  };

  const availablePredefined = ALL_PREDEFINED.filter(
    (p) => !editedProficiencies.includes(p)
  );

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Proficiências</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <Typography variant='subtitle2' color='text.secondary'>
            Proficiências atuais
          </Typography>

          <Stack direction='row' flexWrap='wrap' gap={0.5}>
            {editedProficiencies.length === 0 && (
              <Typography variant='body2' color='text.secondary'>
                Nenhuma proficiência
              </Typography>
            )}
            {editedProficiencies.map((prof) => (
              <Chip
                key={prof}
                label={prof}
                onDelete={() => handleRemove(prof)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Adicionar Proficiência
            </Typography>
          </Divider>

          {availablePredefined.length > 0 && (
            <>
              <Typography variant='subtitle2' color='text.secondary'>
                Predefinidas
              </Typography>
              <Stack direction='row' flexWrap='wrap' gap={0.5}>
                {availablePredefined.map((prof) => (
                  <Chip
                    key={prof}
                    label={prof}
                    onClick={() => handleAddPredefined(prof)}
                    variant='outlined'
                    clickable
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </>
          )}

          <Typography variant='subtitle2' color='text.secondary'>
            Customizada
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <TextField
              fullWidth
              size='small'
              placeholder='Nome da proficiência'
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              color='primary'
              onClick={handleAddCustom}
              disabled={customInput.trim() === ''}
            >
              <AddIcon />
            </IconButton>
          </Stack>

          <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
            <Button variant='outlined' onClick={handleCancel} fullWidth>
              Cancelar
            </Button>
            <Button variant='contained' onClick={handleSave} fullWidth>
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ProficiencyEditDrawer;
