import React, { useState } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getSchoolLabel } from './schoolLabels';
import { SpellFilterState, SpellFilterOptions } from './spellFilters';

export interface SpellAdvancedFiltersVisibility {
  circle?: boolean;
  school?: boolean;
  execution?: boolean;
  spellType?: boolean;
}

interface SpellAdvancedFiltersProps {
  filters: SpellFilterState;
  onFilterChange: (patch: Partial<SpellFilterState>) => void;
  options: SpellFilterOptions;
  visibleFilters: SpellAdvancedFiltersVisibility;
  searchPlaceholder?: string;
}

const SPELL_TYPE_LABEL: Record<'arcane' | 'divine', string> = {
  arcane: 'Arcanas',
  divine: 'Divinas',
};

const SpellAdvancedFilters: React.FC<SpellAdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  options,
  visibleFilters,
  searchPlaceholder = 'Buscar magias...',
}) => {
  const [expanded, setExpanded] = useState(false);

  const showCircle = !!visibleFilters.circle && options.circles.length > 1;
  const showSchool = !!visibleFilters.school && options.schools.length > 1;
  const showExecution =
    !!visibleFilters.execution && options.executions.length > 1;
  const showSpellType = !!visibleFilters.spellType;

  const hasAnyFilterControl =
    showCircle || showSchool || showExecution || showSpellType;

  const activeChips: { key: string; label: string; onDelete: () => void }[] =
    [];
  if (showCircle && filters.circle !== 'all') {
    activeChips.push({
      key: 'circle',
      label: `${filters.circle}º Círculo`,
      onDelete: () => onFilterChange({ circle: 'all' }),
    });
  }
  if (showSchool && filters.school !== 'all') {
    activeChips.push({
      key: 'school',
      label: getSchoolLabel(filters.school),
      onDelete: () => onFilterChange({ school: 'all' }),
    });
  }
  if (showExecution && filters.execution !== 'all') {
    activeChips.push({
      key: 'execution',
      label: filters.execution,
      onDelete: () => onFilterChange({ execution: 'all' }),
    });
  }
  if (showSpellType && filters.spellType !== 'all') {
    activeChips.push({
      key: 'spellType',
      label: SPELL_TYPE_LABEL[filters.spellType],
      onDelete: () => onFilterChange({ spellType: 'all' }),
    });
  }

  const handleClear = () => {
    onFilterChange({
      circle: 'all',
      school: 'all',
      execution: 'all',
      spellType: 'all',
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder={searchPlaceholder}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
          size='small'
          sx={{ flexGrow: 1 }}
        />
        {hasAnyFilterControl && (
          <Button
            variant='outlined'
            size='small'
            onClick={() => setExpanded((prev) => !prev)}
            startIcon={
              <Badge
                color='primary'
                badgeContent={activeChips.length}
                invisible={activeChips.length === 0}
              >
                <FilterListIcon />
              </Badge>
            }
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Filtros avançados
          </Button>
        )}
      </Stack>

      {hasAnyFilterControl && (
        <Collapse in={expanded} timeout='auto'>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {showCircle && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='spell-circle-filter'>Círculo</InputLabel>
                    <Select
                      labelId='spell-circle-filter'
                      label='Círculo'
                      value={filters.circle}
                      onChange={(e) =>
                        onFilterChange({
                          circle: e.target.value as number | 'all',
                        })
                      }
                    >
                      <MenuItem value='all'>Todos os Círculos</MenuItem>
                      {options.circles.map((circle) => (
                        <MenuItem key={circle} value={circle}>
                          {circle}º Círculo
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {showSchool && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='spell-school-filter'>Escola</InputLabel>
                    <Select
                      labelId='spell-school-filter'
                      label='Escola'
                      value={filters.school}
                      onChange={(e) =>
                        onFilterChange({
                          school: e.target.value as SpellFilterState['school'],
                        })
                      }
                    >
                      <MenuItem value='all'>Todas as Escolas</MenuItem>
                      {options.schools.map((school) => (
                        <MenuItem key={school} value={school}>
                          {getSchoolLabel(school)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {showExecution && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='spell-execution-filter'>
                      Execução
                    </InputLabel>
                    <Select
                      labelId='spell-execution-filter'
                      label='Execução'
                      value={filters.execution}
                      onChange={(e) =>
                        onFilterChange({ execution: e.target.value })
                      }
                    >
                      <MenuItem value='all'>Todas as Execuções</MenuItem>
                      {options.executions.map((execution) => (
                        <MenuItem key={execution} value={execution}>
                          {execution}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {showSpellType && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='spell-type-filter'>Tipo</InputLabel>
                    <Select
                      labelId='spell-type-filter'
                      label='Tipo'
                      value={filters.spellType}
                      onChange={(e) =>
                        onFilterChange({
                          spellType: e.target
                            .value as SpellFilterState['spellType'],
                        })
                      }
                    >
                      <MenuItem value='all'>Arcanas e Divinas</MenuItem>
                      <MenuItem value='arcane'>Apenas Arcanas</MenuItem>
                      <MenuItem value='divine'>Apenas Divinas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {activeChips.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {activeChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size='small'
                    color='primary'
                    variant='outlined'
                    onDelete={chip.onDelete}
                  />
                ))}
                <Button size='small' onClick={handleClear}>
                  Limpar
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default SpellAdvancedFilters;
