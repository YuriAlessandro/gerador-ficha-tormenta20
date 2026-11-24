/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { GeneralPowerType } from '../../interfaces/Poderes';
import { SupplementId } from '../../types/supplement.types';
import { normalizeSearch } from '../../functions/stringUtils';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import DatabaseGrid from '../Database/DatabaseGrid';
import SearchInput from './SearchInput';
import SupplementFilter from './SupplementFilter';
import PowerSubfilters from './PowerSubfilters';
import PowerCard from './PowerCard';
import {
  ALL_POWER_SUPPLEMENTS,
  POWER_CATEGORY_LABELS,
  PowerTabCategory,
  PrereqQuickFilter,
  buildClassSubfilterOptions,
  buildDeitySubfilterOptions,
  buildDistinctionSubfilterOptions,
  buildRaceSubfilterOptions,
  buildTacticalSubfilterOptions,
  buildUnifiedPowersCatalog,
  filterPowersCatalog,
} from './powersFilters';

const CATEGORY_ORDER: PowerTabCategory[] = [
  'ALL',
  GeneralPowerType.COMBATE,
  GeneralPowerType.CONCEDIDOS,
  GeneralPowerType.DESTINO,
  GeneralPowerType.MAGIA,
  GeneralPowerType.TORMENTA,
  GeneralPowerType.RACA,
  'CLASSE',
  GeneralPowerType.DISTINCAO,
];

const toggleSelection = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const PowersTable: React.FC = () => {
  const theme = useTheme();
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementId[]>(
    ALL_POWER_SUPPLEMENTS
  );
  const [category, setCategory] = useState<PowerTabCategory>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);
  const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDistinctions, setSelectedDistinctions] = useState<string[]>(
    []
  );
  const [selectedTactical, setSelectedTactical] = useState<string[]>([]);
  const [prereqFilter, setPrereqFilter] = useState<PrereqQuickFilter>('ALL');

  const { params } = useRouteMatch<{ selectedPower?: string }>();
  const history = useHistory();

  const fullCatalog = useMemo(
    () => buildUnifiedPowersCatalog(selectedSupplements),
    [selectedSupplements]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: fullCatalog.length };
    CATEGORY_ORDER.forEach((cat) => {
      if (cat !== 'ALL') {
        counts[cat] = fullCatalog.filter((item) => item.category === cat).length;
      }
    });
    return counts;
  }, [fullCatalog]);

  const raceOptions = useMemo(
    () => buildRaceSubfilterOptions(fullCatalog),
    [fullCatalog]
  );
  const deityOptions = useMemo(
    () => buildDeitySubfilterOptions(fullCatalog),
    [fullCatalog]
  );
  const classOptions = useMemo(
    () => buildClassSubfilterOptions(fullCatalog),
    [fullCatalog]
  );
  const distinctionOptions = useMemo(
    () => buildDistinctionSubfilterOptions(fullCatalog),
    [fullCatalog]
  );
  const tacticalOptions = useMemo(
    () => buildTacticalSubfilterOptions(fullCatalog, category),
    [fullCatalog, category]
  );

  const filteredPowers = useMemo(
    () =>
      filterPowersCatalog(fullCatalog, {
        category,
        search,
        selectedRaces,
        selectedDeities,
        selectedClasses,
        selectedDistinctions,
        selectedTactical,
        prereqFilter,
      }),
    [
      fullCatalog,
      category,
      search,
      selectedRaces,
      selectedDeities,
      selectedClasses,
      selectedDistinctions,
      selectedTactical,
      prereqFilter,
    ]
  );

  const handleToggleSupplement = (supplementId: SupplementId) => {
    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== supplementId);
      }
      if (supplementId === SupplementId.TORMENTA20_CORE) {
        return [supplementId, ...prev];
      }
      return [...prev, supplementId];
    });
  };

  // Suporte a deep link (/database/poderes/:selectedPower)
  useEffect(() => {
    const { selectedPower } = params;
    if (selectedPower) {
      const decoded = decodeURIComponent(selectedPower);
      setCategory('ALL');
      setSearch(decoded);
    }
  }, [params]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearch(nextValue);
    if (params.selectedPower) {
      history.push('/database/poderes');
    }
  };

  const onVoiceSearch = (newValue: string) => {
    setSearch(newValue);
    if (params.selectedPower) {
      history.push('/database/poderes');
    }
  };

  const handleCategoryChange = (
    _event: React.SyntheticEvent,
    nextCategory: PowerTabCategory
  ) => {
    setCategory(nextCategory);
    setSelectedRaces([]);
    setSelectedDeities([]);
    setSelectedClasses([]);
    setSelectedDistinctions([]);
    setSelectedTactical([]);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('ALL');
    setSelectedRaces([]);
    setSelectedDeities([]);
    setSelectedClasses([]);
    setSelectedDistinctions([]);
    setSelectedTactical([]);
    setPrereqFilter('ALL');
    if (params.selectedPower) {
      history.push('/database/poderes');
    }
  };

  const normalizedSelectedParam = params.selectedPower
    ? normalizeSearch(decodeURIComponent(params.selectedPower))
    : '';

  const selectedPowerData =
    filteredPowers.length === 1 && params.selectedPower
      ? filteredPowers[0]
      : null;
  const powersSEO = getPageSEO('powers');

  const resetKey = `${category}|${search}|${selectedRaces.join(',')}|${selectedDeities.join(',')}|${selectedClasses.join(',')}|${selectedDistinctions.join(',')}|${selectedTactical.join(',')}|${prereqFilter}|${selectedSupplements.join(',')}`;

  return (
    <>
      <SEO
        title={
          selectedPowerData
            ? `${selectedPowerData.name} - Poder de Tormenta 20`
            : powersSEO.title
        }
        description={
          selectedPowerData
            ? `Requisitos e efeitos do poder ${selectedPowerData.name} (${selectedPowerData.categoryLabel}) em Tormenta 20.`
            : powersSEO.description
        }
        url={`/database/poderes${
          selectedPowerData && params.selectedPower
            ? `/${params.selectedPower}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Poderes
        </TormentaTitle>

        {/* Filtro de Suplementos */}
        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_POWER_SUPPLEMENTS}
          onToggleSupplement={handleToggleSupplement}
        />

        {/* Barra de Busca Ampliada */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 540 }}>
            <SearchInput
              value={search}
              handleChange={handleSearchChange}
              onVoiceSearch={onVoiceSearch}
            />
          </Box>
        </Box>

        {/* Abas Reais de Categoria */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={category}
            onChange={handleCategoryChange}
            aria-label='Categorias de poderes'
            variant='scrollable'
            scrollButtons='auto'
            allowScrollButtonsMobile
            sx={{
              maxWidth: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: 1.5,
              '& .MuiTab-root': {
                fontFamily: 'Tfont, serif',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
                textTransform: 'none',
                minHeight: 44,
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#FFFFFF',
                backgroundColor: 'rgba(255,255,255,0.14)',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFFFFF',
                height: 3,
              },
            }}
          >
            {CATEGORY_ORDER.map((cat) => {
              const label =
                cat === 'ALL'
                  ? `Todos (${categoryCounts.ALL})`
                  : `${POWER_CATEGORY_LABELS[cat]} (${categoryCounts[cat] ?? 0})`;
              return <Tab key={cat} value={cat} label={label} />;
            })}
          </Tabs>
        </Box>

        {/* Subfiltros Contextuais em Chips Clicáveis */}
        <PowerSubfilters
          category={category}
          raceOptions={raceOptions}
          selectedRaces={selectedRaces}
          onToggleRace={(r) => setSelectedRaces((prev) => toggleSelection(prev, r))}
          onClearRaces={() => setSelectedRaces([])}
          deityOptions={deityOptions}
          selectedDeities={selectedDeities}
          onToggleDeity={(d) =>
            setSelectedDeities((prev) => toggleSelection(prev, d))
          }
          onClearDeities={() => setSelectedDeities([])}
          classOptions={classOptions}
          selectedClasses={selectedClasses}
          onToggleClass={(c) =>
            setSelectedClasses((prev) => toggleSelection(prev, c))
          }
          onClearClasses={() => setSelectedClasses([])}
          distinctionOptions={distinctionOptions}
          selectedDistinctions={selectedDistinctions}
          onToggleDistinction={(dist) =>
            setSelectedDistinctions((prev) => toggleSelection(prev, dist))
          }
          onClearDistinctions={() => setSelectedDistinctions([])}
          tacticalOptions={tacticalOptions}
          selectedTactical={selectedTactical}
          onToggleTactical={(t) =>
            setSelectedTactical((prev) => toggleSelection(prev, t))
          }
          onClearTactical={() => setSelectedTactical([])}
          prereqFilter={prereqFilter}
          onSelectPrereq={setPrereqFilter}
        />

        {/* Resumo de Resultados */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {filteredPowers.length} poder
            {filteredPowers.length !== 1 ? 'es' : ''} exibido
            {filteredPowers.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Grade de Cards Abertos com Texto Integral */}
        <DatabaseGrid
          ariaLabel='Grade de poderes'
          resetKey={resetKey}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                {category === GeneralPowerType.DISTINCAO &&
                distinctionOptions.length === 0
                  ? 'Nenhuma distinção disponível no build público atual.'
                  : 'Nenhum poder encontrado com os filtros aplicados.'}
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={clearAllFilters}
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                Limpar filtros
              </Button>
            </Paper>
          }
        >
          {filteredPowers.map((power) => (
            <PowerCard
              key={power.id}
              power={power}
              highlighted={
                Boolean(normalizedSelectedParam) &&
                normalizeSearch(power.name) === normalizedSelectedParam
              }
            />
          ))}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default PowersTable;
