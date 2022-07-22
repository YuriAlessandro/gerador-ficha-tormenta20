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

// import CLASSES from '../../data/classes';
import SearchInput from './SearchInput';
// import { ClassDescription } from '../../interfaces/Class';
import { DIVINDADES } from '../../data/divindades';
import Divindade from '../../interfaces/Divindade';

interface IProps {
  divindade: Divindade;
  defaultOpen: boolean;
}

const Row: React.FC<IProps> = ({ divindade, defaultOpen }) => {
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
          {divindade.name}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box>
                <h2>Poderes de Condedidos</h2>
                {divindade.poderes.map((power) => (
                  <Box>
                    <h4>{power.name}</h4>
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

const DivindadesTable: React.FC = () => {
  const [value, setValue] = useState('');
  const [divindades, setDivindades] = useState<Divindade[]>(DIVINDADES);

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredRaces = DIVINDADES.filter((divindade) =>
        divindade.name.toLocaleLowerCase().includes(search)
      );

      setDivindades(filteredRaces);
    } else {
      setDivindades(DIVINDADES);
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
              <h1>Divindades</h1>
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
          {divindades.map((divindade) => (
            <Row
              key={divindade.name}
              divindade={divindade}
              defaultOpen={divindades.length === 1}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DivindadesTable;
