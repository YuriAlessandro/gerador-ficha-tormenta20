import React, { useState } from 'react';
import {
  Paper,
  Box,
  IconButton,
  Typography,
  Slide,
  Alert,
  Divider,
} from '@mui/material';
import Select from 'react-select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { TransitionGroup } from 'react-transition-group';
import { cloneDeep } from 'lodash';
import RACAS from '../../../data/racas';
import { CardInterface } from './interfaces';
import getSelectTheme from '../../../functions/style';
import Race from '../../../interfaces/Race';

const RaceCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [choosenRace, setChoosenRace] = useState<Race | undefined>(undefined);
  const [error, setError] = useState('');

  const racas = RACAS.map((raca) => ({ value: raca.name, label: raca.name }));
  const ls = window.localStorage;

  const formThemeColors =
    ls.getItem('dkmFdn') === 'true'
      ? getSelectTheme('dark')
      : getSelectTheme('default');

  const onSelectRaca = (raca: { label: string; value: string } | null) => {
    const selectedRaca = RACAS.find((pRaca) => pRaca.name === raca?.label);
    setChoosenRace(selectedRaca);
  };

  const onClickContinue = () => {
    const sheetClone = cloneDeep(sheet);

    if (choosenRace) {
      sheetClone.raca = choosenRace;

      onContinue(3, sheetClone);
    } else {
      setError('Você deve escolher uma raça antes de continuar');
    }
  };

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2 }}>
        <h1>Escolha a raça</h1>

        <Slide direction='right' in={error.length > 0}>
          <Alert severity='error'>{error}</Alert>
        </Slide>

        <Select
          className='filterSelect'
          options={racas}
          placeholder='Escolha sua raça'
          onChange={onSelectRaca}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        {choosenRace && (
          <TransitionGroup>
            <Box sx={{ display: 'flex', mt: 3, mb: 3 }}>
              {choosenRace.attributes.attrs.map((attr) => (
                <Paper elevation={1} sx={{ mr: 3, p: 1 }}>
                  {attr.attr !== 'any' ? (
                    <>
                      {attr.mod > 0 ? '+' : ''}
                      {attr.mod} em {attr.attr}
                    </>
                  ) : (
                    <span>humano imundo</span>
                  )}
                </Paper>
              ))}
            </Box>

            <Divider />

            {choosenRace.abilities.map((abilitie) => (
              <Slide direction='up' key={`${abilitie.name}`}>
                <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FactCheckIcon sx={{ mr: 2 }} />
                    <Typography fontSize={20} fontWeight='bold'>
                      {abilitie.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>{abilitie.description}</Box>
                </Paper>
              </Slide>
            ))}
          </TransitionGroup>
        )}
      </Box>
      <Box sx={{ textAlign: 'center', pb: 1 }}>
        <IconButton title='Continuar' onClick={onClickContinue}>
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default RaceCard;
