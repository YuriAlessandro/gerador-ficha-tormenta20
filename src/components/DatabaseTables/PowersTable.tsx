/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
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
import generalPowers from '../../data/poderes';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../../interfaces/Poderes';
import SearchInput from './SearchInput';

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

  if (requirement.type === RequirementType.TEXT) {
    return <li>{requirement.text}</li>;
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

const Row: React.FC<{ power: GeneralPower; defaultOpen: boolean }> = ({
  power,
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
          {power.name}
        </TableCell>
        <TableCell>
          <IconButton title='Copiar URL' onClick={() => onCopy(power.name)}>
            <ContentCopyIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <p>
                <strong>{power.type}</strong>
              </p>
              <p>{power.description}</p>
              {power.requirements.length > 0 && (
                <p>
                  <strong>Requisitos:</strong>
                  <ul>
                    {power.requirements.map((reqs, idx) => (
                      <>
                        {reqs.map((req) => (
                          <Req requirement={req} />
                        ))}
                        {power.requirements.length > 1 &&
                          idx + 1 < power.requirements.length && <p>ou</p>}
                      </>
                    ))}
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

const PowersTable: React.FC = () => {
  const allPowers = [
    ...generalPowers.COMBATE,
    ...generalPowers.CONCEDIDOS,
    ...generalPowers.DESTINO,
    ...generalPowers.MAGIA,
    ...generalPowers.TORMENTA,
  ];

  const [value, setValue] = useState('');
  const [powers, setPowers] = useState<GeneralPower[]>([]);
  const { params } = useRouteMatch();
  const history = useHistory();

  const combatRef = useRef<null | HTMLDivElement>(null);
  const concedidoRef = useRef<null | HTMLDivElement>(null);
  const destinyRef = useRef<null | HTMLDivElement>(null);
  const magicRef = useRef<null | HTMLDivElement>(null);
  const tormentaRef = useRef<null | HTMLDivElement>(null);

  const filter = (searchValue: string) => {
    const search = searchValue.toLocaleLowerCase();
    if (search.length > 0) {
      const filteredPowers = allPowers.filter((power) =>
        power.name.toLowerCase().includes(search)
      );

      if (filteredPowers.length > 1) history.push('/database/poderes');

      setPowers(filteredPowers);
    } else {
      setPowers([]);
    }
  };

  useEffect(() => {
    const { selectedPower } = params as any;
    if (selectedPower) {
      setValue(selectedPower);
      filter(selectedPower);
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
    switch (newValue) {
      case 0:
        combatRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 1:
        concedidoRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 2:
        destinyRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 3:
        magicRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 4:
        tormentaRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <h1>Poderes</h1>
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
          <TableRow>
            <TableCell />
            <TableCell>
              <Tabs
                // value={circle - 1}
                onChange={handleTabChange}
                aria-label='basic tabs example'
                variant='fullWidth'
                sx={{
                  background: '#da5b5d',
                }}
              >
                <Tab label='Combate' id='tab1' />
                <Tab label='Concedido' id='tab2' />
                <Tab label='Destino' id='tab2' />
                <Tab label='Magia' id='tab2' />
                <Tab label='Tormenta' id='tab2' />
              </Tabs>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {powers.length > 0 &&
            powers.map((power) => (
              <Row
                key={power.name}
                power={power}
                defaultOpen={powers.length === 1}
              />
            ))}
          {powers.length === 0 && (
            <>
              <TableRow>
                <TableCell />
                <TableCell ref={combatRef}>
                  <h3>De Combate</h3>
                </TableCell>
                <TableCell />
              </TableRow>
              {generalPowers.COMBATE.map((power) => (
                <Row
                  key={power.name}
                  power={power}
                  defaultOpen={powers.length === 1}
                />
              ))}
              <TableRow>
                <TableCell />
                <TableCell ref={concedidoRef}>
                  <h3>Concedidos</h3>
                </TableCell>
                <TableCell />
              </TableRow>
              {generalPowers.CONCEDIDOS.map((power) => (
                <Row
                  key={power.name}
                  power={power}
                  defaultOpen={powers.length === 1}
                />
              ))}
              <TableRow>
                <TableCell />
                <TableCell ref={destinyRef}>
                  <h3>De Destino</h3>
                </TableCell>
                <TableCell />
              </TableRow>
              {generalPowers.DESTINO.map((power) => (
                <Row
                  key={power.name}
                  power={power}
                  defaultOpen={powers.length === 1}
                />
              ))}
              <TableRow>
                <TableCell />
                <TableCell ref={magicRef}>
                  <h3>De Magia</h3>
                </TableCell>
                <TableCell />
              </TableRow>
              {generalPowers.MAGIA.map((power) => (
                <Row
                  key={power.name}
                  power={power}
                  defaultOpen={powers.length === 1}
                />
              ))}
              <TableRow>
                <TableCell />
                <TableCell ref={tormentaRef}>
                  <h3>Da Tormenta</h3>
                </TableCell>
                <TableCell />
              </TableRow>
              {generalPowers.TORMENTA.map((power) => (
                <Row
                  key={power.name}
                  power={power}
                  defaultOpen={powers.length === 1}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PowersTable;
