import {
  Alert,
  Paper,
  Slide,
  Box,
  IconButton,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Divider,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ORIGINS, origins } from '../../../data/origins';
import getSelectTheme from '../../../functions/style';
import { CardInterface } from './interfaces';
import Origin from '../../../interfaces/Origin';

const OriginCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [choosenOrigin, setChoosenOrigin] = useState<Origin | undefined>(
    undefined
  );
  const [error, setError] = useState('');

  const ls = window.localStorage;

  const formThemeColors =
    ls.getItem('dkmFdn') === 'true'
      ? getSelectTheme('dark')
      : getSelectTheme('default');

  const origens = Object.keys(ORIGINS).map((origin) => ({
    value: origin,
    label: origin,
  }));

  const onClickContinue = () => {
    const sheetClone = cloneDeep(sheet);
    onContinue(5, sheetClone);
  };

  const onSelectOrigin = (origin: { label: string; value: string } | null) => {
    if (origin) {
      const selectedOrigin = ORIGINS[origin.label as unknown as origins];
      setChoosenOrigin(selectedOrigin);
    }
  };

  useEffect(() => {
    setChoosenOrigin(undefined);
  }, []);

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2 }}>
        <h1>Escolha a origem</h1>

        <Slide direction='right' in={error.length > 0}>
          <Alert severity='error'>{error}</Alert>
        </Slide>

        <Select
          className='filterSelect'
          options={origens}
          placeholder='Escolha sua origem'
          onChange={onSelectOrigin}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        {choosenOrigin && (
          <Paper elevation={1} sx={{ mt: 3, p: 1 }}>
            <FormGroup>
              <span>Escolha duas opções:</span>
              {choosenOrigin.pericias.map((bnt) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      // onChange={handleCheckboxSkillChange}
                      name={bnt}
                      // checked={selectedCheckboxes.includes(bnt)}
                    />
                  }
                  label={bnt}
                />
              ))}
              <Divider />
              {choosenOrigin.poderes.map((bnt) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      // onChange={handleCheckboxSkillChange}
                      name={bnt.name}
                      // checked={selectedCheckboxes.includes(bnt)}
                    />
                  }
                  label={bnt.name}
                />
              ))}
            </FormGroup>
          </Paper>
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

export default OriginCard;
