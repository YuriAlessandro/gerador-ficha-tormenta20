import {
  resetAttributes,
  setMethod,
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
import {
  AttributesDefinitionType,
  selectActiveSheetInitialAttributesMethod,
} from '../../../../../store/slices/sheetStorage/sheetStorage';
import SheetBuilderFormStepAttributesDefinitionDice from './SheetBuilderFormStepAttributesDefinitionDice';
import SheetBuilderFormStepAttributesDefinitionFree from './SheetBuilderFormStepAttributesDefinitionFree';
import SheetBuilderFormStepAttributesDefinitionPoints from './SheetBuilderFormStepAttributesDefinitionPoints';

const SheetBuilderFormStepAttributesDefinition = () => {
  const type = useSelector(selectActiveSheetInitialAttributesMethod);
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(resetAttributes());
    dispatch(setOptionReady({ key: 'isAttrReady', value: 'pending' }));
    const { value } = event.target as HTMLInputElement;
    dispatch(setMethod(value as AttributesDefinitionType));
  };

  return (
    <Stack justifyContent='center' alignItems='center' spacing={2}>
      <FormControl>
        <FormLabel>Gerar atributos por</FormLabel>
        <RadioGroup
          row
          name='row-radio-buttons-group'
          value={type}
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
      {type === 'dice' && <SheetBuilderFormStepAttributesDefinitionDice />}
      {type === 'points' && <SheetBuilderFormStepAttributesDefinitionPoints />}
      {type === 'free' && <SheetBuilderFormStepAttributesDefinitionFree />}
    </Stack>
  );
};

export default SheetBuilderFormStepAttributesDefinition;
