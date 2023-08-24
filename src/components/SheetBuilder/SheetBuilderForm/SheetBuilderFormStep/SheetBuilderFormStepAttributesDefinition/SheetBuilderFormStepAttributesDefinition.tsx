import { resetAttributes } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import SheetBuilderFormStepAttributesDefinitionDice from './SheetBuilderFormStepAttributesDefinitionDice';
import SheetBuilderFormStepAttributesDefinitionFree from './SheetBuilderFormStepAttributesDefinitionFree';
import SheetBuilderFormStepAttributesDefinitionPoints from './SheetBuilderFormStepAttributesDefinitionPoints';

type AttributesDefinitionType = 'dice' | 'points' | 'free';

const SheetBuilderFormStepAttributesDefinition = () => {
  const [type, setType] = useState<AttributesDefinitionType>('dice');
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(resetAttributes());
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
