import React, { useState } from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import styled from '@emotion/styled';
import {
  decrementAttribute,
  incrementAttribute,
  selectAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Attribute, Translator } from 't20-sheet-builder';
import { addSign } from '@/components/SheetBuilder/common/StringHelper';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { attributes } from '../../../common/Attributes';
import border from '../../../../../assets/images/attrBox.svg';
import AttributeInputButton from './AttributeInputButton';

const SheetBuilderFormStepAttributesDefinitionPoints = () => {
  const theme = useTheme();
  const [points, setPoints] = useState(10);

  const dispatch = useAppDispatch();

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

  const getCostBasedOnValue = (value: number) => {
    if (value === 1) return 1;
    if (value === 2) return 1;
    if (value === 3) return 2;
    if (value === 4) return 3;

    return 0;
  };

  const onClickDecrement = (attr: Attribute, currentValue: number) => {
    if (currentValue <= -2) return;

    if (currentValue - 1 === 0) setPoints(points + 1);
    else if (currentValue - 1 === -1) setPoints(points + 1);
    else {
      const cost = getCostBasedOnValue(currentValue);
      const futurePoints = points + cost;
      if (futurePoints < 0) return;
      setPoints(futurePoints);
    }

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(decrementAttribute(attr));
  };

  const onClickIncrement = (attr: Attribute, currentValue: number) => {
    if (currentValue >= 5 || points <= 0) return;

    if (currentValue === -1) {
      setPoints(points - 1);
    } else if (currentValue === 0) {
      setPoints(points - 1);
    } else {
      const cost = getCostBasedOnValue(currentValue + 1);
      const futurePoints = points - cost;
      if (futurePoints < 0) return;
      setPoints(futurePoints);
    }

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(incrementAttribute(attr));
  };

  return (
    <Box>
      <Stack spacing={2} justifyContent='center'>
        <Stack spacing={2} justifyContent='center' alignItems='center'>
          <AttributeLabel>{points}</AttributeLabel>
          <h3>Pontos</h3>
        </Stack>
        <Stack direction='row' spacing={2}>
          {attributes.map((attribute) => {
            const attributeValue = useAppSelector(selectAttribute(attribute));
            return (
              <Stack>
                <h3>{Translator.getAttributeTranslation(attribute)}</h3>
                <AttributeInputButton
                  onClick={() => onClickDecrement(attribute, attributeValue)}
                  disabled={attributeValue <= -1}
                >
                  <RemoveIcon />
                </AttributeInputButton>
                <Stack alignItems='center'>
                  <AttributeLabel key={attribute}>
                    {addSign(attributeValue)}
                  </AttributeLabel>
                </Stack>
                <AttributeInputButton
                  onClick={() => onClickIncrement(attribute, attributeValue)}
                  disabled={attributeValue >= 4}
                >
                  <AddIcon />
                </AttributeInputButton>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default SheetBuilderFormStepAttributesDefinitionPoints;
