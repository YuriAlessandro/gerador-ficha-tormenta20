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
import RACAS from '../../data/races';
import Race from '../../interfaces/Race';
import SearchInput from './SearchInput';

const Row: React.FC<{ race: Race; defaultOpen: boolean }> = ({
  race,
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
          {race.name}
        </TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(race.name)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <span>
                {race.name === 'Humano' && (
                  <span>+2 em três atributos a sua escolha</span>
                )}
                {race.name !== 'Humano' &&
                  race.attributes.attrs.map((attr, idx) => (
                    <span>{`${attr.attr} ${attr.mod > 0 ? '+' : ''}${attr.mod}${
                      idx + 1 < race.attributes.attrs.length ? ',' : ''
                    } `}</span>
                  ))}
              </span>
              <Box>
                {race.abilities.map((abl) => (
                  <Box>
                    <h4>{abl.name}</h4>
                    <p>{abl.description}</p>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const RacesTable: React.FC = () => {
  const [value, setValue] = useState('');
  const [races, setRaces] = useState<Race[]>(RACAS);
  const { params } = useRouteMatch();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredRaces = RACAS.filter((race) => {
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
      setRaces(RACAS);
    }
  };

  useEffect(() => {
    const { selectedRace } = params as any;
    if (selectedRace) {
      setValue(selectedRace);
      filter(selectedRace);
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
              <h1>Raças e Habilidades de Raça</h1>
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
          {races.map((race) => (
            <Row key={race.name} race={race} defaultOpen={races.length === 1} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RacesTable;
