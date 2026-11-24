import React from 'react';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { GeneralPowerType } from '../../interfaces/Poderes';
import ClickableChipFilterGroup, {
  ClickableFilterOption,
} from '../Database/ClickableChipFilterGroup';
import { PowerTabCategory, PrereqQuickFilter } from './powersFilters';

interface PowerSubfiltersProps {
  category: PowerTabCategory;
  raceOptions: ClickableFilterOption[];
  selectedRaces: string[];
  onToggleRace: (race: string) => void;
  onClearRaces: () => void;
  deityOptions: ClickableFilterOption[];
  selectedDeities: string[];
  onToggleDeity: (deity: string) => void;
  onClearDeities: () => void;
  classOptions: ClickableFilterOption[];
  selectedClasses: string[];
  onToggleClass: (cls: string) => void;
  onClearClasses: () => void;
  distinctionOptions: ClickableFilterOption[];
  selectedDistinctions: string[];
  onToggleDistinction: (dist: string) => void;
  onClearDistinctions: () => void;
  tacticalOptions: ClickableFilterOption[];
  selectedTactical: string[];
  onToggleTactical: (tactical: string) => void;
  onClearTactical: () => void;
  prereqFilter: PrereqQuickFilter;
  onSelectPrereq: (value: PrereqQuickFilter) => void;
}

const PREREQ_OPTIONS: ClickableFilterOption[] = [
  { value: 'NONE', label: 'Sem pré-requisitos' },
  { value: 'PODER', label: 'Exige Poder' },
  { value: 'PERICIA', label: 'Exige Perícia' },
  { value: 'ATRIBUTO', label: 'Exige Atributo' },
  { value: 'NIVEL', label: 'Exige Nível' },
  { value: 'MAGIA', label: 'Exige Magia / Conjuração' },
  { value: 'TORMENTA', label: 'Exige Poder da Tormenta' },
  { value: 'ESCALA', label: 'Escala por Nível / Tormenta' },
];

/**
 * Painel contextual de subfiltros 100% em chips clicáveis para /database/poderes.
 * Exibe subfiltros específicos por aba (Raça, Divindade, Classe, Distinção) +
 * facetas ontológicas (Função Tática e Exigências).
 */
const PowerSubfilters: React.FC<PowerSubfiltersProps> = ({
  category,
  raceOptions,
  selectedRaces,
  onToggleRace,
  onClearRaces,
  deityOptions,
  selectedDeities,
  onToggleDeity,
  onClearDeities,
  classOptions,
  selectedClasses,
  onToggleClass,
  onClearClasses,
  distinctionOptions,
  selectedDistinctions,
  onToggleDistinction,
  onClearDistinctions,
  tacticalOptions,
  selectedTactical,
  onToggleTactical,
  onClearTactical,
  prereqFilter,
  onSelectPrereq,
}) => {
  const theme = useTheme();

  return (
    <Paper
      variant='outlined'
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 2,
        borderColor: `${theme.palette.primary.main}33`,
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.015)',
      }}
    >
      <Stack spacing={2}>
        {category === GeneralPowerType.RACA && (
          <ClickableChipFilterGroup
            label='Filtrar por Raça:'
            allLabel='Todas as Raças'
            options={raceOptions}
            selected={selectedRaces}
            onToggle={onToggleRace}
            onClear={onClearRaces}
            enableQuickFilter
            quickFilterPlaceholder='Buscar chip de raça...'
          />
        )}

        {category === GeneralPowerType.CONCEDIDOS && (
          <ClickableChipFilterGroup
            label='Filtrar por Divindade:'
            allLabel='Todas as Divindades'
            options={deityOptions}
            selected={selectedDeities}
            onToggle={onToggleDeity}
            onClear={onClearDeities}
            grouped
            enableQuickFilter
            quickFilterPlaceholder='Buscar chip de divindade...'
          />
        )}

        {category === 'CLASSE' && (
          <ClickableChipFilterGroup
            label='Filtrar por Classe:'
            allLabel='Todas as Classes'
            options={classOptions}
            selected={selectedClasses}
            onToggle={onToggleClass}
            onClear={onClearClasses}
            enableQuickFilter
            quickFilterPlaceholder='Buscar chip de classe...'
          />
        )}

        {category === GeneralPowerType.DISTINCAO && (
          <Box>
            {distinctionOptions.length > 0 ? (
              <ClickableChipFilterGroup
                label='Filtrar por Distinção:'
                allLabel='Todas as Distinções'
                options={distinctionOptions}
                selected={selectedDistinctions}
                onToggle={onToggleDistinction}
                onClear={onClearDistinctions}
              />
            ) : (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Os dados de Distinções dependem do módulo completo do Fichas de
                Nimb e não estão incluídos no stub público do repositório.
              </Typography>
            )}
          </Box>
        )}

        {tacticalOptions.length > 1 && (
          <ClickableChipFilterGroup
            label='Função / Categoria Tática (Ontologia):'
            allLabel='Todas'
            options={tacticalOptions}
            selected={selectedTactical}
            onToggle={onToggleTactical}
            onClear={onClearTactical}
          />
        )}

        <ClickableChipFilterGroup
          label='Exigências e Escala:'
          allLabel='Qualquer'
          options={PREREQ_OPTIONS}
          selected={prereqFilter === 'ALL' ? [] : [prereqFilter]}
          onToggle={(val) =>
            onSelectPrereq(
              prereqFilter === val ? 'ALL' : (val as PrereqQuickFilter)
            )
          }
          onClear={() => onSelectPrereq('ALL')}
        />
      </Stack>
    </Paper>
  );
};

export default PowerSubfilters;
