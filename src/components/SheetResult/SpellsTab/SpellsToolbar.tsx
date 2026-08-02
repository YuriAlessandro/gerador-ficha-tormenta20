import React, { useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Badge,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { SpellSchool } from '@/interfaces/Spells';
import { SpellFilterState } from '@/components/SpellPicker/spellFilters';
import {
  CHIP_SCROLLER_SX,
  FILTER_CHIP_SX,
  TOOLBAR_SX,
} from '../common/listStyles';
import SpellsFilterPopover, { SheetSpellToggles } from './SpellsFilterPopover';

export interface CircleFilterOption {
  circle: number;
  label: string;
  count: number;
}

export interface SpellsToolbarProps {
  filters: SpellFilterState;
  onFiltersChange: (filters: SpellFilterState) => void;
  toggles: SheetSpellToggles;
  onTogglesChange: (toggles: SheetSpellToggles) => void;
  circleOptions: CircleFilterOption[];
  schools: SpellSchool[];
  executions: string[];
  isMago?: boolean;
  activeFilterCount: number;
  onReset: () => void;
}

/**
 * Busca + chips de círculo, grudados no topo da aba.
 *
 * Mesma anatomia da `PowersToolbar`. A diferença é que os chips de círculo são
 * seleção ÚNICA: "me mostra o 3º círculo" é a pergunta real, enquanto em poderes
 * combinar origens faz sentido.
 */
const SpellsToolbar: React.FC<SpellsToolbarProps> = ({
  filters,
  onFiltersChange,
  toggles,
  onTogglesChange,
  circleOptions,
  schools,
  executions,
  isMago,
  activeFilterCount,
  onReset,
}) => {
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box sx={TOOLBAR_SX}>
      <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75, pt: 1 }}>
        <TextField
          size='small'
          sx={{ flex: 1, minWidth: 0 }}
          placeholder='Buscar magia...'
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                    aria-label='Limpar busca'
                  >
                    <ClearIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Tooltip title='Filtros'>
          <IconButton
            size='small'
            color={activeFilterCount > 0 ? 'primary' : 'default'}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            aria-label='Filtros'
          >
            <Badge badgeContent={activeFilterCount} color='primary'>
              <TuneIcon fontSize='small' />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>

      {circleOptions.length > 1 && (
        <Box sx={CHIP_SCROLLER_SX}>
          <Chip
            label='Todos'
            size='small'
            sx={FILTER_CHIP_SX}
            color={filters.circle === 'all' ? 'primary' : 'default'}
            variant={filters.circle === 'all' ? 'filled' : 'outlined'}
            onClick={() => onFiltersChange({ ...filters, circle: 'all' })}
          />
          {circleOptions.map((option) => {
            const active = filters.circle === option.circle;
            return (
              <Chip
                key={option.circle}
                label={`${option.label} (${option.count})`}
                size='small'
                sx={FILTER_CHIP_SX}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    circle: active ? 'all' : option.circle,
                  })
                }
              />
            );
          })}
        </Box>
      )}

      <SpellsFilterPopover
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        filters={filters}
        onFiltersChange={onFiltersChange}
        toggles={toggles}
        onTogglesChange={onTogglesChange}
        schools={schools}
        executions={executions}
        isMago={isMago}
        onReset={onReset}
      />
    </Box>
  );
};

export default SpellsToolbar;
