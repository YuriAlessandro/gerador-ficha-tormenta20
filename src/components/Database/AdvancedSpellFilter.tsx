import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Paper,
  Grid,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import MultiSelectFilter from '@/components/SpellPicker/MultiSelectFilter';
import { toggleInArray } from '@/components/SpellPicker/spellFilters';

const CIRCLE_OPTIONS = [1, 2, 3, 4, 5];

interface SpellFilters {
  search: string;
  circles: number[];
  schools: string[];
  executionTimes: string[];
  spellType: 'arcane' | 'divine' | 'all';
}

interface AdvancedSpellFilterProps {
  filters: SpellFilters;
  onFilterChange: (filters: Partial<SpellFilters>) => void;
  availableSchools: string[];
  availableExecutionTimes: string[];
}

const AdvancedSpellFilter: React.FC<AdvancedSpellFilterProps> = ({
  filters,
  onFilterChange,
  availableSchools,
  availableExecutionTimes,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 720px)');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleClearFilters = () => {
    onFilterChange({
      circles: [],
      schools: [],
      executionTimes: [],
      spellType: 'all',
    });
  };

  const hasActiveFilters =
    filters.circles.length > 0 ||
    filters.schools.length > 0 ||
    filters.executionTimes.length > 0 ||
    filters.spellType !== 'all';

  const getActiveFilterChips = () => {
    const chips: { label: string; key: string; onDelete: () => void }[] = [];

    filters.circles.forEach((circle) =>
      chips.push({
        label: `${circle}º Círculo`,
        key: `circle-${circle}`,
        onDelete: () =>
          onFilterChange({ circles: toggleInArray(filters.circles, circle) }),
      })
    );

    filters.schools.forEach((school) =>
      chips.push({
        label: school,
        key: `school-${school}`,
        onDelete: () =>
          onFilterChange({ schools: toggleInArray(filters.schools, school) }),
      })
    );

    filters.executionTimes.forEach((time) =>
      chips.push({
        label: time,
        key: `execution-${time}`,
        onDelete: () =>
          onFilterChange({
            executionTimes: toggleInArray(filters.executionTimes, time),
          }),
      })
    );

    if (filters.spellType !== 'all') {
      chips.push({
        label: filters.spellType === 'arcane' ? 'Arcana' : 'Divina',
        key: 'type',
        onDelete: () => onFilterChange({ spellType: 'all' }),
      });
    }

    return chips;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.primary.main}33`,
        overflow: 'hidden',
      }}
    >
      {/* Filter Header */}
      <Box
        sx={{
          p: 2,
          background: isDark
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: hasActiveFilters
            ? `1px solid ${theme.palette.primary.main}4D`
            : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FilterListIcon color='primary' />
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Tfont, serif',
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Filtros Avançados
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={`${getActiveFilterChips().length} ativos`}
              size='small'
              color='primary'
              sx={{ ml: 1, fontFamily: 'Tfont, serif' }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {hasActiveFilters && (
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              title='Limpar filtros'
              sx={{ color: theme.palette.primary.main }}
            >
              <ClearIcon />
            </IconButton>
          )}
          <IconButton size='small' sx={{ color: theme.palette.primary.main }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <Box
          sx={{ p: 2, pt: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
          <Typography
            variant='body2'
            gutterBottom
            sx={{
              color: 'text.secondary',
            }}
          >
            Filtros aplicados:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {getActiveFilterChips().map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size='small'
                onDelete={chip.onDelete}
                color='primary'
                variant='outlined'
                sx={{ fontFamily: 'Tfont, serif' }}
              />
            ))}
          </Box>
        </Box>
      )}
      {/* Filter Controls */}
      <Collapse in={expanded} timeout='auto'>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Circle Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MultiSelectFilter
                id='circle-filter-label'
                label='Círculo'
                emptyLabel='Todos os Círculos'
                options={CIRCLE_OPTIONS}
                value={filters.circles}
                onChange={(circles) => onFilterChange({ circles })}
                getOptionLabel={(circle) => `${circle}º Círculo`}
              />
            </Grid>

            {/* School Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MultiSelectFilter
                id='school-filter-label'
                label='Escola'
                emptyLabel='Todas as Escolas'
                options={availableSchools}
                value={filters.schools}
                onChange={(schools) => onFilterChange({ schools })}
              />
            </Grid>

            {/* Execution Time Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MultiSelectFilter
                id='execution-filter-label'
                label='Execução'
                emptyLabel='Todos os Tempos'
                options={availableExecutionTimes}
                value={filters.executionTimes}
                onChange={(executionTimes) =>
                  onFilterChange({ executionTimes })
                }
              />
            </Grid>

            {/* Spell Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel id='type-filter-label'>Tipo</InputLabel>
                <Select
                  labelId='type-filter-label'
                  value={filters.spellType}
                  onChange={(e) =>
                    onFilterChange({
                      spellType: e.target.value as 'arcane' | 'divine' | 'all',
                    })
                  }
                  label='Tipo'
                >
                  <MenuItem value='all'>Arcanas e Divinas</MenuItem>
                  <MenuItem value='arcane'>Apenas Arcanas</MenuItem>
                  <MenuItem value='divine'>Apenas Divinas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Filter Description */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: `${theme.palette.primary.main}0D`,
              borderRadius: 1,
            }}
          >
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
              }}
            >
              <strong>Dica:</strong> Use os filtros para refinar sua busca. Você
              pode marcar várias opções em cada filtro e combinar múltiplos
              critérios para encontrar exatamente as magias que precisa. A busca
              por texto funciona no nome, descrição e aprimoramentos das magias.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSpellFilter;
