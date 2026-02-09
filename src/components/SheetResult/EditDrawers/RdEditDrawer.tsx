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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CharacterSheet, {
  DamageReduction,
  DamageType,
  ALL_DAMAGE_TYPES,
} from '@/interfaces/CharacterSheet';
import { recalculateSheet } from '@/functions/recalculateSheet';

interface RdEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updates: Partial<CharacterSheet> | CharacterSheet) => void;
}

const SPECIFIC_DAMAGE_TYPES: DamageType[] = ALL_DAMAGE_TYPES.filter(
  (t) => t !== 'Geral'
);

const getAutoRd = (sheet: CharacterSheet, type: DamageType): number => {
  const total = sheet.reducaoDeDano?.[type] ?? 0;
  const manual = sheet.bonusRd?.[type] ?? 0;
  return Math.max(0, total - manual);
};

const RdEditDrawer: React.FC<RdEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
}) => {
  // State holds total values (auto + manual), which is what the user sees
  const [editedRd, setEditedRd] = useState<DamageReduction>(
    sheet.reducaoDeDano ?? {}
  );

  useEffect(() => {
    if (open) {
      setEditedRd(sheet.reducaoDeDano ?? {});
    }
  }, [open, sheet.reducaoDeDano]);

  const handleChange = (type: DamageType, value: number) => {
    const autoValue = getAutoRd(sheet, type);
    // Don't allow going below the auto value
    const clampedValue = Math.max(autoValue, value);
    setEditedRd((prev) => ({
      ...prev,
      [type]: clampedValue,
    }));
  };

  const handleSave = () => {
    // Compute bonusRd = total - auto for each type
    const newBonusRd: DamageReduction = {};
    Object.entries(editedRd).forEach(([key, totalValue]) => {
      const type = key as DamageType;
      const autoValue = getAutoRd(sheet, type);
      const manualValue = (totalValue ?? 0) - autoValue;
      if (manualValue > 0) {
        newBonusRd[type] = manualValue;
      }
    });

    const updatedSheet = {
      ...sheet,
      bonusRd: Object.keys(newBonusRd).length > 0 ? newBonusRd : undefined,
    };

    const recalculatedSheet = recalculateSheet(updatedSheet, sheet);
    onSave(recalculatedSheet);
    onClose();
  };

  const handleCancel = () => {
    setEditedRd(sheet.reducaoDeDano ?? {});
    onClose();
  };

  const renderRdField = (type: DamageType, size: 'small' | 'medium') => {
    const label = type === 'Geral' ? 'RD Geral' : `RD de ${type}`;

    return (
      <TextField
        key={type}
        fullWidth
        label={label}
        type='number'
        value={editedRd[type] ?? 0}
        onChange={(e) => handleChange(type, parseInt(e.target.value, 10) || 0)}
        inputProps={{ min: 0, max: 99 }}
        size={size}
      />
    );
  };

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
          <Typography variant='h6'>Redução de Dano</Typography>
          <IconButton onClick={handleCancel} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          {renderRdField('Geral', 'medium')}

          <Divider sx={{ my: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Por Tipo de Dano
            </Typography>
          </Divider>

          {SPECIFIC_DAMAGE_TYPES.map((type) => renderRdField(type, 'small'))}

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

export default RdEditDrawer;
