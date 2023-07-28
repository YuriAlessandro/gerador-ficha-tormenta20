import React from 'react';
import { Attribute, Attributes, Translator } from 't20-sheet-builder';
import { Stack, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import { useSnackbar } from 'notistack';
import { rollDice } from '@/functions/randomUtils';
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import { addSign } from '../common/StringHelper';
import FancyBox from '../common/FancyBox';

type Props = {
  attributes: Attributes;
};

const SheetPreviewAttributes = ({ attributes }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const Title = styled.span`
    font-family: 'Tfont';
    font-size: 10px;
  `;

  const NumberDisplay = styled.span`
    font-family: 'Tfont';
    font-size: 50px;
    color: ${useTheme().palette.primary.main};
  `;

  const onClickAttr = (attr: string, bonus: number) => {
    const rollResult = rollDice(1, 20);

    const audio = new Audio(diceSound);
    audio.play();

    enqueueSnackbar(`${attr}`, {
      variant: 'diceRoll',
      persist: true,
      bonus,
      rollResult,
    });
  };

  return (
    <Stack spacing={2} direction='row' flexWrap='wrap' justifyContent='center'>
      {Object.entries(attributes).map(([attribute, value]) => {
        const label = Translator.getAttributeTranslation(
          attribute as Attribute
        );
        return (
          <FancyBox
            key={attribute as Attribute}
            onClick={() => onClickAttr(label, value)}
          >
            <NumberDisplay>{addSign(value)}</NumberDisplay>
            <Title>{label}</Title>
          </FancyBox>
        );
      })}
    </Stack>
  );
};

export default SheetPreviewAttributes;
