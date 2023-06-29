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

import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchInput from './SearchInput';
import { DIVINDADES } from '../../data/divindades';
import Divindade from '../../interfaces/Divindade';

interface IProps {
  divindade: Divindade;
  defaultOpen: boolean;
}

const Row: React.FC<IProps> = ({ divindade, defaultOpen }) => {
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
          {divindade.name}
        </TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(divindade.name)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box>
                <h2>Poderes Concedidos</h2>
                {divindade.poderes.map((power) => (
                  <Box>
                    <h4>
                      <Link to={`/database/poderes/${power.name}`}>
                        {power.name}
                      </Link>
                    </h4>
                    <p>{power.description}</p>
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

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <h1>Divindades</h1>
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
