import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import Divindade from '../../interfaces/Divindade';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { normalizeSearch } from '../../functions/stringUtils';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import SearchInput from './SearchInput';
import SupplementFilter from './SupplementFilter';
import DatabaseGrid from '../Database/DatabaseGrid';
import DatabaseCard from '../Database/DatabaseCard';
import ClickableChipFilterGroup, {
  ClickableFilterOption,
} from '../Database/ClickableChipFilterGroup';
import CopyUrlButton from '../Database/CopyUrlButton';
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
import { encyclopediaIds } from '../../functions/encyclopediaSearch';
import {
  ALL_DEITY_SUPPLEMENTS,
  DeityCategoryFilter,
  DeityEnergyFilter,
  DeityStatusDivinoFilter,
  filterDeities,
  isMinorDeity,
} from './deitiesFilters';

const ENERGY_LABELS: Record<Exclude<DeityEnergyFilter, 'ALL'>, string> = {
  positiva: 'Energia Positiva',
  negativa: 'Energia Negativa',
  qualquer: 'Qualquer Energia',
};

const DivindadesTable: React.FC = () => {
  const theme = useTheme();
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementId[]>(
    ALL_DEITY_SUPPLEMENTS
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DeityCategoryFilter>('ALL');
  const [statusDivino, setStatusDivino] =
    useState<DeityStatusDivinoFilter>('ALL');
  const [energy, setEnergy] = useState<DeityEnergyFilter>('ALL');

  const { params } = useRouteMatch<{ selectedGod?: string }>();
  const history = useHistory();

  const allDivindades = useMemo(
    () => dataRegistry.getDeitiesWithSupplementPowers(selectedSupplements),
    [selectedSupplements]
  );

  const categoryOptions: ClickableFilterOption[] = useMemo(() => {
    const majorCount = allDivindades.filter((d) => !isMinorDeity(d)).length;
    const minorCount = allDivindades.filter((d) => isMinorDeity(d)).length;
    const opts: ClickableFilterOption[] = [
      { value: 'MAIOR', label: 'Deuses Maiores', count: majorCount },
    ];
    if (minorCount > 0) {
      opts.push({ value: 'MENOR', label: 'Deuses Menores', count: minorCount });
    }
    return opts;
  }, [allDivindades]);

  const statusOptions: ClickableFilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    allDivindades.forEach((d) => {
      if (d.statusDivino !== undefined) {
        const key = String(d.statusDivino);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });
    return ['1', '2', '3', '4', '5']
      .filter((s) => (counts.get(s) || 0) > 0)
      .map((s) => ({
        value: s,
        label: `Status Divino ${s}`,
        count: counts.get(s) || 0,
      }));
  }, [allDivindades]);

  const energyOptions: ClickableFilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    allDivindades.forEach((d) => {
      if (d.energy) {
        counts.set(d.energy, (counts.get(d.energy) || 0) + 1);
      }
    });
    return (['positiva', 'negativa', 'qualquer'] as const)
      .filter((e) => (counts.get(e) || 0) > 0)
      .map((e) => ({
        value: e,
        label: ENERGY_LABELS[e],
        count: counts.get(e) || 0,
      }));
  }, [allDivindades]);

  const filteredDivindades = useMemo(
    () =>
      filterDeities(allDivindades, {
        search,
        category,
        statusDivino,
        energy,
      }),
    [allDivindades, search, category, statusDivino, energy]
  );

  useEffect(() => {
    const { selectedGod } = params;
    if (selectedGod) {
      setSearch(decodeURIComponent(selectedGod));
      setCategory('ALL');
      setStatusDivino('ALL');
    }
  }, [params]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    if (params.selectedGod) {
      history.push('/database/divindades');
    }
  };

  const onVoiceSearch = (newValue: string) => {
    setSearch(newValue);
    if (params.selectedGod) {
      history.push('/database/divindades');
    }
  };

  const handleCategoryToggle = (val: string) => {
    const next = category === val ? 'ALL' : (val as DeityCategoryFilter);
    setCategory(next);
    if (next === 'MAIOR') {
      setStatusDivino('ALL');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setStatusDivino('ALL');
    setEnergy('ALL');
    if (params.selectedGod) {
      history.push('/database/divindades');
    }
  };

  const normalizedSelected = params.selectedGod
    ? normalizeSearch(decodeURIComponent(params.selectedGod))
    : '';

  const selectedDivindadeData =
    filteredDivindades.length === 1 && params.selectedGod
      ? filteredDivindades[0]
      : null;
  const deitiesSEO = getPageSEO('deities');

  const renderDeityCard = (divindade: Divindade) => {
    const minor = isMinorDeity(divindade);
    const actions = (
      <>
        <AddToGrimoireButton
          itemId={encyclopediaIds.deity(divindade.name)}
          itemName={divindade.name}
        />
        <CopyUrlButton
          itemName={divindade.name}
          itemType='divindade'
          size='small'
          variant='minimal'
        />
      </>
    );

    const badges = (
      <>
        <Chip
          label={minor ? 'Deus Menor' : 'Deus Maior'}
          size='small'
          color={minor ? 'secondary' : 'primary'}
          variant='filled'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        {divindade.statusDivino !== undefined && (
          <Chip
            label={`Status Divino ${divindade.statusDivino}`}
            size='small'
            variant='outlined'
            color='primary'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
          />
        )}
        {divindade.energy && (
          <Chip
            label={ENERGY_LABELS[divindade.energy]}
            size='small'
            variant='outlined'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
          />
        )}
        {divindade.preferredWeapon && (
          <Chip
            label={`Arma: ${divindade.preferredWeapon}`}
            size='small'
            variant='outlined'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
          />
        )}
      </>
    );

    return (
      <DatabaseCard
        key={divindade.name}
        title={divindade.name}
        icon={<FilterDramaIcon fontSize='small' />}
        badges={badges}
        actions={actions}
        highlighted={
          Boolean(normalizedSelected) &&
          normalizeSearch(divindade.name) === normalizedSelected
        }
      >
        {(divindade.beliefs || divindade.obligations || divindade.holySymbol) && (
          <Box sx={{ mb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {divindade.beliefs && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                <strong>Crenças:</strong> {divindade.beliefs}
              </Typography>
            )}
            {divindade.holySymbol && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                <strong>Símbolo Sagrado:</strong> {divindade.holySymbol}
              </Typography>
            )}
            {divindade.obligations && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                <strong>Obrigações e Restrições:</strong>{' '}
                {divindade.obligations}
              </Typography>
            )}
          </Box>
        )}

        <Typography
          variant='subtitle2'
          sx={{
            fontFamily: 'Tfont, serif',
            fontWeight: 700,
            color: 'text.secondary',
            mb: 1,
          }}
        >
          Poderes Concedidos ({divindade.poderes.length})
        </Typography>

        <Stack spacing={1.25} divider={<Divider flexItem />}>
          {divindade.poderes.map((power) => (
            <Box key={`${divindade.name}-${power.name}`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography
                  variant='subtitle2'
                  color='primary'
                  component={Link}
                  to={`/database/poderes/${encodeURIComponent(power.name)}`}
                  sx={{
                    fontFamily: 'Tfont, serif',
                    fontWeight: 700,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {power.name}
                </Typography>
                <AddToGrimoireButton
                  itemId={encyclopediaIds.deityPower(
                    divindade.name,
                    power.name
                  )}
                  itemName={power.name}
                />
              </Box>
              <Typography
                variant='body2'
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}
              >
                {power.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DatabaseCard>
    );
  };

  return (
    <>
      <SEO
        title={
          selectedDivindadeData
            ? `${selectedDivindadeData.name} - Divindade de Tormenta 20`
            : deitiesSEO.title
        }
        description={
          selectedDivindadeData
            ? `Informações, poderes concedidos e devotos de ${selectedDivindadeData.name} em Tormenta 20.`
            : deitiesSEO.description
        }
        url={`/database/divindades${
          selectedDivindadeData && params.selectedGod
            ? `/${params.selectedGod}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Divindades de Arton
        </TormentaTitle>

        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_DEITY_SUPPLEMENTS}
          onToggleSupplement={handleToggleSupplement}
        />

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 540 }}>
            <SearchInput
              value={search}
              handleChange={handleChange}
              onVoiceSearch={onVoiceSearch}
            />
          </Box>
        </Box>

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
          <Stack spacing={1.75}>
            <ClickableChipFilterGroup
              label='Categoria do Panteão:'
              allLabel={`Todas (${allDivindades.length})`}
              options={categoryOptions}
              selected={category === 'ALL' ? [] : [category]}
              onToggle={handleCategoryToggle}
              onClear={() => setCategory('ALL')}
            />

            {category !== 'MAIOR' && statusOptions.length > 0 && (
              <ClickableChipFilterGroup
                label='Status Divino (Deuses Menores):'
                allLabel='Todos os Status'
                options={statusOptions}
                selected={statusDivino === 'ALL' ? [] : [statusDivino]}
                onToggle={(val) => {
                  const next =
                    statusDivino === val
                      ? 'ALL'
                      : (val as DeityStatusDivinoFilter);
                  setStatusDivino(next);
                  if (next !== 'ALL') setCategory('MENOR');
                }}
                onClear={() => setStatusDivino('ALL')}
              />
            )}

            {energyOptions.length > 0 && (
              <ClickableChipFilterGroup
                label='Canalização / Energia:'
                allLabel='Todas'
                options={energyOptions}
                selected={energy === 'ALL' ? [] : [energy]}
                onToggle={(val) =>
                  setEnergy(
                    energy === val ? 'ALL' : (val as DeityEnergyFilter)
                  )
                }
                onClear={() => setEnergy('ALL')}
              />
            )}
          </Stack>
        </Paper>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {filteredDivindades.length} divindade
            {filteredDivindades.length !== 1 ? 's' : ''} exibida
            {filteredDivindades.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DatabaseGrid
          variant='wide'
          ariaLabel='Grade de divindades'
          resetKey={`${search}|${category}|${statusDivino}|${energy}|${selectedSupplements.join(',')}`}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhuma divindade encontrada com os filtros aplicados.
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={clearFilters}
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                Limpar filtros
              </Button>
            </Paper>
          }
        >
          {filteredDivindades.map(renderDeityCard)}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default DivindadesTable;
