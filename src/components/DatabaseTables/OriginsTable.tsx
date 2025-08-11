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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ORIGINS } from '../../data/origins';
import Origin from '../../interfaces/Origin';

import SearchInput from './SearchInput';
import { ORIGIN_POWER_TYPE } from '../../data/powers/originPowers';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';

const Row: React.FC<{ origin: Origin; defaultOpen: boolean }> = ({
  origin,
  defaultOpen,
}) => {
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
            <Box sx={{ ml: 'auto' }}>
              <CopyUrlButton
                itemName={origin.name}
                itemType='origem'
                size='small'
              />
            </Box>
          </Box>
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
                {origin.name}
              </Typography>

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
  const allOrigins: Origin[] = Object.values(ORIGINS).sort((a, b) =>
    a.name < b.name ? -1 : 1
  );

  const [value, setValue] = useState('');
  const [origins, setOrigins] = useState<Origin[]>(allOrigins);
  const { params } = useRouteMatch();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredOrigins = origins.filter((origin) =>
        origin.name.toLowerCase().includes(search)
      );

      if (filteredOrigins.length > 1) history.push('/database/origens');

      setOrigins(filteredOrigins);
    } else {
      setOrigins(allOrigins);
    }
  };

  useEffect(() => {
    const { selectedOrigin } = params as any;
    if (selectedOrigin) {
      setValue(selectedOrigin);
      filter(selectedOrigin);
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

  return (
    <Box>
      <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
        Origens de Personagem
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
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
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
  );
};

export default OriginsTable;
