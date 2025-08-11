/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
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
import generalPowers from '../../data/poderes';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../../interfaces/Poderes';
import SearchInput from './SearchInput';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';

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

const Row: React.FC<{ power: GeneralPower; defaultOpen: boolean }> = ({
  power,
  defaultOpen,
}) => {
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
  const allPowers = [
    ...generalPowers.COMBATE,
    ...generalPowers.CONCEDIDOS,
    ...generalPowers.DESTINO,
    ...generalPowers.MAGIA,
    ...generalPowers.TORMENTA,
  ];

  const [value, setValue] = useState('');
  const [powers, setPowers] = useState<GeneralPower[]>([]);
  const { params } = useRouteMatch();
  const history = useHistory();

  const combatRef = useRef<null | HTMLDivElement>(null);
  const concedidoRef = useRef<null | HTMLDivElement>(null);
  const destinyRef = useRef<null | HTMLDivElement>(null);
  const magicRef = useRef<null | HTMLDivElement>(null);
  const tormentaRef = useRef<null | HTMLDivElement>(null);

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredPowers = allPowers.filter((power) =>
        power.name.toLowerCase().includes(search)
      );

      if (filteredPowers.length > 1) history.push('/database/poderes');

      setPowers(filteredPowers);
    } else {
      setPowers([]);
    }
  };

  useEffect(() => {
    const { selectedPower } = params as any;
    if (selectedPower) {
      setValue(selectedPower);
      filter(selectedPower);
    }
  }, [params]);

  const onVoiceSearch = (newValue: string) => {
    setValue(newValue);
    filter(newValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    filter(event.target.value);
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
      default:
        break;
    }
  };

  const renderPowerSection = (
    title: string,
    powersList: GeneralPower[],
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

  return (
    <Box>
      <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
        Poderes Gerais
      </TormentaTitle>

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
                  generalPowers.COMBATE,
                  combatRef
                )}
                {renderPowerSection(
                  'Poderes Concedidos',
                  generalPowers.CONCEDIDOS,
                  concedidoRef
                )}
                {renderPowerSection(
                  'Poderes de Destino',
                  generalPowers.DESTINO,
                  destinyRef
                )}
                {renderPowerSection(
                  'Poderes de Magia',
                  generalPowers.MAGIA,
                  magicRef
                )}
                {renderPowerSection(
                  'Poderes da Tormenta',
                  generalPowers.TORMENTA,
                  tormentaRef
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PowersTable;
