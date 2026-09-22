import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { SpellSchool } from '@/interfaces/Spells';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';
import {
  SpellFilterState,
  toggleInArray,
} from '@/components/SpellPicker/spellFilters';
import SpellSchoolGlyph from './SpellSchoolGlyph';
import {
  DETAIL_LABEL_SX,
  FILTER_POPOVER_SX,
  SCHOOL_TOGGLE_ROW_SX,
} from './spellsTabStyles';

/** Filtros que só existem na ficha e não no tipo compartilhado do SpellPicker. */
export interface SheetSpellToggles {
  onlyWithRolls: boolean;
  onlyMemorized: boolean;
}

export interface SpellsFilterPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  filters: SpellFilterState;
  onFiltersChange: (filters: SpellFilterState) => void;
  toggles: SheetSpellToggles;
  onTogglesChange: (toggles: SheetSpellToggles) => void;
  /** Só as escolas presentes na ficha — não adianta oferecer filtro vazio. */
  schools: SpellSchool[];
  executions: string[];
  isMago?: boolean;
  onReset: () => void;
}

/**
 * Filtros avançados da aba.
 *
 * A escola é uma fileira dos mesmos glifos que aparecem nas linhas, e não um
 * `Select` de texto: além de ocupar uma linha só, ensina a legenda dos ícones
 * por osmose — quem filtra por Necromancia uma vez aprende a caveira.
 */
const SpellsFilterPopover: React.FC<SpellsFilterPopoverProps> = ({
  anchorEl,
  onClose,
  filters,
  onFiltersChange,
  toggles,
  onTogglesChange,
  schools,
  executions,
  isMago,
  onReset,
}) => (
  <Popover
    open={!!anchorEl}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Box sx={FILTER_POPOVER_SX}>
      {schools.length > 1 && (
        <Box>
          <Typography variant='caption' sx={DETAIL_LABEL_SX}>
            Escola
          </Typography>
          <Box sx={SCHOOL_TOGGLE_ROW_SX}>
            {schools.map((school) => {
              const active = filters.schools.includes(school);
              return (
                <Tooltip key={school} title={getSchoolLabel(school)} arrow>
                  <IconButton
                    size='small'
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        schools: toggleInArray(filters.schools, school),
                      })
                    }
                    sx={{
                      border: '1px solid',
                      borderColor: active ? 'primary.main' : 'transparent',
                    }}
                    aria-label={`Filtrar por ${getSchoolLabel(school)}`}
                    aria-pressed={active}
                  >
                    <SpellSchoolGlyph
                      school={school}
                      active={active || filters.schools.length === 0}
                      disableTooltip
                    />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      {executions.length > 1 && (
        <Box>
          <Typography variant='caption' sx={DETAIL_LABEL_SX}>
            Execução
          </Typography>
          <Select<string[]>
            multiple
            displayEmpty
            value={filters.executions}
            onChange={(e: SelectChangeEvent<string[]>) => {
              const next = e.target.value;
              if (Array.isArray(next)) {
                onFiltersChange({
                  ...filters,
                  executions: executions.filter((ex) => next.includes(ex)),
                });
              }
            }}
            renderValue={(selected) =>
              selected.length === 0 ? 'Todas' : selected.join(', ')
            }
            size='small'
            fullWidth
          >
            {executions.map((execution) => (
              <MenuItem key={execution} value={execution}>
                <Checkbox
                  size='small'
                  checked={filters.executions.includes(execution)}
                />
                <ListItemText primary={execution} />
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <Box>
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={toggles.onlyWithRolls}
              onChange={(e) =>
                onTogglesChange({
                  ...toggles,
                  onlyWithRolls: e.target.checked,
                })
              }
            />
          }
          label={<Typography variant='body2'>Somente com rolagem</Typography>}
        />
        {isMago && (
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={toggles.onlyMemorized}
                onChange={(e) =>
                  onTogglesChange({
                    ...toggles,
                    onlyMemorized: e.target.checked,
                  })
                }
              />
            }
            label={<Typography variant='body2'>Somente memorizadas</Typography>}
          />
        )}
      </Box>

      <Button size='small' onClick={onReset}>
        Limpar filtros
      </Button>
    </Box>
  </Popover>
);

export default SpellsFilterPopover;
