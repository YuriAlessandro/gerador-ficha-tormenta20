import React, { useState } from 'react';
import { Box, IconButton, Paper, TextField, Alert, Slide } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cloneDeep } from 'lodash';
import { getModValue } from '../../../functions/general';
import { rollDice } from '../../../functions/randomUtils';
import { CardInterface } from './interfaces';

const initialFormData = {
  Força: '',
  Destreza: '',
  Constituição: '',
  Inteligência: '',
  Sabedoria: '',
  Carisma: '',
};

const AttributesCard: React.FC<CardInterface> = ({ onContinue, sheet }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [allDisabled, setAllDisabled] = useState(false);
  const [error, setError] = useState('');

  const onGenerateAttr = (name: string) => {
    const newValue = rollDice(4, 6, 1);
    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const GenerateRandomValueButton: React.FC<{ name: string }> = ({ name }) => (
    <IconButton onClick={() => onGenerateAttr(name)}>
      <CasinoIcon />
    </IconButton>
  );

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateValues = async () => {
    let hasError = false;
    await Object.values(formData).forEach((value) => {
      if (!value || parseInt(value, 10) < 3 || parseInt(value, 10) > 18) {
        setError('Todos os valores devem ser preenchidos entre 3 e 18');
        hasError = true;
      }
    });

    return hasError;
  };

  const onClickContinue = async () => {
    const hasError = await validateValues();
    if (!hasError) {
      setAllDisabled(true);
      const sheetClone = cloneDeep(sheet);

      // Força
      sheetClone.atributos.Força.value = parseInt(formData.Força, 10);
      sheetClone.atributos.Força.mod = getModValue(
        parseInt(formData.Força, 10)
      );

      // Destreza
      sheetClone.atributos.Destreza.value = parseInt(formData.Destreza, 10);
      sheetClone.atributos.Destreza.mod = getModValue(
        parseInt(formData.Destreza, 10)
      );

      // Constituição
      sheetClone.atributos.Constituição.value = parseInt(
        formData.Constituição,
        10
      );
      sheetClone.atributos.Constituição.mod = getModValue(
        parseInt(formData.Constituição, 10)
      );

      // Inteligência
      sheetClone.atributos.Inteligência.value = parseInt(
        formData.Inteligência,
        10
      );
      sheetClone.atributos.Inteligência.mod = getModValue(
        parseInt(formData.Inteligência, 10)
      );

      // Sabedoria
      sheetClone.atributos.Sabedoria.value = parseInt(formData.Sabedoria, 10);
      sheetClone.atributos.Sabedoria.mod = getModValue(
        parseInt(formData.Sabedoria, 10)
      );

      // Carisma
      sheetClone.atributos.Carisma.value = parseInt(formData.Carisma, 10);
      sheetClone.atributos.Carisma.mod = getModValue(
        parseInt(formData.Carisma, 10)
      );

      onContinue(2, sheetClone);
    }
  };

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2 }}>
        <h2>Defina seus Atributos</h2>
        <Slide direction='right' in={error.length > 0}>
          <Alert severity='error'>{error}</Alert>
        </Slide>
        <Box
          component='form'
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
            mb: 1,
          }}
          noValidate
          autoComplete='off'
        >
          <TextField
            label='Força'
            name='Força'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Força' />,
            }}
            onChange={onChangeInput}
            value={formData.Força}
            disabled={allDisabled}
          />
          <TextField
            label='Destreza'
            name='Destreza'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Destreza' />,
            }}
            onChange={onChangeInput}
            value={formData.Destreza}
            disabled={allDisabled}
          />
          <TextField
            label='Constituição'
            name='Constituição'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Constituição' />,
            }}
            onChange={onChangeInput}
            value={formData.Constituição}
            disabled={allDisabled}
          />
          <TextField
            label='Inteligência'
            name='Inteligência'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Inteligência' />,
            }}
            onChange={onChangeInput}
            value={formData.Inteligência}
            disabled={allDisabled}
          />
          <TextField
            label='Sabedoria'
            name='Sabedoria'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Sabedoria' />,
            }}
            onChange={onChangeInput}
            value={formData.Sabedoria}
            disabled={allDisabled}
          />
          <TextField
            label='Carisma'
            name='Carisma'
            variant='outlined'
            type='number'
            InputProps={{
              endAdornment: <GenerateRandomValueButton name='Carisma' />,
            }}
            onChange={onChangeInput}
            value={formData.Carisma}
            disabled={allDisabled}
          />
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center', pb: 1 }}>
        <IconButton title='Continuar' onClick={onClickContinue}>
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default AttributesCard;
