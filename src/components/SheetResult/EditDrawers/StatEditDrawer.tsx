import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ClearIcon from '@mui/icons-material/Clear';
import HealingIcon from '@mui/icons-material/Healing';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { recalculateSheet } from '@/functions/recalculateSheet';

interface StatEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
}

type StatFormState = {
  currentPV: string;
  tempPV: string;
  manualMaxPV: string;
  currentPM: string;
  tempPM: string;
  manualMaxPM: string;
};

const buildInitialState = (sheet: CharacterSheet): StatFormState => ({
  currentPV: String(sheet.currentPV ?? sheet.pv ?? 0),
  tempPV: String(sheet.tempPV ?? 0),
  manualMaxPV:
    sheet.manualMaxPV !== undefined && sheet.manualMaxPV > 0
      ? String(sheet.manualMaxPV)
      : '',
  currentPM: String(sheet.currentPM ?? sheet.pm ?? 0),
  tempPM: String(sheet.tempPM ?? 0),
  manualMaxPM:
    sheet.manualMaxPM !== undefined && sheet.manualMaxPM > 0
      ? String(sheet.manualMaxPM)
      : '',
});

const parseIntOrFallback = (value: string, fallback: number): number => {
  if (value === '') return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parsePositiveOrUndefined = (value: string): number | undefined => {
  if (value === '') return undefined;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
};

const StatEditDrawer: React.FC<StatEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  const theme = useTheme();
  // Bottom anchor on mobile keeps the sheet visible behind the drawer (native
  // mobile pattern); right anchor on desktop matches the rest of the project.
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const [form, setForm] = useState<StatFormState>(buildInitialState(sheet));

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(sheet));
    }
  }, [open, sheet]);

  const updateField = (key: keyof StatFormState, value: string) => {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePVFullRestore = () => {
    const maxPV = sheet.pv;
    setForm((prev) => ({
      ...prev,
      currentPV: String(maxPV),
      tempPV: '0',
    }));
  };

  const handlePMFullRestore = () => {
    const maxPM = sheet.pm;
    setForm((prev) => ({
      ...prev,
      currentPM: String(maxPM),
      tempPM: '0',
    }));
  };

  const handleClearTempPV = () => {
    setForm((prev) => ({ ...prev, tempPV: '0' }));
  };

  const handleClearTempPM = () => {
    setForm((prev) => ({ ...prev, tempPM: '0' }));
  };

  const handleCancel = () => {
    setForm(buildInitialState(sheet));
    onClose();
  };

  const handleSave = () => {
    const newCurrentPV = parseIntOrFallback(form.currentPV, sheet.pv);
    const newTempPV = Math.max(0, parseIntOrFallback(form.tempPV, 0));
    const newManualMaxPV = parsePositiveOrUndefined(form.manualMaxPV);

    const newCurrentPM = parseIntOrFallback(form.currentPM, sheet.pm);
    const newTempPM = Math.max(0, parseIntOrFallback(form.tempPM, 0));
    const newManualMaxPM = parsePositiveOrUndefined(form.manualMaxPM);

    const manualMaxChanged =
      newManualMaxPV !== sheet.manualMaxPV ||
      newManualMaxPM !== sheet.manualMaxPM;

    const updatedSheet: CharacterSheet = {
      ...sheet,
      currentPV: newCurrentPV,
      tempPV: newTempPV,
      manualMaxPV: newManualMaxPV,
      currentPM: newCurrentPM,
      tempPM: newTempPM,
      manualMaxPM: newManualMaxPM,
    };

    if (manualMaxChanged) {
      const recalculated = recalculateSheet(updatedSheet, sheet);
      onSave(recalculated);
    } else {
      onSave(updatedSheet);
    }
    onClose();
  };

  const calculatedMaxPV = sheet.pv;
  const calculatedMaxPM = sheet.pm;
  const hasTempPV = parseIntOrFallback(form.tempPV, 0) > 0;
  const hasTempPM = parseIntOrFallback(form.tempPM, 0) > 0;

  const pvColor = theme.palette.success.main;
  const pmColor = theme.palette.info.main;

  const renderSection = (
    type: 'PV' | 'PM',
    sectionColor: string,
    icon: React.ReactNode,
    calculatedMax: number,
    fields: {
      currentKey: keyof StatFormState;
      tempKey: keyof StatFormState;
      manualMaxKey: keyof StatFormState;
    },
    hasTemp: boolean,
    onFullRestore: () => void,
    onClearTemp: () => void
  ) => (
    <Stack spacing={2}>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          alignItems: 'center',
        }}
      >
        <Box sx={{ color: sectionColor, display: 'flex' }}>{icon}</Box>
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
          Pontos de {type === 'PV' ? 'Vida' : 'Mana'} ({type})
        </Typography>
      </Stack>

      <Stack direction='row' spacing={2}>
        <TextField
          fullWidth
          label='Atual'
          value={form[fields.currentKey]}
          onChange={(e) => updateField(fields.currentKey, e.target.value)}
          size='small'
          slotProps={{
            htmlInput: { inputMode: 'numeric' },
          }}
        />
        <TextField
          fullWidth
          label='Máximo calculado'
          value={calculatedMax}
          size='small'
          helperText='Baseado em raça, classe, atributos'
          slotProps={{
            input: { readOnly: true },
          }}
        />
      </Stack>

      <TextField
        fullWidth
        label='Temporário'
        value={form[fields.tempKey]}
        onChange={(e) => updateField(fields.tempKey, e.target.value)}
        size='small'
        helperText='Consumido primeiro ao tomar dano'
        slotProps={{
          htmlInput: { inputMode: 'numeric' },
        }}
      />

      <TextField
        fullWidth
        label='Máximo manual (opcional)'
        value={form[fields.manualMaxKey]}
        onChange={(e) => updateField(fields.manualMaxKey, e.target.value)}
        size='small'
        helperText='Sobrescreve o cálculo automático. Vazio = usar calculado.'
        slotProps={{
          htmlInput: { inputMode: 'numeric' },
        }}
      />

      <Stack direction='row' spacing={1}>
        <Button
          fullWidth
          variant='outlined'
          startIcon={<HealingIcon />}
          onClick={onFullRestore}
          sx={{
            color: sectionColor,
            borderColor: sectionColor,
            '&:hover': { borderColor: sectionColor, opacity: 0.85 },
          }}
        >
          Cura total
        </Button>
        <Button
          fullWidth
          variant='outlined'
          color='warning'
          startIcon={<ClearIcon />}
          onClick={onClearTemp}
          disabled={!hasTemp}
        >
          Limpar temp
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={handleCancel}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 450 },
            maxHeight: isMobile ? '85vh' : '100%',
            borderTopLeftRadius: isMobile ? 12 : 0,
            borderTopRightRadius: isMobile ? 12 : 0,
          },
        },
      }}
    >
      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h6'>Editar PV e PM</Typography>
          <IconButton onClick={handleCancel} size='small' aria-label='fechar'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {renderSection(
            'PV',
            pvColor,
            <FavoriteIcon fontSize='small' />,
            calculatedMaxPV,
            {
              currentKey: 'currentPV',
              tempKey: 'tempPV',
              manualMaxKey: 'manualMaxPV',
            },
            hasTempPV,
            handlePVFullRestore,
            handleClearTempPV
          )}

          <Divider />

          {renderSection(
            'PM',
            pmColor,
            <AutoFixHighIcon fontSize='small' />,
            calculatedMaxPM,
            {
              currentKey: 'currentPM',
              tempKey: 'tempPM',
              manualMaxKey: 'manualMaxPM',
            },
            hasTempPM,
            handlePMFullRestore,
            handleClearTempPM
          )}

          <Stack direction='row' spacing={2} sx={{ mt: 1 }}>
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

export default StatEditDrawer;
