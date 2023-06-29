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
import CLASSES from '../../data/classes';
import SearchInput from './SearchInput';
import { ClassDescription } from '../../interfaces/Class';
import { Requirement, RequirementType } from '../../interfaces/Poderes';

interface IProps {
  classe: ClassDescription;
  defaultOpen: boolean;
}

const Req: React.FC<{ requirement: Requirement }> = ({ requirement }) => {
  if (requirement.type === RequirementType.ATRIBUTO) {
    return (
      <li>
        {requirement.name} {requirement.value}
      </li>
    );
  }

  if (requirement.type === RequirementType.DEVOTO) {
    return <li>Devoto de {requirement.name}</li>;
  }

  if (requirement.type === RequirementType.NIVEL) {
    return <li>Nível {requirement.value}</li>;
  }

  if (requirement.type === RequirementType.PERICIA) {
    return <li>Treinado em {requirement.name}</li>;
  }

  if (requirement.type === RequirementType.PODER_TORMENTA) {
    return (
      <li>{`Pelo menos ${requirement.value} ${
        (requirement.value || 0) > 1 ? 'poderes' : 'poder'
      } da Tormenta`}</li>
    );
  }

  return <li>{requirement.name}</li>;
};

const Row: React.FC<IProps> = ({ classe, defaultOpen }) => {
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
          {classe.name}
        </TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(classe.name)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <span>
                <p>
                  <strong>Pontos de vida: </strong> Um {classe.name} começa com{' '}
                  {classe.pv} pontos de vida (+ modificador de Constituição) e
                  ganha {classe.addpv} (+ mod. Con.) por nível.
                </p>
                <p>
                  <strong>Pontos de mana: </strong> {classe.pm} PM por nível.
                </p>
                <p>
                  <strong>Perícias: </strong>
                  {classe.periciasbasicas.map((per) => {
                    let str = '';
                    if (per.type === 'and') {
                      str = str.concat(per.list.join(' e '));
                    } else {
                      str = str.concat(per.list.join(' ou '));
                    }

                    str = str.concat('; ');
                    return str;
                  })}
                  e mais {classe.periciasrestantes.qtd} a sua escolha entre{' '}
                  {classe.periciasrestantes.list.join('; ')}
                </p>
                <p>
                  <strong>Proficiências: </strong>{' '}
                  {classe.proficiencias.join(', ')}
                </p>
              </span>
              <Box>
                <h2>Habilidades de {classe.name}</h2>
                {classe.abilities.map((abl) => (
                  <Box>
                    <h4>
                      {abl.name} ({abl.nivel}º nível)
                    </h4>
                    <p>{abl.text}</p>
                  </Box>
                ))}
              </Box>
              <Box>
                <h2>Poderes de {classe.name}</h2>
                {classe.powers.map((power) => (
                  <Box>
                    <h4>{power.name}</h4>
                    <p>{power.text}</p>
                    {power.requirements && power.requirements?.length > 0 && (
                      <p>
                        <i>Requisitos:</i>
                        {power.requirements?.map((reqs, idx) => (
                          <>
                            {reqs.map((req) => (
                              <Req requirement={req} />
                            ))}
                            {power.requirements &&
                              power.requirements.length > 1 &&
                              idx + 1 < power.requirements.length && <p>ou</p>}
                          </>
                        ))}
                      </p>
                    )}
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

const ClassesTable: React.FC = () => {
  const [value, setValue] = useState('');
  const [classes, setClasses] = useState<ClassDescription[]>(CLASSES);
  const { params } = useRouteMatch<{ selectedClass?: string }>();
  const history = useHistory();

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredRaces = CLASSES.filter((classe) => {
        if (
          classe.name.toLowerCase().includes(search) ||
          classe.subname?.toLowerCase().includes(search)
        ) {
          return true;
        }
        const abltNames = classe.abilities.map((ablt) => ablt.name);
        const powersnames = classe.powers.map((power) => power.name);

        if (abltNames.find((name) => name.toLowerCase().includes(search)))
          return true;

        if (powersnames.find((name) => name.toLowerCase().includes(search)))
          return true;

        return false;
      });

      if (filteredRaces.length > 1) history.push('/database/classes');

      setClasses(filteredRaces);
    } else {
      setClasses(CLASSES);
    }
  };

  useEffect(() => {
    const { selectedClass } = params;
    if (selectedClass) {
      setValue(selectedClass);
      filter(selectedClass);
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
              <h1>Classes e Poderes de Classe</h1>
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
          {classes.map((cl) => (
            <Row key={cl.name} classe={cl} defaultOpen={classes.length === 1} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClassesTable;
