import React from 'react';
import { Attribute, Translator } from 't20-sheet-builder';
import {
  selectAttribute,
  decrementAttribute,
  incrementAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import AttributeInputButton from './AttributeInputButton';

import border from '../../../../../assets/images/attrBox.svg';

type Props = {
  attribute: Attribute;
};

const AttributeInput = ({ attribute }: Props) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const attributeValue = useAppSelector(selectAttribute(attribute));

  const onClickDecrement = () => {
    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(decrementAttribute(attribute));
  };

  const onClickIncrement = () => {
    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(incrementAttribute(attribute));
  };

  const AttributeLabel = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    width: 120px;
    height: 120px;
    text-align: center;
    color: ${theme.palette.primary.main};
    background-image: url(${border});
    background-size: fill;
    background-repeat: no-repeat;
    background-position: center;
    font-size: 3rem;
    font-family: 'Tfont';
  `;

  return (
    <div className='flex flex-col items-center mb-6'>
      <h3 className='mb-2'>{Translator.getAttributeTranslation(attribute)}</h3>
      <div className='flex flex-col items-center'>
        <AttributeInputButton onClick={onClickDecrement}>
          <RemoveIcon />
        </AttributeInputButton>
        <AttributeLabel>{attributeValue}</AttributeLabel>
        <AttributeInputButton onClick={onClickIncrement}>
          <AddIcon />
        </AttributeInputButton>
      </div>
    </div>
  );
};

export default AttributeInput;
