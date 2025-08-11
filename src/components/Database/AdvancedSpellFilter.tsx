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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

interface SpellFilters {
  search: string;
  circle: number | 'all';
  school: string | 'all';
  executionTime: string | 'all';
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

  const handleClearFilters = () => {
    onFilterChange({
      circle: 'all',
      school: 'all',
      executionTime: 'all',
      spellType: 'all',
    });
  };

  const hasActiveFilters =
    filters.circle !== 'all' ||
    filters.school !== 'all' ||
    filters.executionTime !== 'all' ||
    filters.spellType !== 'all';

  const getActiveFilterChips = () => {
    const chips = [];

    if (filters.circle !== 'all') {
      chips.push({
        label: `${filters.circle}º Círculo`,
        key: 'circle',
        onDelete: () => onFilterChange({ circle: 'all' }),
      });
    }

    if (filters.school !== 'all') {
      chips.push({
        label: filters.school,
        key: 'school',
        onDelete: () => onFilterChange({ school: 'all' }),
      });
    }

    if (filters.executionTime !== 'all') {
      chips.push({
        label: filters.executionTime,
        key: 'execution',
        onDelete: () => onFilterChange({ executionTime: 'all' }),
      });
    }

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
        border: '1px solid rgba(209, 50, 53, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Filter Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: hasActiveFilters
            ? '1px solid rgba(209, 50, 53, 0.3)'
            : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box display='flex' alignItems='center' gap={1}>
          <FilterListIcon color='primary' />
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Tfont, serif',
              color: '#d13235',
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

        <Box display='flex' alignItems='center' gap={1}>
          {hasActiveFilters && (
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              title='Limpar filtros'
              sx={{ color: '#d13235' }}
            >
              <ClearIcon />
            </IconButton>
          )}
          <IconButton size='small' sx={{ color: '#d13235' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <Box
          sx={{ p: 2, pt: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Filtros aplicados:
          </Typography>
          <Box display='flex' gap={1} flexWrap='wrap'>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel id='circle-filter-label'>Círculo</InputLabel>
                <Select
                  labelId='circle-filter-label'
                  value={filters.circle}
                  onChange={(e) =>
                    onFilterChange({ circle: e.target.value as number | 'all' })
                  }
                  label='Círculo'
                >
                  <MenuItem value='all'>Todos os Círculos</MenuItem>
                  <MenuItem value={1}>1º Círculo</MenuItem>
                  <MenuItem value={2}>2º Círculo</MenuItem>
                  <MenuItem value={3}>3º Círculo</MenuItem>
                  <MenuItem value={4}>4º Círculo</MenuItem>
                  <MenuItem value={5}>5º Círculo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* School Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel id='school-filter-label'>Escola</InputLabel>
                <Select
                  labelId='school-filter-label'
                  value={filters.school}
                  onChange={(e) => onFilterChange({ school: e.target.value })}
                  label='Escola'
                >
                  <MenuItem value='all'>Todas as Escolas</MenuItem>
                  {availableSchools.map((school) => (
                    <MenuItem key={school} value={school}>
                      {school}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Execution Time Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel id='execution-filter-label'>Execução</InputLabel>
                <Select
                  labelId='execution-filter-label'
                  value={filters.executionTime}
                  onChange={(e) =>
                    onFilterChange({ executionTime: e.target.value })
                  }
                  label='Execução'
                >
                  <MenuItem value='all'>Todos os Tempos</MenuItem>
                  {availableExecutionTimes.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Spell Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
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
              backgroundColor: 'rgba(209, 50, 53, 0.05)',
              borderRadius: 1,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              <strong>Dica:</strong> Use os filtros para refinar sua busca. Você
              pode combinar múltiplos critérios para encontrar exatamente as
              magias que precisa. A busca por texto funciona no nome, descrição
              e aprimoramentos das magias.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedSpellFilter;
