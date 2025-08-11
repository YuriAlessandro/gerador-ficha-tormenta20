import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import { useHistory, useRouteMatch } from 'react-router-dom';

import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
} from '../../data/magias/arcane';

import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
} from '../../data/magias/divine';

import { Spell, spellsCircles } from '../../interfaces/Spells';
import AdvancedSpellFilter from './AdvancedSpellFilter';
import TormentaTitle from './TormentaTitle';
import SearchInput from '../DatabaseTables/SearchInput';
import CopyUrlButton from './CopyUrlButton';

interface ExtendedSpell extends Spell {
  spellType: 'arcane' | 'divine';
}

interface MergedSpell extends Spell {
  spellTypes: ('arcane' | 'divine')[];
}

// Helper function to convert circle number to spellsCircles enum
const getSpellCircleEnum = (circleNumber: number): spellsCircles => {
  switch (circleNumber) {
    case 1:
      return spellsCircles.c1;
    case 2:
      return spellsCircles.c2;
    case 3:
      return spellsCircles.c3;
    case 4:
      return spellsCircles.c4;
    case 5:
      return spellsCircles.c5;
    default:
      return spellsCircles.c1;
  }
};

// Helper function to extract circle number from spellsCircles enum
const getCircleNumber = (spellCircle: spellsCircles): number => {
  switch (spellCircle) {
    case spellsCircles.c1:
      return 1;
    case spellsCircles.c2:
      return 2;
    case spellsCircles.c3:
      return 3;
    case spellsCircles.c4:
      return 4;
    case spellsCircles.c5:
      return 5;
    default:
      return 1;
  }
};

interface SpellFilters {
  search: string;
  circle: number | 'all';
  school: string | 'all';
  executionTime: string | 'all';
  spellType: 'arcane' | 'divine' | 'all';
}

// Function to merge duplicate spells
const mergeSpells = (spells: ExtendedSpell[]): MergedSpell[] => {
  const spellMap: { [key: string]: MergedSpell } = {};

  spells.forEach((spell) => {
    const key = `${spell.nome}-${spell.spellCircle}`;

    if (spellMap[key]) {
      // Add the spell type if it's not already there
      if (!spellMap[key].spellTypes.includes(spell.spellType)) {
        spellMap[key].spellTypes.push(spell.spellType);
      }
    } else {
      // Create new merged spell entry
      spellMap[key] = {
        ...spell,
        spellTypes: [spell.spellType],
      };
    }
  });

  return Object.values(spellMap).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  );
};

const Row: React.FC<{ spell: MergedSpell; defaultOpen: boolean }> = ({
  spell,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:hover': {
            backgroundColor: 'rgba(209, 50, 53, 0.02)',
          },
        }}
      >
        <TableCell width={10}>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
            <Typography
              variant='body1'
              fontWeight={500}
              sx={{ minWidth: 'fit-content' }}
            >
              {spell.nome}
            </Typography>
            {spell.spellTypes.map((type) => (
              <Chip
                key={type}
                icon={
                  type === 'arcane' ? <AutoFixHighIcon /> : <FilterDramaIcon />
                }
                label={type === 'arcane' ? 'Arcana' : 'Divina'}
                size='small'
                color={type === 'arcane' ? 'primary' : 'secondary'}
                variant='outlined'
                sx={{
                  fontSize: '0.75rem',
                  height: '24px',
                  fontFamily: 'Tfont, serif',
                }}
              />
            ))}
            <CopyUrlButton
              itemName={spell.nome}
              itemType='magia'
              size='small'
              variant='integrated'
            />
          </Box>
        </TableCell>
        <TableCell>{getCircleNumber(spell.spellCircle)}º</TableCell>
        <TableCell>{spell.school}</TableCell>
        <TableCell>{spell.execucao}</TableCell>
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1, p: 2, borderLeft: '3px solid #d13235' }}>
              <Typography
                variant='h6'
                color='primary'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                {spell.nome} - {spell.school}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' component='div'>
                  <Box component='ul' sx={{ pl: 2, m: 0 }}>
                    <li>
                      <strong>Execução:</strong> {spell.execucao}
                    </li>
                    <li>
                      <strong>Alcance:</strong> {spell.alcance}
                    </li>
                    <li>
                      <strong>Alvo:</strong> {spell.alvo || '-'}
                    </li>
                    <li>
                      <strong>Área:</strong> {spell.area || '-'}
                    </li>
                    <li>
                      <strong>Duração:</strong> {spell.duracao}
                    </li>
                    <li>
                      <strong>Resistência:</strong> {spell.resistencia}
                    </li>
                  </Box>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant='body1' paragraph>
                {spell.description}
              </Typography>

              {spell.aprimoramentos && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant='h6'
                    color='primary'
                    gutterBottom
                    sx={{ fontFamily: 'Tfont, serif' }}
                  >
                    Aprimoramentos
                  </Typography>
                  <Box component='ul' sx={{ pl: 2 }}>
                    {spell.aprimoramentos.map((apr) => (
                      <li
                        key={`${spell.nome}-${apr.addPm}-${apr.text.slice(
                          0,
                          30
                        )}`}
                      >
                        <strong>
                          {apr.addPm === 0 ? 'TRUQUE' : `+${apr.addPm} PM`}:
                        </strong>{' '}
                        {apr.text}
                      </li>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const UnifiedSpellsTable: React.FC = () => {
  // Combine and merge all spells with type indicators
  const allSpells: MergedSpell[] = useMemo(() => {
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

    const combinedSpells = [...arcaneSpells, ...divineSpells];
    return mergeSpells(combinedSpells);
  }, []);

  const [filters, setFilters] = useState<SpellFilters>({
    search: '',
    circle: 'all',
    school: 'all',
    executionTime: 'all',
    spellType: 'all',
  });

  const [filteredSpells, setFilteredSpells] =
    useState<MergedSpell[]>(allSpells);
  const { params } = useRouteMatch();
  const history = useHistory();

  // Filter spells based on all criteria
  useEffect(() => {
    let filtered = allSpells;

    // Search filter (searches in name, description, and enhancements)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (spell) =>
          spell.nome.toLowerCase().includes(searchTerm) ||
          spell.description.toLowerCase().includes(searchTerm) ||
          spell.school.toLowerCase().includes(searchTerm) ||
          (spell.aprimoramentos &&
            spell.aprimoramentos.some((apr) =>
              apr.text.toLowerCase().includes(searchTerm)
            ))
      );
    }

    // Circle filter
    if (filters.circle !== 'all') {
      const targetCircle = getSpellCircleEnum(Number(filters.circle));
      filtered = filtered.filter((spell) => spell.spellCircle === targetCircle);
    }

    // School filter
    if (filters.school !== 'all') {
      filtered = filtered.filter((spell) => spell.school === filters.school);
    }

    // Execution time filter
    if (filters.executionTime !== 'all') {
      filtered = filtered.filter(
        (spell) => spell.execucao === filters.executionTime
      );
    }

    // Spell type filter
    if (filters.spellType !== 'all') {
      filtered = filtered.filter((spell) =>
        spell.spellTypes.includes(filters.spellType as 'arcane' | 'divine')
      );
    }

    setFilteredSpells(filtered);

    // Handle URL navigation for single results
    if (filtered.length === 1 && filters.search.trim()) {
      const spellName = filtered[0].nome.toLowerCase();
      history.push(`/database/magias/${spellName}`);
    } else if (filtered.length > 1 && filters.search.trim()) {
      history.push('/database/magias');
    }
  }, [filters, allSpells, history]);

  // Handle URL parameters
  useEffect(() => {
    const { selectedSpell } = params as { selectedSpell?: string };
    if (selectedSpell) {
      // Decode URL and handle case sensitivity
      const decodedSpellName = decodeURIComponent(selectedSpell).toLowerCase();

      // Try to find exact match first
      const exactMatch = allSpells.find(
        (spell) => spell.nome.toLowerCase() === decodedSpellName
      );

      const newSearchValue = exactMatch ? exactMatch.nome : selectedSpell;

      // Only update if the search value is different
      setFilters((prev) => {
        if (prev.search !== newSearchValue) {
          return { ...prev, search: newSearchValue };
        }
        return prev;
      });
    } else {
      // Clear search when no spell is selected
      setFilters((prev) => {
        if (prev.search !== '') {
          return { ...prev, search: '' };
        }
        return prev;
      });
    }
  }, [params]);

  const handleFilterChange = (newFilters: Partial<SpellFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const onVoiceSearch = (newValue: string) => {
    setFilters((prev) => ({ ...prev, search: newValue }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  // Get unique values for filters
  const availableSchools = useMemo(() => {
    const schools = [...new Set(allSpells.map((spell) => spell.school))];
    return schools.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allSpells]);

  const availableExecutionTimes = useMemo(() => {
    const times = [...new Set(allSpells.map((spell) => spell.execucao))];
    return times.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allSpells]);

  return (
    <Box>
      <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
        Magias
      </TormentaTitle>

      {/* Search Input */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <SearchInput
            value={filters.search}
            handleChange={handleSearchChange}
            onVoiceSearch={onVoiceSearch}
          />
        </Box>
      </Box>

      {/* Advanced Filters */}
      <AdvancedSpellFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        availableSchools={availableSchools}
        availableExecutionTimes={availableExecutionTimes}
      />

      {/* Results Summary */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant='body1' color='text.secondary'>
          {filteredSpells.length === 0
            ? 'Nenhuma magia encontrada com os filtros aplicados'
            : `${filteredSpells.length} magia${
                filteredSpells.length !== 1 ? 's' : ''
              } encontrada${filteredSpells.length !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Spells Table */}
      <TableContainer component={Paper} className='table-container'>
        <Table aria-label='unified spells table'>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <Typography
                  variant='h6'
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                >
                  Nome da Magia
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant='h6'
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                >
                  Círculo
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant='h6'
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                >
                  Escola
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant='h6'
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                >
                  Execução
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSpells.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
                  <Typography variant='body1' color='text.secondary'>
                    Nenhuma magia encontrada. Tente ajustar os filtros.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSpells.map((spell) => (
                <Row
                  key={`${spell.nome}-${spell.spellTypes.join('-')}`}
                  spell={spell}
                  defaultOpen={filteredSpells.length === 1}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UnifiedSpellsTable;
