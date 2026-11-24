import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { SpellSchool } from '../../interfaces/Spells';
import ClickableChipFilterGroup, {
  ClickableFilterOption,
} from '../Database/ClickableChipFilterGroup';
import {
  ALVO_TIPO_LABELS,
  DESCRITOR_LABELS,
  FUNCAO_LABELS,
  SCHOOL_LABELS,
  SpellFilters,
  SpellTraditionFilter,
} from '../DatabaseTables/spellsFilters';

interface AdvancedSpellFilterProps {
  filters: SpellFilters;
  onFilterChange: (filters: Partial<SpellFilters>) => void;
  availableSchools: SpellSchool[];
  availableExecutionTimes: string[];
  availableFuncoes: string[];
  availableDescritores: string[];
  availableAlvoTipos: string[];
  availableResistencias: string[];
  availableAlcances: string[];
  availableDeities: string[];
}

const TRADITION_OPTIONS: ClickableFilterOption[] = [
  { value: 'arcane', label: 'Arcana' },
  { value: 'divine', label: 'Divina' },
  { value: 'universal', label: 'Universal' },
];

const CIRCLE_OPTIONS: ClickableFilterOption[] = [1, 2, 3, 4, 5].map((c) => ({
  value: String(c),
  label: `${c}º Círculo`,
}));

const toggleStr = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const toggleNum = (arr: number[], val: number) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const AdvancedSpellFilter: React.FC<AdvancedSpellFilterProps> = ({
  filters,
  onFilterChange,
  availableSchools,
  availableExecutionTimes,
  availableFuncoes,
  availableDescritores,
  availableAlvoTipos,
  availableResistencias,
  availableAlcances,
  availableDeities,
}) => {
  const [showOntologyDetails, setShowOntologyDetails] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const ontologyActiveCount =
    filters.funcoes.length +
    filters.descritores.length +
    filters.alvoTipos.length +
    filters.executionTimes.length +
    filters.alcances.length +
    filters.resistencias.length +
    filters.deities.length;

  const totalActiveCount =
    (filters.spellType !== 'all' ? 1 : 0) +
    filters.circles.length +
    filters.schools.length +
    ontologyActiveCount;

  const handleClearAll = () => {
    onFilterChange({
      circles: [],
      schools: [],
      executionTimes: [],
      spellType: 'all',
      funcoes: [],
      descritores: [],
      tiposDano: [],
      alvoTipos: [],
      resistencias: [],
      alcances: [],
      deities: [],
    });
  };

  return (
    <Paper
      variant='outlined'
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 2,
        borderColor: `${theme.palette.primary.main}33`,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
      }}
    >
      <Stack spacing={1.75}>
        {/* Filtros Principais Imediatos em Chips Clicáveis */}
        <ClickableChipFilterGroup
          label='Tradição:'
          allLabel='Todas'
          options={TRADITION_OPTIONS}
          selected={filters.spellType === 'all' ? [] : [filters.spellType]}
          onToggle={(val) =>
            onFilterChange({
              spellType:
                filters.spellType === val
                  ? 'all'
                  : (val as SpellTraditionFilter),
            })
          }
          onClear={() => onFilterChange({ spellType: 'all' })}
        />

        <ClickableChipFilterGroup
          label='Círculo:'
          allLabel='Todos'
          options={CIRCLE_OPTIONS}
          selected={filters.circles.map(String)}
          onToggle={(val) =>
            onFilterChange({ circles: toggleNum(filters.circles, Number(val)) })
          }
          onClear={() => onFilterChange({ circles: [] })}
        />

        <ClickableChipFilterGroup
          label='Escola:'
          allLabel='Todas'
          options={availableSchools.map((school) => ({
            value: school,
            label: SCHOOL_LABELS[school] || school,
          }))}
          selected={filters.schools}
          onToggle={(val) =>
            onFilterChange({ schools: toggleStr(filters.schools, val) })
          }
          onClear={() => onFilterChange({ schools: [] })}
        />

        <Divider />

        {/* Cabeçalho do Bloco de Filtros da Ontologia & Mecânica */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Button
            size='small'
            variant='text'
            startIcon={<FilterListIcon />}
            endIcon={
              showOntologyDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={() => setShowOntologyDetails((prev) => !prev)}
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Filtros da Ontologia & Mecânica (Função, Elemento, Alvo, Devoção)
            {ontologyActiveCount > 0 && (
              <Chip
                label={ontologyActiveCount}
                size='small'
                color='primary'
                sx={{ ml: 1, height: 20 }}
              />
            )}
          </Button>

          {totalActiveCount > 0 && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon fontSize='small' />}
              onClick={handleClearAll}
              sx={{
                fontFamily: 'Tfont, serif',
                textTransform: 'none',
              }}
            >
              Limpar filtros ({totalActiveCount})
            </Button>
          )}
        </Box>

        <Collapse in={showOntologyDetails} timeout='auto'>
          <Stack spacing={1.75} sx={{ pt: 1 }}>
            {availableFuncoes.length > 0 && (
              <ClickableChipFilterGroup
                label='Função Tática (Ontologia):'
                allLabel='Todas'
                options={availableFuncoes.map((f) => ({
                  value: f,
                  label: FUNCAO_LABELS[f] || f,
                }))}
                selected={filters.funcoes}
                onToggle={(val) =>
                  onFilterChange({ funcoes: toggleStr(filters.funcoes, val) })
                }
                onClear={() => onFilterChange({ funcoes: [] })}
              />
            )}

            {availableDescritores.length > 0 && (
              <ClickableChipFilterGroup
                label='Descritores & Tipos de Dano:'
                allLabel='Todos'
                options={availableDescritores.map((d) => ({
                  value: d,
                  label: DESCRITOR_LABELS[d] || d,
                }))}
                selected={filters.descritores}
                onToggle={(val) =>
                  onFilterChange({
                    descritores: toggleStr(filters.descritores, val),
                  })
                }
                onClear={() => onFilterChange({ descritores: [] })}
              />
            )}

            {availableAlvoTipos.length > 0 && (
              <ClickableChipFilterGroup
                label='Tipo de Alvo:'
                allLabel='Todos'
                options={availableAlvoTipos.map((a) => ({
                  value: a,
                  label: ALVO_TIPO_LABELS[a] || a,
                }))}
                selected={filters.alvoTipos}
                onToggle={(val) =>
                  onFilterChange({
                    alvoTipos: toggleStr(filters.alvoTipos, val),
                  })
                }
                onClear={() => onFilterChange({ alvoTipos: [] })}
              />
            )}

            {availableExecutionTimes.length > 0 && (
              <ClickableChipFilterGroup
                label='Execução:'
                allLabel='Todas'
                options={availableExecutionTimes.map((t) => ({
                  value: t,
                  label: t,
                }))}
                selected={filters.executionTimes}
                onToggle={(val) =>
                  onFilterChange({
                    executionTimes: toggleStr(filters.executionTimes, val),
                  })
                }
                onClear={() => onFilterChange({ executionTimes: [] })}
              />
            )}

            {availableAlcances.length > 0 && (
              <ClickableChipFilterGroup
                label='Alcance:'
                allLabel='Todos'
                options={availableAlcances.map((a) => ({
                  value: a,
                  label: a,
                }))}
                selected={filters.alcances}
                onToggle={(val) =>
                  onFilterChange({
                    alcances: toggleStr(filters.alcances, val),
                  })
                }
                onClear={() => onFilterChange({ alcances: [] })}
              />
            )}

            {availableResistencias.length > 0 && (
              <ClickableChipFilterGroup
                label='Resistência:'
                allLabel='Todas'
                options={availableResistencias.map((r) => ({
                  value: r,
                  label: r,
                }))}
                selected={filters.resistencias}
                onToggle={(val) =>
                  onFilterChange({
                    resistencias: toggleStr(filters.resistencias, val),
                  })
                }
                onClear={() => onFilterChange({ resistencias: [] })}
              />
            )}

            {availableDeities.length > 0 && (
              <ClickableChipFilterGroup
                label='Devoção / Aprimoramento Exclusivo:'
                allLabel='Qualquer'
                options={availableDeities.map((d) => ({
                  value: d,
                  label: d,
                }))}
                selected={filters.deities}
                onToggle={(val) =>
                  onFilterChange({ deities: toggleStr(filters.deities, val) })
                }
                onClear={() => onFilterChange({ deities: [] })}
                enableQuickFilter
                quickFilterPlaceholder='Filtrar deus...'
              />
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default AdvancedSpellFilter;
