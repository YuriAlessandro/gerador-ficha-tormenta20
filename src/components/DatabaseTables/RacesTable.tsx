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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import RACAS from '../../data/racas';
import Race from '../../interfaces/Race';
import SearchInput from './SearchInput';

const Row: React.FC<{ race: Race; defaultOpen: boolean }> = ({
  race,
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
          {race.name}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* <h1>Habilidades de Raça</h1> */}
              <span>
                {race.attributes.attrs.map((attr, idx) => (
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

      setRaces(filteredRaces);
    } else {
      setRaces(RACAS);
    }
  };

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
