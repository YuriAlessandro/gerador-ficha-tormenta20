/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Typography,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import { useHistory, useRouteMatch } from 'react-router-dom';

import SearchInput from './SearchInput';
import { SEO, getPageSEO } from '../SEO';
import SupplementFilter from './SupplementFilter';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, OriginWithSupplement } from '../../data/registry';
import { ORIGIN_POWER_TYPE } from '../../data/systems/tormenta20/powers/originPowers';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';

const Row: React.FC<{ origin: OriginWithSupplement; defaultOpen: boolean }> = ({
  origin,
  defaultOpen,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
          <Box display='flex' alignItems='center' gap={1}>
            <BrowseGalleryIcon color='primary' fontSize='small' />
            <Typography variant='body1' fontWeight={500}>
              {origin.name}
            </Typography>
            {origin.supplementId !== SupplementId.TORMENTA20_CORE && (
              <Chip
                label={origin.supplementName}
                size='small'
                sx={{
                  height: '20px',
                  fontSize: '0.7rem',
                  backgroundColor: 'secondary.main',
                  color: 'secondary.contrastText',
                }}
              />
            )}
            <CopyUrlButton
              itemName={origin.name}
              itemType='origem'
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
            <Box
              sx={{
                margin: 1,
                p: 2,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
              }}
            >
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
                  {origin.name}
                </Typography>
                <Chip
                  label={origin.supplementName}
                  size='small'
                  variant='outlined'
                  color={
                    origin.supplementId === SupplementId.TORMENTA20_CORE
                      ? 'default'
                      : 'secondary'
                  }
                  sx={{ fontFamily: 'Tfont, serif' }}
                />
              </Box>

              {/* Items */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                >
                  Itens Iniciais
                </Typography>
                <Typography variant='body2'>
                  {origin
                    .getItems()
                    .map((item) => item.description || item.equipment)
                    .join('; ')}
                </Typography>
              </Box>

              {/* Benefits */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                >
                  Benefícios
                </Typography>
                {origin.name !== 'Amnésico' ? (
                  <>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      <strong>Perícias:</strong> {origin.pericias.join(', ')}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Poderes:</strong>{' '}
                      {origin.poderes.map((power) => power.name).join(', ')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant='body2'>
                    Uma perícia e um poder escolhidos pelo mestre e o poder
                    Lembranças Graduais
                  </Typography>
                )}
              </Box>

              {origin.poderes.some(
                (power) => power.type === ORIGIN_POWER_TYPE
              ) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ fontFamily: 'Tfont, serif', fontSize: '1.2rem' }}
                  >
                    Poderes de Origem
                  </Typography>
                  {origin.poderes.map((power) => {
                    if (power.type === ORIGIN_POWER_TYPE) {
                      return (
                        <Box key={power.name} sx={{ mb: 2 }}>
                          <Typography
                            variant='h6'
                            color='primary'
                            sx={{
                              fontFamily: 'Tfont, serif',
                              fontSize: '1rem',
                              mb: 1,
                            }}
                          >
                            {power.name}
                          </Typography>
                          <Typography variant='body1' paragraph>
                            {power.description}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })}
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OriginsTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [selectedSupplements, setSelectedSupplements] = useState<
    SupplementId[]
  >([
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_ATLAS_ARTON,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ]);
  const { params } = useRouteMatch<{ selectedOrigin?: string }>();
  const history = useHistory();

  // Derive filtered origins using useMemo - this ensures data is always in sync with state
  const origins = useMemo(() => {
    const allOrigins =
      dataRegistry.getOriginsBySupplements(selectedSupplements);
    const search = value.toLocaleLowerCase();

    if (search.length > 0) {
      return allOrigins.filter((origin) =>
        origin.name.toLowerCase().includes(search)
      );
    }
    return allOrigins;
  }, [selectedSupplements, value]);

  const handleToggleSupplement = (supplementId: SupplementId) => {
    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
        // Don't allow deselecting all supplements
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== supplementId);
      }
      // Keep CORE at the top when adding
      if (supplementId === SupplementId.TORMENTA20_CORE) {
        return [supplementId, ...prev];
      }
      return [...prev, supplementId];
    });
  };

  // Handle URL params for deep linking
  useEffect(() => {
    const { selectedOrigin } = params;
    if (selectedOrigin && selectedOrigin !== value) {
      setValue(selectedOrigin);
    }
  }, [params]);

  // Handle URL navigation when filtering results in single match
  useEffect(() => {
    if (origins.length > 1 && value) {
      history.push('/database/origens');
    }
  }, [origins.length, value, history]);

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // Get selected origin for SEO
  const selectedOriginData =
    origins.length === 1 && params.selectedOrigin ? origins[0] : null;
  const originsSEO = getPageSEO('origins');

  return (
    <>
      <SEO
        title={
          selectedOriginData
            ? `${selectedOriginData.name} - Origem de Tormenta 20`
            : originsSEO.title
        }
        description={
          selectedOriginData
            ? `Poderes, perícias e benefícios da origem ${selectedOriginData.name} em Tormenta 20.`
            : originsSEO.description
        }
        url={`/database/origens${
          selectedOriginData ? `/${params.selectedOrigin}` : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Origens de Personagem
        </TormentaTitle>

        {/* Supplement Filter */}
        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={[
            SupplementId.TORMENTA20_CORE,
            SupplementId.TORMENTA20_ATLAS_ARTON,
            SupplementId.TORMENTA20_HEROIS_ARTON,
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
            {origins.length === 0
              ? 'Nenhuma origem encontrada com os filtros aplicados'
              : `${origins.length} origem${
                  origins.length !== 1 ? 's' : ''
                } encontrada${origins.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Origins Table */}
        <TableContainer component={Paper} className='table-container'>
          <Table aria-label='origins table'>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography
                    variant='h6'
                    sx={{
                      fontFamily: 'Tfont, serif',
                      color: theme.palette.primary.main,
                    }}
                  >
                    Nome da Origem
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {origins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                    <Typography variant='body1' color='text.secondary'>
                      Nenhuma origem encontrada. Tente ajustar a busca.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                origins.map((origin) => (
                  <Row
                    key={origin.name}
                    origin={origin}
                    defaultOpen={origins.length === 1}
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

export default OriginsTable;
