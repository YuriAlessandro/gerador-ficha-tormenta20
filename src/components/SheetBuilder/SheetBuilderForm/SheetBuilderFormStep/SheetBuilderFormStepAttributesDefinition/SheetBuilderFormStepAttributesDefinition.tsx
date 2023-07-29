import React, { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useDispatch } from 'react-redux';
import { setAttribute } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { attributes } from '@/components/SheetBuilder/common/Attributes';
import SheetBuilderFormStepAttributesDefinitionFree from './SheetBuilderFormStepAttributesDefinitionFree';
import SheetBuilderFormStepAttributesDefinitionDice from './SheetBuilderFormStepAttributesDefinitionDice';
import SheetBuilderFormStepAttributesDefinitionPoints from './SheetBuilderFormStepAttributesDefinitionPoints';

type AttributesDefinitionType = 'dice' | 'points' | 'free';

const SheetBuilderFormStepAttributesDefinition = () => {
  const [type, setType] = useState<AttributesDefinitionType>('dice');
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset all attributes
    attributes.forEach((attribute) => {
      dispatch(setAttribute({ attribute, value: 0 }));
    });

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'pending' }));
    const { value } = event.target as HTMLInputElement;
    setType(value as AttributesDefinitionType);
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
