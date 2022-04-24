import React, { useEffect, useState } from 'react';
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
import { Atributo } from '../../../data/atributos';
import { getModValue } from '../../../functions/general';

const RaceCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [choosenRace, setChoosenRace] = useState<Race | undefined>(undefined);
  const [error, setError] = useState('');
  const [humanCustomAttrs, setHumanCustomAttrs] = useState<string[]>([]);

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

  const onSelectCustomAttr = (
    attr: { label: string; value: string } | null
  ) => {
    if (attr) {
      if (humanCustomAttrs.includes(attr.value)) {
        setError('Selecione atributos diferentes');
        return;
      }
      setHumanCustomAttrs((prev) => [...prev, attr.value]);
    }
  };

  const onClickContinue = () => {
    const sheetClone = cloneDeep(sheet);

    if (choosenRace) {
      sheetClone.raca = choosenRace;

      // Apply race attributes modifications
      sheetClone.raca.attributes.attrs.forEach((attr, idx) => {
        let attrToChange = '';
        if (attr.attr === 'any') {
          if (humanCustomAttrs.length < 3) {
            setError(
              'Selecione os atributos modificados do Humano antes de continuar'
            );
            return;
          }
          attrToChange = humanCustomAttrs[idx];
        } else {
          attrToChange = attr.attr;
        }

        switch (attrToChange) {
          case 'Força':
            sheetClone.atributos.Força.value += attr.mod;
            sheetClone.atributos.Força.mod = getModValue(
              sheetClone.atributos.Força.value
            );
            break;
          case 'Destreza':
            sheetClone.atributos.Destreza.value += attr.mod;
            sheetClone.atributos.Destreza.mod = getModValue(
              sheetClone.atributos.Destreza.value
            );
            break;
          case 'Inteligência':
            sheetClone.atributos.Inteligência.value += attr.mod;
            sheetClone.atributos.Inteligência.mod = getModValue(
              sheetClone.atributos.Inteligência.value
            );
            break;
          case 'Carisma':
            sheetClone.atributos.Carisma.value += attr.mod;
            sheetClone.atributos.Carisma.mod = getModValue(
              sheetClone.atributos.Carisma.value
            );
            break;
          case 'Constituição':
            sheetClone.atributos.Constituição.value += attr.mod;
            sheetClone.atributos.Constituição.mod = getModValue(
              sheetClone.atributos.Constituição.value
            );
            break;
          case 'Sabedoria':
            sheetClone.atributos.Sabedoria.value += attr.mod;
            sheetClone.atributos.Sabedoria.mod = getModValue(
              sheetClone.atributos.Sabedoria.value
            );
            break;
          default:
            break;
        }
      });

      onContinue(3, sheetClone);
    } else {
      setError('Você deve escolher uma raça antes de continuar');
    }
  };

  const attributesOptions = Object.values(Atributo).map((attr) => ({
    label: attr,
    value: attr,
  }));

  useEffect(() => {
    setHumanCustomAttrs([]);
  }, [choosenRace]);

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
              {choosenRace.attributes.attrs.map((attr, idx) => (
                <Paper elevation={1} sx={{ mr: 3, p: 1 }}>
                  {attr.attr !== 'any' ? (
                    <>
                      {attr.mod > 0 ? '+' : ''}
                      {attr.mod} em {attr.attr}
                    </>
                  ) : (
                    <>
                      {attr.mod > 0 ? '+' : ''}
                      {attr.mod} em
                      <Select
                        className='filterSelect'
                        options={attributesOptions}
                        placeholder='Escolha um atributo'
                        onChange={onSelectCustomAttr}
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...formThemeColors,
                          },
                        })}
                        value={{
                          label: humanCustomAttrs[idx],
                          value: humanCustomAttrs[idx],
                        }}
                        isDisabled={
                          humanCustomAttrs.length > idx &&
                          humanCustomAttrs[idx].length > 0
                        }
                        styles={{
                          control: (styles, { isDisabled }) => ({
                            ...styles,
                            background: isDisabled ? '#616160' : '',
                          }),
                        }}
                      />
                    </>
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
