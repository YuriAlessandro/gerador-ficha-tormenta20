import {
  changeMethod,
  selectInitialAttributesMethod,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AttributesDefinitionType } from '../../../../../store/slices/sheetStorage/sheetStorage';
import SheetBuilderFormStepAttributesDefinitionDice from './SheetBuilderFormStepAttributesDefinitionDice';
import SheetBuilderFormStepAttributesDefinitionFree from './SheetBuilderFormStepAttributesDefinitionFree';
import SheetBuilderFormStepAttributesDefinitionPoints from './SheetBuilderFormStepAttributesDefinitionPoints';

const SheetBuilderFormStepAttributesDefinition = () => {
  const storedType = useSelector(selectInitialAttributesMethod);
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOptionReady({ key: 'isAttrReady', value: 'pending' }));
    dispatch(changeMethod(event.target.value as AttributesDefinitionType));
  };

  return (
    <Stack
      spacing={2}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FormControl>
        <FormLabel>Gerar atributos por</FormLabel>
        <RadioGroup
          row
          name='row-radio-buttons-group'
          value={storedType}
          onChange={handleChange}
        >
          <FormControlLabel
            value='dice'
            control={<Radio />}
            label='Rolagem de dados'
          />
          <FormControlLabel value='points' control={<Radio />} label='Pontos' />
          <FormControlLabel
            value='free'
            control={<Radio />}
            label='Modo livre'
          />
        </RadioGroup>
      </FormControl>
      {storedType === 'dice' && (
        <SheetBuilderFormStepAttributesDefinitionDice />
      )}
      {storedType === 'points' && (
        <SheetBuilderFormStepAttributesDefinitionPoints />
      )}
      {storedType === 'free' && (
        <SheetBuilderFormStepAttributesDefinitionFree />
      )}
    </Stack>
  );
};

export default SheetBuilderFormStepAttributesDefinition;
