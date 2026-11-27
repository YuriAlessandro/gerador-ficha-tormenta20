import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Paper, Typography, useTheme } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
} from '../../data/systems/tormenta20/magias/arcane';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
} from '../../data/systems/tormenta20/magias/divine';
import { SpellSchool } from '../../interfaces/Spells';
import {
  SupplementId,
  SUPPLEMENT_METADATA,
} from '../../types/supplement.types';
import { TORMENTA20_SYSTEM } from '../../data/systems/tormenta20';
import { normalizeSearch } from '../../functions/stringUtils';
import { encyclopediaIds } from '../../functions/encyclopediaSearch';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from './TormentaTitle';
import SearchInput from '../DatabaseTables/SearchInput';
import SupplementFilter from '../DatabaseTables/SupplementFilter';
import CopyUrlButton from './CopyUrlButton';
import AddToGrimoireButton from '../PocketGrimoire/AddToGrimoireButton';
import DatabaseGrid from './DatabaseGrid';
import DatabaseCard from './DatabaseCard';
import FormattedSpellText from './FormattedSpellText';
import AdvancedSpellFilter from './AdvancedSpellFilter';
import {
  ALVO_TIPO_LABELS,
  DESCRITOR_LABELS,
  EnrichedSpell,
  ExtendedSpell,
  FUNCAO_LABELS,
  SCHOOL_LABELS,
  SpellFilters,
  filterEnrichedSpells,
  getCircleNumber,
  mergeAndEnrichSpells,
} from '../DatabaseTables/spellsFilters';

const ALL_SPELL_SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const INITIAL_FILTERS: SpellFilters = {
  search: '',
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
};

const UnifiedSpellsTable: React.FC = () => {
  const theme = useTheme();
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementId[]>(
    ALL_SPELL_SUPPLEMENTS
  );
  const [filters, setFilters] = useState<SpellFilters>(INITIAL_FILTERS);
  const { params } = useRouteMatch<{ selectedSpell?: string }>();
  const history = useHistory();

  const supplementSpells = useMemo((): ExtendedSpell[] => {
    const spells: ExtendedSpell[] = [];
    selectedSupplements.forEach((supplementId) => {
      const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
      if (supplement?.spells) {
        supplement.spells.arcane?.forEach((spell) => {
          spells.push({ ...spell, spellType: 'arcane', supplementId });
        });
        supplement.spells.divine?.forEach((spell) => {
          spells.push({ ...spell, spellType: 'divine', supplementId });
        });
        supplement.spells.universal?.forEach((spell) => {
          spells.push({ ...spell, spellType: 'arcane', supplementId });
          spells.push({ ...spell, spellType: 'divine', supplementId });
        });
      }
    });
    return spells;
  }, [selectedSupplements]);

  const allSpells: EnrichedSpell[] = useMemo(() => {
    const combinedSpells: ExtendedSpell[] = [];
    if (selectedSupplements.includes(SupplementId.TORMENTA20_CORE)) {
      const arcaneSpells = [
        ...allArcaneSpellsCircle1,
        ...allArcaneSpellsCircle2,
        ...allArcaneSpellsCircle3,
        ...allArcaneSpellsCircle4,
        ...allArcaneSpellsCircle5,
      ].map((spell) => ({ ...spell, spellType: 'arcane' as const }));

      const divineSpells = [
        ...allDivineSpellsCircle1,
        ...allDivineSpellsCircle2,
        ...allDivineSpellsCircle3,
        ...allDivineSpellsCircle4,
        ...allDivineSpellsCircle5,
      ].map((spell) => ({ ...spell, spellType: 'divine' as const }));

      combinedSpells.push(...arcaneSpells, ...divineSpells);
    }
    combinedSpells.push(...supplementSpells);
    return mergeAndEnrichSpells(combinedSpells);
  }, [supplementSpells, selectedSupplements]);

  const availableSchools = useMemo(() => {
    const schools = [...new Set(allSpells.map((s) => s.school))] as SpellSchool[];
    return schools.sort((a, b) =>
      (SCHOOL_LABELS[a] || a).localeCompare(SCHOOL_LABELS[b] || b, 'pt-BR')
    );
  }, [allSpells]);

  const availableExecutionTimes = useMemo(() => {
    const times = [...new Set(allSpells.map((s) => s.execucaoGroup))];
    return times.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allSpells]);

  const availableFuncoes = useMemo(() => {
    const set = new Set<string>();
    allSpells.forEach((s) => s.funcao.forEach((f) => set.add(f)));
    return Array.from(set).sort((a, b) =>
      (FUNCAO_LABELS[a] || a).localeCompare(FUNCAO_LABELS[b] || b, 'pt-BR')
    );
  }, [allSpells]);

  const availableDescritores = useMemo(() => {
    const set = new Set<string>();
    allSpells.forEach((s) => {
      s.descritores.forEach((d) => set.add(d));
      s.tiposDano.forEach((t) => set.add(t));
    });
    return Array.from(set).sort((a, b) =>
      (DESCRITOR_LABELS[a] || a).localeCompare(
        DESCRITOR_LABELS[b] || b,
        'pt-BR'
      )
    );
  }, [allSpells]);

  const availableAlvoTipos = useMemo(() => {
    const set = new Set<string>();
    allSpells.forEach((s) => s.alvoTipo.forEach((a) => set.add(a)));
    return Array.from(set).sort((a, b) =>
      (ALVO_TIPO_LABELS[a] || a).localeCompare(
        ALVO_TIPO_LABELS[b] || b,
        'pt-BR'
      )
    );
  }, [allSpells]);

  const availableResistencias = useMemo(() => {
    const order = [
      'Sem resistência',
      'Fortitude',
      'Reflexos',
      'Vontade',
      'Veja texto',
    ];
    const present = new Set(allSpells.map((s) => s.resistenciaGroup));
    return order.filter((o) => present.has(o));
  }, [allSpells]);

  const availableAlcances = useMemo(() => {
    const order = [
      'Pessoal',
      'Toque',
      'Curto',
      'Médio',
      'Longo',
      'Ilimitado',
      'Outro',
    ];
    const present = new Set(allSpells.map((s) => s.alcanceGroup));
    return order.filter((o) => present.has(o));
  }, [allSpells]);

  const availableDeities = useMemo(() => {
    const set = new Set<string>();
    allSpells.forEach((s) => s.deities.forEach((d) => set.add(d)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allSpells]);

  const filteredSpells = useMemo(
    () => filterEnrichedSpells(allSpells, filters),
    [allSpells, filters]
  );

  useEffect(() => {
    const { selectedSpell } = params;
    if (selectedSpell) {
      const decoded = decodeURIComponent(selectedSpell);
      const exact = allSpells.find(
        (s) => s.nome.toLowerCase() === decoded.toLowerCase()
      );
      setFilters((prev) => ({
        ...prev,
        search: exact ? exact.nome : decoded,
      }));
    }
  }, [params, allSpells]);

  const handleFilterChange = (newFilters: Partial<SpellFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
    if (params.selectedSpell) {
      history.push('/database/magias');
    }
  };

  const onVoiceSearch = (newValue: string) => {
    setFilters((prev) => ({ ...prev, search: newValue }));
    if (params.selectedSpell) {
      history.push('/database/magias');
    }
  };

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

  const normalizedSelected = params.selectedSpell
    ? normalizeSearch(decodeURIComponent(params.selectedSpell))
    : '';

  const selectedSpellData =
    filteredSpells.length === 1 && params.selectedSpell
      ? filteredSpells[0]
      : null;
  const spellsSEO = getPageSEO('spells');

  const renderSpellCard = (spell: EnrichedSpell) => {
    const circleNum = getCircleNumber(spell.spellCircle);
    const schoolFull = SCHOOL_LABELS[spell.school] || spell.school;

    const actions = (
      <>
        <AddToGrimoireButton
          itemId={encyclopediaIds.spell(spell.nome)}
          itemName={spell.nome}
        />
        <CopyUrlButton
          itemName={spell.nome}
          itemType='magia'
          size='small'
          variant='minimal'
        />
      </>
    );

    const traditionIcon =
      spell.traditionLabel === 'Universal' ? (
        <AllInclusiveIcon fontSize='small' />
      ) : spell.traditionLabel === 'Arcana' ? (
        <AutoFixHighIcon fontSize='small' />
      ) : (
        <FilterDramaIcon fontSize='small' />
      );

    const badges = (
      <>
        <Chip
          label={`${circleNum}º Círculo`}
          size='small'
          color='primary'
          variant='filled'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        <Chip
          label={schoolFull}
          size='small'
          variant='outlined'
          color='primary'
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        <Chip
          label={spell.traditionLabel}
          size='small'
          variant='outlined'
          color={
            spell.traditionLabel === 'Universal'
              ? 'warning'
              : spell.traditionLabel === 'Arcana'
              ? 'info'
              : 'secondary'
          }
          sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
        />
        {spell.supplementId &&
          spell.supplementId !== SupplementId.TORMENTA20_CORE && (
            <Chip
              label={
                SUPPLEMENT_METADATA[spell.supplementId]?.name ||
                spell.supplementId
              }
              size='small'
              variant='outlined'
              color='secondary'
              sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
            />
          )}
        {spell.funcao.map((f) => (
          <Chip
            key={`${spell.nome}-fn-${f}`}
            label={FUNCAO_LABELS[f] || f}
            size='small'
            variant='outlined'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.68rem' }}
          />
        ))}
        {spell.deities.map((d) => (
          <Chip
            key={`${spell.nome}-deity-${d}`}
            label={`Devoção: ${d}`}
            size='small'
            variant='outlined'
            color='warning'
            sx={{ fontFamily: 'Tfont, serif', fontSize: '0.68rem' }}
          />
        ))}
      </>
    );

    const footer =
      spell.aprimoramentos && spell.aprimoramentos.length > 0 ? (
        <Box>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 0.75,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            Aprimoramentos
          </Typography>
          <Box
            component='ul'
            sx={{
              pl: 2.25,
              m: 0,
              '& li': { mb: 0.6, fontSize: '0.84rem', lineHeight: 1.5 },
              '& li:last-child': { mb: 0 },
            }}
          >
            {spell.aprimoramentos.map((apr, idx) => (
              <li
                key={`${spell.nome}-apr-${idx}-${apr.addPm}-${apr.text.slice(
                  0,
                  24
                )}`}
              >
                <Typography component='span' variant='body2'>
                  <strong style={{ color: theme.palette.primary.main }}>
                    {apr.trick ? 'TRUQUE' : `+${apr.addPm} PM`}:
                  </strong>{' '}
                  {apr.text}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      ) : undefined;

    return (
      <DatabaseCard
        key={`${spell.nome}-${spell.spellCircle}-${spell.spellTypes.join('-')}`}
        title={spell.nome}
        icon={traditionIcon}
        badges={badges}
        actions={actions}
        footer={footer}
        highlighted={
          Boolean(normalizedSelected) &&
          normalizeSearch(spell.nome) === normalizedSelected
        }
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.025)',
            fontSize: '0.8rem',
          }}
        >
          <Typography variant='caption'>
            <strong>Execução:</strong> {spell.execucao}
          </Typography>
          <Typography variant='caption'>•</Typography>
          <Typography variant='caption'>
            <strong>Alcance:</strong> {spell.alcance}
          </Typography>
          {spell.alvo && (
            <>
              <Typography variant='caption'>•</Typography>
              <Typography variant='caption'>
                <strong>Alvo:</strong> {spell.alvo}
              </Typography>
            </>
          )}
          {spell.area && (
            <>
              <Typography variant='caption'>•</Typography>
              <Typography variant='caption'>
                <strong>Área:</strong> {spell.area}
              </Typography>
            </>
          )}
          <Typography variant='caption'>•</Typography>
          <Typography variant='caption'>
            <strong>Duração:</strong> {spell.duracao}
          </Typography>
          {spell.resistencia && (
            <>
              <Typography variant='caption'>•</Typography>
              <Typography variant='caption'>
                <strong>Resistência:</strong> {spell.resistencia}
              </Typography>
            </>
          )}
        </Box>

        <FormattedSpellText
          description={spell.description}
          formattedDescription={spell.formattedDescription}
        />
      </DatabaseCard>
    );
  };

  return (
    <>
      <SEO
        title={
          selectedSpellData
            ? `${selectedSpellData.nome} - Magia de Tormenta 20`
            : spellsSEO.title
        }
        description={
          selectedSpellData
            ? `${selectedSpellData.school}, ${getCircleNumber(
                selectedSpellData.spellCircle
              )}º círculo. Execução: ${selectedSpellData.execucao}, Alcance: ${
                selectedSpellData.alcance
              }.`
            : spellsSEO.description
        }
        url={`/database/magias${
          selectedSpellData && params.selectedSpell
            ? `/${params.selectedSpell}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Magias
        </TormentaTitle>

        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={ALL_SPELL_SUPPLEMENTS}
          onToggleSupplement={handleToggleSupplement}
        />

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 540 }}>
            <SearchInput
              value={filters.search}
              handleChange={handleSearchChange}
              onVoiceSearch={onVoiceSearch}
            />
          </Box>
        </Box>

        <AdvancedSpellFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          availableSchools={availableSchools}
          availableExecutionTimes={availableExecutionTimes}
          availableFuncoes={availableFuncoes}
          availableDescritores={availableDescritores}
          availableAlvoTipos={availableAlvoTipos}
          availableResistencias={availableResistencias}
          availableAlcances={availableAlcances}
          availableDeities={availableDeities}
        />

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            {filteredSpells.length} magia
            {filteredSpells.length !== 1 ? 's' : ''} exibida
            {filteredSpells.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <DatabaseGrid
          ariaLabel='Grade de magias'
          resetKey={`${JSON.stringify(filters)}|${selectedSupplements.join(',')}`}
          emptyState={
            <Paper
              variant='outlined'
              sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
            >
              <Typography variant='body1' sx={{ color: 'text.secondary', mb: 2 }}>
                Nenhuma magia encontrada com os filtros aplicados.
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setFilters(INITIAL_FILTERS)}
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                Limpar filtros
              </Button>
            </Paper>
          }
        >
          {filteredSpells.map(renderSpellCard)}
        </DatabaseGrid>
      </Box>
    </>
  );
};

export default UnifiedSpellsTable;
