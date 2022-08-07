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
  Snackbar,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { ORIGINS } from '../../data/origins';
import Origin from '../../interfaces/Origin';

import SearchInput from './SearchInput';
import { ORIGIN_POWER_TYPE } from '../../data/powers/originPowers';

const Row: React.FC<{ origin: Origin; defaultOpen: boolean }> = ({
  origin,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const onCopy = (name: string) => {
    navigator.clipboard.writeText(
      `${window.location.href}/${name.toLowerCase()}`
    );
    setAlert(true);
  };

  return (
    <>
      <Snackbar
        open={alert}
        autoHideDuration={5000}
        message='Link copiado para a área de transferência.'
        onClose={() => setAlert(false)}
      />
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
          {origin.name}
        </TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(origin.name)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <p>
                <strong>Itens: </strong>
                {origin
                  .getItems()
                  .map((item) => `${item.description || item.equipment}; `)}
              </p>
              <p>
                <strong>Benefícios: </strong>
                {origin.name !== 'Amnésico' && (
                  <>
                    {origin.pericias.join(', ')} (perícias);
                    {origin.poderes.map(
                      (power, idx) =>
                        `${power.name}${
                          idx + 1 < origin.poderes.length ? ', ' : ' '
                        }`
                    )}{' '}
                    (poderes);
                  </>
                )}

                {origin.name === 'Amnésico' && (
                  <span>
                    Uma perícia e um poder escolhidos pelo mestre e o poder
                    Lembranças Graduais
                  </span>
                )}
              </p>
            </Box>
            <Box>
              <p>
                {origin.poderes.map((power) => {
                  if (power.type === ORIGIN_POWER_TYPE) {
                    return (
                      <>
                        <h3>{power.name}</h3>
                        <p>{power.description}</p>
                      </>
                    );
                  }
                  return '';
                })}
              </p>
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
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <h1>Origens</h1>
            </TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell>
              <SearchInput
                value={value}
                handleChange={handleChange}
                onVoiceSearch={onVoiceSearch}
              />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {origins.map((origin) => (
            <Row
              key={origin.name}
              origin={origin}
              defaultOpen={origins.length === 1}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OriginsTable;
