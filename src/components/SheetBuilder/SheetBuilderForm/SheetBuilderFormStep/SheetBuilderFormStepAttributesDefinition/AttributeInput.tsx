import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';
import AttributeInputButton from './AttributeInputButton';
import {
  selectAttribute,
  decrementAttribute,
  incrementAttribute,
} from '../../../../../store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';

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
          side='left'
          onClick={() => dispatch(decrementAttribute(attribute))}
        >
          -
        </AttributeInputButton>
        <input
          disabled
          type='number'
          value={attributeValue}
          id={`${attribute}-input`}
          className='text-slate-900 w-8 text-center bg-white'
        />
        <AttributeInputButton
          side='right'
          onClick={() => dispatch(incrementAttribute(attribute))}
        >
          +
        </AttributeInputButton>
      </div>
    </div>
  );
};

export default AttributeInput;
