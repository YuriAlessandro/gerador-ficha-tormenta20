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
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CopyUrlButton from '../Database/CopyUrlButton';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
} from '../../data/systems/tormenta20/magias/divine';

import { Spell } from '../../interfaces/Spells';

import SearchInput from './SearchInput';

const Row: React.FC<{ spell: Spell; defaultOpen: boolean }> = ({
  spell,
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
          {spell.nome}
        </TableCell>
        <TableCell>{spell.spellCircle}</TableCell>
        <TableCell>{spell.school}</TableCell>
        <TableCell>
          <CopyUrlButton
            itemName={spell.nome}
            itemType='magia'
            size='small'
            variant='minimal'
          />
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

              <p>{spell.description}</p>

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

const DivineTable: React.FC = () => {
  const theme = useTheme();
  const allSpells = [
    ...allDivineSpellsCircle1,
    ...allDivineSpellsCircle2,
    ...allDivineSpellsCircle3,
    ...allDivineSpellsCircle4,
    ...allDivineSpellsCircle5,
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

      if (filteredSpells.length > 1) history.push('/database/magias/divinas');

      setSpells(filteredSpells);
    } else {
      setCircle(1);
    }
  };

  useEffect(() => {
    switch (circle) {
      case 1:
        setSpells(allDivineSpellsCircle1);
        break;
      case 2:
        setSpells(allDivineSpellsCircle1);
        break;
      case 3:
        setSpells(allDivineSpellsCircle1);
        break;
      case 4:
        setSpells(allDivineSpellsCircle1);
        break;
      case 5:
        setSpells(allDivineSpellsCircle1);
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
          background: theme.palette.primary.main,
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

export default DivineTable;
