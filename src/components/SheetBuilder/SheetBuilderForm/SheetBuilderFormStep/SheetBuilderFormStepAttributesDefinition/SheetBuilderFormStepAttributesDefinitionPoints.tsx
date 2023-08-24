import React from 'react';
import { addSign } from '@/components/SheetBuilder/common/StringHelper';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  buyAttribute,
  selectAttribute,
  selectInitialAttributesRemainingPoints,
  sellAttribute,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Stack, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { Attribute, Translator } from 't20-sheet-builder';
import border from '../../../../../assets/images/attrBox.svg';
import { attributes } from '../../../common/Attributes';
import AttributeInputButton from './AttributeInputButton';

const SheetBuilderFormStepAttributesDefinitionPoints = () => {
  const theme = useTheme();
  const points = useSelector(selectInitialAttributesRemainingPoints) ?? 10;
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

  const calcPointsOnSell = (currentValue: number) => {
    if (currentValue - 1 === 0) return points + 1;
    if (currentValue - 1 === -1) return points + 1;

    const cost = getCostBasedOnValue(currentValue);
    const futurePoints = points + cost;
    return futurePoints;
  };

  const onClickDecrement = (attr: Attribute, currentValue: number) => {
    if (currentValue <= -2) return;
    const futurePoints = calcPointsOnSell(currentValue);
    if (futurePoints < 0) return;

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(sellAttribute({ attribute: attr, remainingPoints: futurePoints }));
  };

  const calcPointsOnBuy = (currentValue: number) => {
    if (currentValue === -1) {
      return points - 1;
    }
    if (currentValue === 0) {
      return points - 1;
    }
    const cost = getCostBasedOnValue(currentValue + 1);
    const futurePoints = points - cost;
    return futurePoints;
  };

  const onClickIncrement = (attr: Attribute, currentValue: number) => {
    if (currentValue >= 5 || points <= 0) return;
    const futurePoints = calcPointsOnBuy(currentValue);
    if (futurePoints < 0) return;

    dispatch(setOptionReady({ key: 'isAttrReady', value: 'confirmed' }));
    dispatch(buyAttribute({ attribute: attr, remainingPoints: futurePoints }));
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
              <Stack key={attribute}>
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
