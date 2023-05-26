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
  Tabs,
  Tab,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
} from '../../data/magias/arcane';

import { Spell } from '../../interfaces/Spells';

import SearchInput from './SearchInput';

const Row: React.FC<{ spell: Spell; defaultOpen: boolean }> = ({
  spell,
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
          {spell.nome}
        </TableCell>
        <TableCell>{spell.spellCircle}</TableCell>
        <TableCell>{spell.school}</TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(spell.nome)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <p>
                <strong>{spell.school}</strong>
                <ul>
                  <li>
                    <strong>Execução:</strong> {spell.execucao}
                  </li>
                  <li>
                    <strong>Alcance:</strong> {spell.alcance}
                  </li>
                  <li>
                    <strong>Alvo:</strong> {spell.alvo || '-'}
                  </li>
                  <li>
                    <strong>Área:</strong> {spell.area || '-'}
                  </li>
                  <li>
                    <strong>Duração:</strong> {spell.duracao}
                  </li>
                  <li>
                    <strong>Resistência:</strong> {spell.resistencia}
                  </li>
                </ul>
              </p>

              {spell.aprimoramentos && (
                <p>
                  <strong>Aprimoramentos:</strong>
                  <ul>
                    {spell.aprimoramentos.map((apr) => {
                      if (apr.addPm === 0)
                        return (
                          <li>
                            <strong>TRUQUE:</strong> {apr.text}
                          </li>
                        );
                      return (
                        <li>
                          <strong>+{apr.addPm}:</strong> {apr.text}
                        </li>
                      );
                    })}
                  </ul>
                </p>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ArcaneTable: React.FC = () => {
  const allSpells = [
    ...allArcaneSpellsCircle1,
    ...allArcaneSpellsCircle2,
    ...allArcaneSpellsCircle3,
    ...allArcaneSpellsCircle4,
    ...allArcaneSpellsCircle5,
  ];

  const [value, setValue] = useState('');
  const [circle, setCircle] = useState(1);
  const [spells, setSpells] = useState<Spell[]>([]);
  const { params } = useRouteMatch();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      setCircle(0);
      const filteredSpells = allSpells.filter((spell) =>
        spell.nome.toLowerCase().includes(search)
      );

      if (filteredSpells.length > 1) history.push('/database/magias/arcanas');

      setSpells(filteredSpells);
    } else {
      setCircle(1);
    }
  };

  useEffect(() => {
    switch (circle) {
      case 1:
        setSpells(allArcaneSpellsCircle1);
        break;
      case 2:
        setSpells(allArcaneSpellsCircle2);
        break;
      case 3:
        setSpells(allArcaneSpellsCircle3);
        break;
      case 4:
        setSpells(allArcaneSpellsCircle4);
        break;
      case 5:
        setSpells(allArcaneSpellsCircle5);
        break;
      default:
        break;
    }
  }, [circle]);

  useEffect(() => {
    const { selectedSpell } = params as any;
    if (selectedSpell) {
      setValue(selectedSpell);
      filter(selectedSpell);
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
    setCircle(newValue + 1);
  };

  return (
    <>
      <Tabs
        value={circle - 1}
        onChange={handleTabChange}
        aria-label='basic tabs example'
        variant='fullWidth'
        sx={{
          background: '#da5b5d',
        }}
      >
        <Tab label='1º' id='tab1' />
        <Tab label='2º' id='tab2' />
        <Tab label='3º' id='tab2' />
        <Tab label='4º' id='tab2' />
        <Tab label='5º' id='tab2' />
      </Tabs>

      <TableContainer component={Paper}>
        <Table aria-label='collapsible table'>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <h1>
                  {value
                    ? `Resultados para "${value}"`
                    : `Arcanas de ${circle}º Círculo`}
                </h1>
              </TableCell>
              <TableCell />
              <TableCell />
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
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {spells.map((spell) => (
              <Row
                key={spell.nome}
                spell={spell}
                defaultOpen={spells.length === 1}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ArcaneTable;
