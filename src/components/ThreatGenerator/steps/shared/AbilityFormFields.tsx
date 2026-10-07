import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import NumberField from '@/components/common/NumberField';
import { ThreatActionType } from '../../../../interfaces/ThreatSheet';

const ACTION_TYPES: ThreatActionType[] = [
  'Padrão',
  'Movimento',
  'Completa',
  'Livre',
  'Reação',
];

// Habilidade sem ativação (ex.: Imobilidade do cerianthar). Só faz sentido
// para habilidades — magia sempre tem execução.
const PASSIVE_ACTION_TYPE: ThreatActionType = 'Passiva';

interface AbilityFormFieldsProps {
  actionType: ThreatActionType;
  onActionTypeChange: (value: ThreatActionType) => void;
  hasPmCost: boolean;
  onHasPmCostChange: (value: boolean) => void;
  pmCost: number;
  onPmCostChange: (value: number) => void;
  pmLabel?: string;
  allowPassive?: boolean;
}

/**
 * Campos compartilhados entre habilidades e magias: Tipo de Ação e o
 * toggle/campo de Custo de PM. Usado tanto nos formulários de adição quanto nos
 * diálogos de edição.
 */
const AbilityFormFields: React.FC<AbilityFormFieldsProps> = ({
  actionType,
  onActionTypeChange,
  hasPmCost,
  onHasPmCostChange,
  pmCost,
  onPmCostChange,
  pmLabel = 'Esta habilidade custa PM?',
  allowPassive = true,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <FormControl fullWidth>
      <InputLabel>Tipo de Ação</InputLabel>
      <Select
        value={actionType}
        label='Tipo de Ação'
        onChange={(e) => onActionTypeChange(e.target.value as ThreatActionType)}
      >
        {(allowPassive
          ? [...ACTION_TYPES, PASSIVE_ACTION_TYPE]
          : ACTION_TYPES
        ).map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={hasPmCost}
            onChange={(e) => onHasPmCostChange(e.target.checked)}
          />
        }
        label={pmLabel}
      />
      {hasPmCost && (
        <NumberField
          fullWidth
          label='Custo em PM'
          value={pmCost}
          onValueChange={(v) => onPmCostChange(Math.max(1, v ?? 1))}
          sx={{ mt: 2 }}
          min={1}
        />
      )}
    </Box>
  </Box>
);

export default AbilityFormFields;
