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
import MultiSelectFilter from './MultiSelectFilter';
import {
  SpellFilterState,
  SpellFilterOptions,
  toggleInArray,
} from './spellFilters';

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
  if (showCircle) {
    filters.circles.forEach((circle) =>
      activeChips.push({
        key: `circle-${circle}`,
        label: `${circle}º Círculo`,
        onDelete: () =>
          onFilterChange({ circles: toggleInArray(filters.circles, circle) }),
      })
    );
  }
  if (showSchool) {
    filters.schools.forEach((school) =>
      activeChips.push({
        key: `school-${school}`,
        label: getSchoolLabel(school),
        onDelete: () =>
          onFilterChange({ schools: toggleInArray(filters.schools, school) }),
      })
    );
  }
  if (showExecution) {
    filters.executions.forEach((execution) =>
      activeChips.push({
        key: `execution-${execution}`,
        label: execution,
        onDelete: () =>
          onFilterChange({
            executions: toggleInArray(filters.executions, execution),
          }),
      })
    );
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
      circles: [],
      schools: [],
      executions: [],
      spellType: 'all',
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          placeholder={searchPlaceholder}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          size='small'
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
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
                  <MultiSelectFilter
                    id='spell-circle-filter'
                    label='Círculo'
                    emptyLabel='Todos os Círculos'
                    options={options.circles}
                    value={filters.circles}
                    onChange={(circles) => onFilterChange({ circles })}
                    getOptionLabel={(circle) => `${circle}º Círculo`}
                  />
                </Grid>
              )}

              {showSchool && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MultiSelectFilter
                    id='spell-school-filter'
                    label='Escola'
                    emptyLabel='Todas as Escolas'
                    options={options.schools}
                    value={filters.schools}
                    onChange={(schools) => onFilterChange({ schools })}
                    getOptionLabel={getSchoolLabel}
                  />
                </Grid>
              )}

              {showExecution && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MultiSelectFilter
                    id='spell-execution-filter'
                    label='Execução'
                    emptyLabel='Todas as Execuções'
                    options={options.executions}
                    value={filters.executions}
                    onChange={(executions) => onFilterChange({ executions })}
                  />
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
