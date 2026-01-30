/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Tabs,
  Tab,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import { useHistory, useRouteMatch } from 'react-router-dom';
import { Requirement, RequirementType } from '../../interfaces/Poderes';
import { SEO, getPageSEO } from '../SEO';
import SearchInput from './SearchInput';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';
import SupplementFilter from './SupplementFilter';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry, GeneralPowerWithSupplement } from '../../data/registry';

const Req: React.FC<{ requirement: Requirement }> = ({ requirement }) => {
  let reqText = '';

  if (requirement.type === RequirementType.ATRIBUTO) {
    reqText = `${requirement.name} ${requirement.value}`;
  } else if (requirement.type === RequirementType.DEVOTO) {
    reqText = `Devoto de ${requirement.name}`;
  } else if (requirement.type === RequirementType.NIVEL) {
    reqText = `Nível ${requirement.value}`;
  } else if (requirement.type === RequirementType.PERICIA) {
    reqText = `Treinado em ${requirement.name}`;
  } else if (requirement.type === RequirementType.TEXT) {
    reqText = requirement.text || '';
  } else if (requirement.type === RequirementType.PODER_TORMENTA) {
    reqText = `Pelo menos ${requirement.value} ${
      (requirement.value || 0) > 1 ? 'poderes' : 'poder'
    } da Tormenta`;
  } else {
    reqText = requirement.name || '';
  }

  return (
    <Chip
      label={reqText}
      size='small'
      variant='outlined'
      color='secondary'
      sx={{
        m: 0.5,
        fontFamily: 'Tfont, serif',
        fontSize: '0.75rem',
      }}
    />
  );
};

const Row: React.FC<{
  power: GeneralPowerWithSupplement;
  defaultOpen: boolean;
}> = ({ power, defaultOpen }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <>
      <TableRow
        className='table-row'
        sx={{
          '& > *': { borderBottom: 'unset' },
          position: 'relative',
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
        <TableCell component='th' scope='row' sx={{ position: 'relative' }}>
          <Box display='flex' alignItems='center' gap={1}>
            <LocalFireDepartmentIcon color='primary' fontSize='small' />
            <Typography variant='body1' fontWeight={500}>
              {power.name}
            </Typography>
            <Chip
              label={power.type}
              size='small'
              variant='filled'
              color='primary'
              sx={{ ml: 1, fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
            />
            <Chip
              label={power.supplementName}
              size='small'
              variant='outlined'
              color={
                power.supplementId === SupplementId.TORMENTA20_CORE
                  ? 'default'
                  : 'secondary'
              }
              sx={{ fontFamily: 'Tfont, serif', fontSize: '0.7rem' }}
            />
          </Box>
          <CopyUrlButton
            itemName={power.name}
            itemType='poder'
            size='small'
            variant='floating'
          />
        </TableCell>
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1, p: 2, borderLeft: '3px solid #d13235' }}>
              <Typography
                variant='h6'
                color='primary'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                {power.name}
              </Typography>

              <Typography variant='body1' paragraph>
                {power.description}
              </Typography>

              {power.requirements.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                  >
                    Requisitos
                  </Typography>
                  {power.requirements.map((reqGroup, reqIndex) => (
                    <Box
                      key={`${power.name}-reqGroup-${reqGroup
                        .map((r) => r.name || r.text)
                        .join('-')}`}
                      sx={{ mb: 1 }}
                    >
                      {reqGroup.map((req, _reqSubIndex) => (
                        <Req
                          key={`${power.name}-req-${req.name || req.text}-${
                            req.value || 'novalue'
                          }`}
                          requirement={req}
                        />
                      ))}
                      {power.requirements.length > 1 &&
                        reqIndex + 1 < power.requirements.length && (
                          <Typography
                            variant='body2'
                            sx={{ my: 1, fontStyle: 'italic' }}
                          >
                            ou
                          </Typography>
                        )}
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const PowersTable: React.FC = () => {
  const [selectedSupplements, setSelectedSupplements] = useState<
    SupplementId[]
  >([
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_AMEACAS_ARTON,
    SupplementId.TORMENTA20_DEUSES_ARTON,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ]);

  const [value, setValue] = useState('');
  const { params } = useRouteMatch();
  const history = useHistory();

  const combatRef = useRef<null | HTMLDivElement>(null);
  const concedidoRef = useRef<null | HTMLDivElement>(null);
  const destinyRef = useRef<null | HTMLDivElement>(null);
  const magicRef = useRef<null | HTMLDivElement>(null);
  const tormentaRef = useRef<null | HTMLDivElement>(null);
  const racaRef = useRef<null | HTMLDivElement>(null);

  // Derive powers by category using useMemo - always in sync with selectedSupplements
  const allPowersByCategory = useMemo(
    () => dataRegistry.getPowersWithSupplementInfo(selectedSupplements),
    [selectedSupplements]
  );

  // Derive filtered powers using useMemo - always in sync with state
  const powers = useMemo(() => {
    const search = value.toLocaleLowerCase();
    if (search.length > 0) {
      const allPowersList = [
        ...allPowersByCategory.COMBATE,
        ...allPowersByCategory.CONCEDIDOS,
        ...allPowersByCategory.DESTINO,
        ...allPowersByCategory.MAGIA,
        ...allPowersByCategory.TORMENTA,
        ...allPowersByCategory.RACA,
      ];
      return allPowersList.filter((power) =>
        power.name.toLowerCase().includes(search)
      );
    }
    return [];
  }, [allPowersByCategory, value]);

  const handleToggleSupplement = (supplementId: SupplementId) => {
    setSelectedSupplements((prev) => {
      if (prev.includes(supplementId)) {
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
    const { selectedPower } = params as any;
    if (selectedPower && selectedPower !== value) {
      setValue(selectedPower);
    }
  }, [params]);

  // Handle URL navigation when filtering results in multiple matches
  useEffect(() => {
    if (powers.length > 1 && value) {
      history.push('/database/poderes');
    }
  }, [powers.length, value, history]);

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        combatRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 1:
        concedidoRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 2:
        destinyRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 3:
        magicRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 4:
        tormentaRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 5:
        racaRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  const renderPowerSection = (
    title: string,
    powersList: GeneralPowerWithSupplement[],
    ref: React.RefObject<HTMLDivElement>
  ) => (
    <>
      <TableRow>
        <TableCell
          colSpan={3}
          sx={{ py: 2, backgroundColor: 'rgba(209, 50, 53, 0.05)' }}
        >
          <Box ref={ref} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant='h5'
              sx={{ fontFamily: 'Tfont, serif', color: '#d13235', m: 0 }}
            >
              {title}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      {powersList.map((power) => (
        <Row
          key={`${power.name}-${power.type}`}
          power={power}
          defaultOpen={powers.length === 1}
        />
      ))}
    </>
  );

  // Get selected power for SEO
  const selectedPowerData =
    powers.length === 1 && (params as { selectedPower?: string }).selectedPower
      ? powers[0]
      : null;
  const powersSEO = getPageSEO('powers');

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
            ? `Requisitos e efeitos do poder ${selectedPowerData.name} (${selectedPowerData.type}) em Tormenta 20.`
            : powersSEO.description
        }
        url={`/database/poderes${
          selectedPowerData
            ? `/${(params as { selectedPower?: string }).selectedPower}`
            : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Poderes Gerais
        </TormentaTitle>

        {/* Supplement Filter */}
        <SupplementFilter
          selectedSupplements={selectedSupplements}
          availableSupplements={[
            SupplementId.TORMENTA20_CORE,
            SupplementId.TORMENTA20_AMEACAS_ARTON,
            SupplementId.TORMENTA20_DEUSES_ARTON,
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

        {/* Category Tabs */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            onChange={handleTabChange}
            aria-label='power categories'
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              background: 'linear-gradient(135deg, #d13235 0%, #922325 100%)',
              borderRadius: 1,
              '& .MuiTab-root': {
                fontFamily: 'Tfont, serif',
                fontWeight: 600,
                color: 'white',
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#FAFAFA',
              },
            }}
          >
            <Tab label='Combate' />
            <Tab label='Concedidos' />
            <Tab label='Destino' />
            <Tab label='Magia' />
            <Tab label='Tormenta' />
            <Tab label='Raça' />
          </Tabs>
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            {powers.length > 0
              ? `${powers.length} poder${
                  powers.length !== 1 ? 'es' : ''
                } encontrado${powers.length !== 1 ? 's' : ''}`
              : 'Navegue pelas categorias ou use a busca para encontrar poderes específicos'}
          </Typography>
        </Box>

        {/* Powers Table */}
        <TableContainer component={Paper} className='table-container'>
          <Table aria-label='powers table'>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography
                    variant='h6'
                    sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                  >
                    Nome do Poder
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {powers.length > 0 ? (
                powers.map((power) => (
                  <Row
                    key={power.name}
                    power={power}
                    defaultOpen={powers.length === 1}
                  />
                ))
              ) : (
                <>
                  {renderPowerSection(
                    'Poderes de Combate',
                    allPowersByCategory.COMBATE,
                    combatRef
                  )}
                  {renderPowerSection(
                    'Poderes Concedidos',
                    allPowersByCategory.CONCEDIDOS,
                    concedidoRef
                  )}
                  {renderPowerSection(
                    'Poderes de Destino',
                    allPowersByCategory.DESTINO,
                    destinyRef
                  )}
                  {renderPowerSection(
                    'Poderes de Magia',
                    allPowersByCategory.MAGIA,
                    magicRef
                  )}
                  {renderPowerSection(
                    'Poderes da Tormenta',
                    allPowersByCategory.TORMENTA,
                    tormentaRef
                  )}
                  {renderPowerSection(
                    'Poderes de Raça',
                    allPowersByCategory.RACA,
                    racaRef
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default PowersTable;
