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
  Chip,
  Grid,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import { useHistory, useRouteMatch } from 'react-router-dom';
import CLASSES from '../../data/classes';
import SearchInput from './SearchInput';
import { ClassDescription } from '../../interfaces/Class';
import { Requirement, RequirementType } from '../../interfaces/Poderes';
import TormentaTitle from '../Database/TormentaTitle';
import CopyUrlButton from '../Database/CopyUrlButton';

interface IProps {
  classe: ClassDescription;
  defaultOpen: boolean;
}

const Req: React.FC<{ requirement: Requirement }> = ({ requirement }) => {
  let reqText = '';

  if (requirement.type === RequirementType.ATRIBUTO) {
    reqText = `${requirement.name} ${requirement.value}`;
  } else if (requirement.type === RequirementType.DEVOTO) {
    reqText = `Devoto de ${requirement.name}`;
  } else if (requirement.type === RequirementType.NIVEL) {
    reqText = `Nível ${requirement.value}`;
  } else if (requirement.type === RequirementType.PERICIA) {
    reqText = `Treinado em ${requirement.name}`;
  } else if (requirement.type === RequirementType.TEXT) {
    reqText = requirement.text || '';
  } else if (requirement.type === RequirementType.PODER_TORMENTA) {
    reqText = `Pelo menos ${requirement.value} ${
      (requirement.value || 0) > 1 ? 'poderes' : 'poder'
    } da Tormenta`;
  } else {
    reqText = requirement.name || '';
  }

  return (
    <Chip
      label={reqText}
      size='small'
      variant='outlined'
      color='secondary'
      sx={{
        m: 0.5,
        fontFamily: 'Tfont, serif',
        fontSize: '0.75rem',
      }}
    />
  );
};

const Row: React.FC<IProps> = ({ classe, defaultOpen }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          '&:hover': {
            backgroundColor: 'rgba(209, 50, 53, 0.02)',
          },
        }}
      >
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
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
          >
            <Box display='flex' alignItems='center' gap={1}>
              <WhatshotIcon color='primary' fontSize='small' />
              <Typography variant='body1' fontWeight={500}>
                {classe.name}
                {classe.subname && (
                  <Typography
                    component='span'
                    variant='body2'
                    color='text.secondary'
                    sx={{ ml: 1 }}
                  >
                    ({classe.subname})
                  </Typography>
                )}
              </Typography>
            </Box>
            <CopyUrlButton
              itemName={classe.name}
              itemType='classe'
              size='small'
              variant='minimal'
            />
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
                {classe.name}
                {classe.subname && ` (${classe.subname})`}
              </Typography>

              {/* Basic Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(209, 50, 53, 0.05)',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant='h6'
                      gutterBottom
                      sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                    >
                      Pontos de Vida
                    </Typography>
                    <Typography variant='body2'>
                      Começa com <strong>{classe.pv} PV</strong> (+ mod.
                      Constituição)
                      <br />
                      Ganha <strong>{classe.addpv} PV</strong> (+ mod. Con.) por
                      nível
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(209, 50, 53, 0.05)',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant='h6'
                      gutterBottom
                      sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                    >
                      Pontos de Mana
                    </Typography>
                    <Typography variant='body2'>
                      <strong>{classe.pm} PM</strong> por nível
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Skills */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                >
                  Perícias
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant='body2' gutterBottom>
                    <strong>Perícias básicas:</strong>
                  </Typography>
                  <Box display='flex' gap={1} flexWrap='wrap'>
                    {classe.periciasbasicas.map((per) => (
                      <Chip
                        key={`basic-skill-${per.type}-${per.list.join('-')}`}
                        label={
                          per.type === 'and'
                            ? per.list.join(' e ')
                            : per.list.join(' ou ')
                        }
                        size='small'
                        variant='outlined'
                        color='primary'
                        sx={{ fontFamily: 'Tfont, serif' }}
                      />
                    ))}
                  </Box>
                </Box>
                <Typography variant='body2'>
                  <strong>
                    Mais {classe.periciasrestantes.qtd} à sua escolha entre:
                  </strong>
                </Typography>
                <Box display='flex' gap={1} flexWrap='wrap' sx={{ mt: 1 }}>
                  {classe.periciasrestantes.list.map((skill) => (
                    <Chip
                      key={`remaining-skill-${skill}`}
                      label={skill}
                      size='small'
                      variant='outlined'
                      sx={{ fontFamily: 'Tfont, serif' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Proficiencies */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontFamily: 'Tfont, serif', fontSize: '1.1rem' }}
                >
                  Proficiências
                </Typography>
                <Box display='flex' gap={1} flexWrap='wrap'>
                  {classe.proficiencias.map((prof) => (
                    <Chip
                      key={`proficiency-${prof}`}
                      label={prof}
                      size='small'
                      variant='filled'
                      color='secondary'
                      sx={{ fontFamily: 'Tfont, serif' }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Abilities */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif', fontSize: '1.2rem' }}
              >
                Habilidades de {classe.name}
              </Typography>
              {classe.abilities.map((ability) => (
                <Box key={ability.name} sx={{ mb: 3 }}>
                  <Typography
                    variant='h6'
                    color='primary'
                    sx={{
                      fontFamily: 'Tfont, serif',
                      fontSize: '1rem',
                      mb: 1,
                    }}
                  >
                    {ability.name} ({ability.nivel}º nível)
                  </Typography>
                  <Typography variant='body1' paragraph>
                    {ability.text}
                  </Typography>
                  {ability.name !==
                    classe.abilities[classe.abilities.length - 1]?.name && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />

              {/* Powers */}
              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontFamily: 'Tfont, serif', fontSize: '1.2rem' }}
              >
                Poderes de {classe.name}
              </Typography>
              {classe.powers.map((power) => (
                <Box key={power.name} sx={{ mb: 3 }}>
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
                    {power.text}
                  </Typography>
                  {power.requirements && power.requirements.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='body2' gutterBottom>
                        <strong>Requisitos:</strong>
                      </Typography>
                      {power.requirements.map((reqGroup, reqIndex) => (
                        <Box
                          key={`power-${power.name}-reqGroup-${reqGroup
                            .map((r) => r.name || r.text)
                            .join('-')}`}
                          sx={{ mb: 1 }}
                        >
                          {reqGroup.map((req, _reqSubIndex) => (
                            <Req
                              key={`power-${power.name}-req-${
                                req.name || req.text
                              }-${req.value || 'novalue'}`}
                              requirement={req}
                            />
                          ))}
                          {power.requirements &&
                            power.requirements.length > 1 &&
                            reqIndex + 1 < power.requirements.length && (
                              <Typography
                                variant='body2'
                                sx={{ my: 1, fontStyle: 'italic' }}
                              >
                                ou
                              </Typography>
                            )}
                        </Box>
                      ))}
                    </Box>
                  )}
                  {power.name !==
                    classe.powers[classe.powers.length - 1]?.name && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </Box>
              ))}
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
    <Box>
      <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
        Classes e Poderes de Classe
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
          {classes.length === 0
            ? 'Nenhuma classe encontrada com os filtros aplicados'
            : `${classes.length} classe${
                classes.length !== 1 ? 's' : ''
              } encontrada${classes.length !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Classes Table */}
      <TableContainer component={Paper} className='table-container'>
        <Table aria-label='classes table'>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <Typography
                  variant='h6'
                  sx={{ fontFamily: 'Tfont, serif', color: '#d13235' }}
                >
                  Nome da Classe
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                  <Typography variant='body1' color='text.secondary'>
                    Nenhuma classe encontrada. Tente ajustar a busca.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cl) => (
                <Row
                  key={cl.name}
                  classe={cl}
                  defaultOpen={classes.length === 1}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClassesTable;
