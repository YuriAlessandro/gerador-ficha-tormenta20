import React from 'react';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';

interface MultiSelectFilterProps<T extends string | number> {
  id: string;
  label: string;
  /** Texto exibido quando nada está selecionado (= sem filtro). */
  emptyLabel: string;
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getOptionLabel?: (option: T) => string;
}

/**
 * Select de múltipla escolha com checkbox. Lista vazia significa "sem
 * filtro", então o placeholder (`emptyLabel`) faz o papel do antigo "Todos".
 */
const MultiSelectFilter = <T extends string | number>({
  id,
  label,
  emptyLabel,
  options,
  value,
  onChange,
  getOptionLabel = String,
}: MultiSelectFilterProps<T>) => (
  <FormControl fullWidth size='small'>
    <InputLabel id={id} shrink>
      {label}
    </InputLabel>
    <Select<T[]>
      labelId={id}
      label={label}
      multiple
      displayEmpty
      notched
      value={value}
      onChange={(e) => {
        // Com `multiple`, o valor é sempre array (string só em autofill).
        const next = e.target.value;
        if (Array.isArray(next)) {
          // Mantém a ordem das opções, não a ordem de clique.
          onChange(options.filter((option) => next.includes(option)));
        }
      }}
      renderValue={(selected) =>
        selected.length === 0
          ? emptyLabel
          : options
              .filter((option) => selected.includes(option))
              .map(getOptionLabel)
              .join(', ')
      }
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          <Checkbox size='small' checked={value.includes(option)} />
          <ListItemText primary={getOptionLabel(option)} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default MultiSelectFilter;
