import React from 'react';
import { Attribute, Attributes, Translator } from 't20-sheet-builder';
import { Stack, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import { useSnackbar } from 'notistack';
import { rollDice } from '@/functions/randomUtils';
import diceSound from '@/assets/sounds/dice-rolling.mp3';
import { addSign, addSignForRoll } from '../common/StringHelper';
import FancyBox from '../common/FancyBox';
import DiceRollerActions from '../common/DiceRollerActions';

type Props = {
  attributes: Attributes;
};

const SheetPreviewAttributes = ({ attributes }: Props) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
    const total = rollResult + bonus;

    const action = (snackbarId: number) => (
      <DiceRollerActions
        snackbarId={snackbarId}
        closeSnackbar={closeSnackbar}
      />
    );

    let variant: 'default' | 'success' | 'error' = 'default';
    if (rollResult === 20) variant = 'success';
    if (rollResult === 1) variant = 'error';

    const audio = new Audio(diceSound);
    audio.play();
    enqueueSnackbar(
      `Rolagem de ${attr}: ${total} = ${rollResult}${addSignForRoll(bonus)}`,
      {
        action,
        variant,
      }
    );
  };

  return (
    <Stack spacing={2} direction='row' flexWrap='wrap' justifyContent='center'>
      {Object.entries(attributes).map(([attribute, value]) => {
        const label = Translator.getAttributeTranslation(
          attribute as Attribute
        );
        return (
          <FancyBox onClick={() => onClickAttr(label, value)}>
            <NumberDisplay>{addSign(value)}</NumberDisplay>
            <Title>{label}</Title>
          </FancyBox>
        );
      })}
    </Stack>
  );
};

export default SheetPreviewAttributes;
