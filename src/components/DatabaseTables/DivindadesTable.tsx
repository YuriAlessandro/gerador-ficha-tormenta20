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
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';

import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import SearchInput from './SearchInput';
import { SEO, getPageSEO } from '../SEO';
import { DIVINDADES } from '../../data/systems/tormenta20/divindades';
import Divindade from '../../interfaces/Divindade';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';

interface IProps {
  divindade: Divindade;
  defaultOpen: boolean;
}

const Row: React.FC<IProps> = ({ divindade, defaultOpen }) => {
  const theme = useTheme();
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
              <FilterDramaIcon color='primary' fontSize='small' />
              <Typography variant='body1' fontWeight={500}>
                {divindade.name}
              </Typography>
            </Box>
            <CopyUrlButton
              itemName={divindade.name}
              itemType='divindade'
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
              <Typography
                variant='h6'
                color='primary'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif' }}
              >
                {divindade.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif', fontSize: '1.2rem' }}
              >
                Poderes Concedidos
              </Typography>
              {divindade.poderes.map((power) => (
                <Box key={power.name} sx={{ mb: 3 }}>
                  <Typography
                    variant='h6'
                    color='primary'
                    component={Link}
                    to={`/database/poderes/${power.name}`}
                    sx={{
                      fontFamily: 'Tfont, serif',
                      fontSize: '1rem',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {power.name}
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {power.description}
                  </Typography>
                  {power.name !==
                    divindade.poderes[divindade.poderes.length - 1]?.name && (
                    <Divider sx={{ my: 2 }} />
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

const DivindadesTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [divindades, setDivindades] = useState<Divindade[]>(DIVINDADES);
  const { params } = useRouteMatch<{ selectedGod?: string }>();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredGods = DIVINDADES.filter((divindade) =>
        divindade.name.toLocaleLowerCase().includes(search)
      );

      if (filteredGods.length > 1) history.push('/database/divindades');

      setDivindades(filteredGods);
    } else {
      setDivindades(DIVINDADES);
    }
  };

  useEffect(() => {
    const { selectedGod } = params;
    if (selectedGod) {
      setValue(selectedGod);
      filter(selectedGod);
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

  // Get selected divinity for SEO
  const selectedDivindadeData =
    divindades.length === 1 && params.selectedGod ? divindades[0] : null;
  const deitiesSEO = getPageSEO('deities');

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
          selectedDivindadeData ? `/${params.selectedGod}` : ''
        }`}
      />
      <Box>
        <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
          Divindades de Arton
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

        {/* Results Summary */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            {divindades.length === 0
              ? 'Nenhuma divindade encontrada com os filtros aplicados'
              : `${divindades.length} divindade${
                  divindades.length !== 1 ? 's' : ''
                } encontrada${divindades.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Divindades Table */}
        <TableContainer component={Paper} className='table-container'>
          <Table aria-label='divindades table'>
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
                    Nome da Divindade
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {divindades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                    <Typography variant='body1' color='text.secondary'>
                      Nenhuma divindade encontrada. Tente ajustar a busca.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                divindades.map((divindade) => (
                  <Row
                    key={divindade.name}
                    divindade={divindade}
                    defaultOpen={divindades.length === 1}
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

export default DivindadesTable;
