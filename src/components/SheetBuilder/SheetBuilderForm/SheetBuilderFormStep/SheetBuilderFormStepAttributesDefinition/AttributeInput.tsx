import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';
import {
  selectAttribute,
  decrementAttribute,
  incrementAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AttributeInputButton from './AttributeInputButton';

type Props = {
  attribute: Attribute;
};

const AttributeInput = ({ attribute }: Props) => {
  const dispatch = useAppDispatch();
  const attributeValue = useAppSelector(selectAttribute(attribute));
  return (
    <div className='flex flex-col items-center mb-6'>
      <label className='text-sm mb-2' htmlFor={`${attribute}-input`}>
        {Translator.getAttributeTranslation(attribute)}
      </label>
      <div className='flex flex-row'>
        <AttributeInputButton
          onClick={() => dispatch(decrementAttribute(attribute))}
        >
          <RemoveIcon />
        </AttributeInputButton>
        <TextField
          disabled
          type='number'
          value={attributeValue}
          id={`${attribute}-input`}
          sx={{ width: '80px' }}
        />
        <AttributeInputButton
          onClick={() => dispatch(incrementAttribute(attribute))}
        >
          <AddIcon />
        </AttributeInputButton>
      </div>
    </div>
  );
};

export default AttributeInput;
