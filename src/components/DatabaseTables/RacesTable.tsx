/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
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
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GroupIcon from '@mui/icons-material/Group';

import { useHistory, useRouteMatch } from 'react-router-dom';
import Race from '../../interfaces/Race';
import SearchInput from './SearchInput';
import { SEO, getPageSEO } from '../SEO';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';
import SupplementFilter from './SupplementFilter';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, RaceWithSupplement } from '../../data/registry';

interface ProcessedAttribute {
  label: string;
  type: 'specific' | 'any' | 'special';
}

const processRaceAttributes = (race: Race): ProcessedAttribute[] => {
  if (race.name === 'Humano') {
    return [{ label: '+2 em três atributos à sua escolha', type: 'special' }];
  }

  const specificAttrs = race.attributes.attrs.filter(
    (attr) => attr.attr !== 'any'
  );
  const anyAttrs = race.attributes.attrs.filter((attr) => attr.attr === 'any');

  const result: ProcessedAttribute[] = [];

  // Add specific attributes
  specificAttrs.forEach((attr) => {
    result.push({
      label: `${attr.attr} ${attr.mod > 0 ? '+' : ''}${attr.mod}`,
      type: 'specific',
    });
  });

  // Group "any" attributes by modifier value
  const anyGroups: { [mod: number]: number } = {};
  anyAttrs.forEach((attr) => {
    anyGroups[attr.mod] = (anyGroups[attr.mod] || 0) + 1;
  });

  // Add "any" attribute groups
  Object.entries(anyGroups).forEach(([mod, count]) => {
    const modValue = parseInt(mod, 10);
    const sign = modValue > 0 ? '+' : '';
    const plural = count > 1;
    result.push({
      label: `${sign}${modValue} em ${count} atributo${plural ? 's' : ''} ${
        plural ? 'diferentes' : ''
      } à sua escolha`,
      type: 'any',
    });
  });

  return result;
};

const Row: React.FC<{ race: RaceWithSupplement; defaultOpen: boolean }> = ({
  race,
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
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Box display='flex' alignItems='center' gap={1}>
              <GroupIcon color='primary' fontSize='small' />
              <Typography variant='body1' fontWeight={500}>
                {race.name}
              </Typography>
            </Box>
            <CopyUrlButton
              itemName={race.name}
              itemType='raça'
              size='small'
              variant='minimal'
            />
          </Box>
        </TableCell>
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1, p: 2, borderLeft: '3px solid #d13235' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant='h6'
                  color='primary'
                  sx={{ fontFamily: 'Tfont, serif' }}
                >
                  {race.name}
                </Typography>
                <Chip
                  label={race.supplementName}
                  size='small'
                  variant='outlined'
                  color={
                    race.supplementId === SupplementId.TORMENTA20_CORE
                      ? 'default'
                      : 'secondary'
                  }
                  sx={{ fontFamily: 'Tfont, serif' }}
                />
              </Box>

              {/* Attribute Bonuses */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                >
                  Modificadores de Atributos
                </Typography>
                <Box display='flex' gap={1} flexWrap='wrap'>
                  {processRaceAttributes(race).map((attrInfo, _idx) => (
                    <Chip
                      key={`${race.name}-attr-${attrInfo.label.replace(
                        /[^a-zA-Z0-9]/g,
                        '-'
                      )}`}
                      label={attrInfo.label}
                      variant='outlined'
                      color={attrInfo.type === 'any' ? 'secondary' : 'primary'}
                      sx={{ fontFamily: 'Tfont, serif' }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Race Abilities */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
              >
                Habilidades Raciais
              </Typography>
              {race.abilities.map((ability) => (
                <Box key={ability.name} sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    color='primary'
                    sx={{
                      fontFamily: 'Tfont, serif',
                      fontSize: '1rem',
                      mb: 1,
                    }}
                  >
                    {ability.name}
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {ability.description}
                  </Typography>
                  {ability.name !==
                    race.abilities[race.abilities.length - 1]?.name && (
                    <Divider sx={{ my: 1.5 }} />
                  )}
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const RacesTable: React.FC = () => {
  const [value, setValue] = useState('');
  const [selectedSupplements, setSelectedSupplements] = useState<
    SupplementId[]
  >([SupplementId.TORMENTA20_CORE, SupplementId.TORMENTA20_AMEACAS_ARTON]);
  const [races, setRaces] = useState<RaceWithSupplement[]>([]);
  const { params } = useRouteMatch<{ selectedRace?: string }>();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    const allRaces =
      dataRegistry.getRacesWithSupplementInfo(selectedSupplements);

    if (search.length > 0) {
      const filteredRaces = allRaces.filter((race) => {
        if (race.name.toLowerCase().includes(search)) {
          return true;
        }
        const abltNames = race.abilities.map((ablt) => ablt.name);

        if (abltNames.find((name) => name.toLowerCase().includes(search)))
          return true;

        return false;
      });

      if (filteredRaces.length > 1) history.push('/database/raças');

      setRaces(filteredRaces);
    } else {
      setRaces(allRaces);
    }
  };

  const handleToggleSupplement = (supplementId: SupplementId) => {
    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        // Don't allow deselecting all supplements
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== supplementId);
      }
      return [...prev, supplementId];
    });
  };

  useEffect(() => {
    const { selectedRace } = params;
    if (selectedRace) {
      setValue(selectedRace);
      filter(selectedRace);
    } else {
      filter(''); // Load all races on mount
    }
  }, [params, selectedSupplements]);

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
    filter(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    filter(event.target.value);
  };

  // Get selected race for SEO
  const selectedRaceData =
    races.length === 1 && params.selectedRace ? races[0] : null;
  const racesSEO = getPageSEO('races');

  return (
    <>
      <SEO
        title={
          selectedRaceData
            ? `${selectedRaceData.name} - Raça de Tormenta 20`
            : racesSEO.title
        }
        description={
          selectedRaceData
            ? `Atributos, habilidades e modificadores da raça ${selectedRaceData.name} em Tormenta 20.`
            : racesSEO.description
        }
        url={`/database/raças${
          selectedRaceData ? `/${params.selectedRace}` : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Raças e Habilidades Raciais
        </TormentaTitle>

        {/* Supplement Filter */}
        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={[
            SupplementId.TORMENTA20_CORE,
            SupplementId.TORMENTA20_AMEACAS_ARTON,
          ]}
          onToggleSupplement={handleToggleSupplement}
        />

        {/* Search Input */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <SearchInput
              value={value}
              handleChange={handleChange}
              onVoiceSearch={onVoiceSearch}
            />
          </Box>
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            {races.length === 0
              ? 'Nenhuma raça encontrada com os filtros aplicados'
              : `${races.length} raça${
                  races.length !== 1 ? 's' : ''
                } encontrada${races.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Races Table */}
        <TableContainer component={Paper} className='table-container'>
          <Table aria-label='races table'>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography
                    variant='h6'
                    sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                  >
                    Nome da Raça
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {races.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                    <Typography variant='body1' color='text.secondary'>
                      Nenhuma raça encontrada. Tente ajustar a busca.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                races.map((race) => (
                  <Row
                    key={race.name}
                    race={race}
                    defaultOpen={races.length === 1}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default RacesTable;
