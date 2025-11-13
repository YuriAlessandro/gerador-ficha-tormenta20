import React from 'react';
import { Stack, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';

import styled from '@emotion/styled';
import { CharacterAttributes } from '@/interfaces/Character';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';
import { rollD20 } from '../../functions/diceRoller';
import { AttributeRollData } from './notifications/AttributeRollNotification';

type Props = {
  attributes: CharacterAttributes;
};

const AttributeDisplay = ({ attributes }: Props) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const Title = styled.span`
    font-family: 'Tfont';
    font-size: 10px;
  `;

  const NumberDisplay = styled.span`
    font-family: 'Tfont';
    font-size: 50px;
    color: ${theme.palette.primary.main};
    cursor: pointer;
    user-select: none;
    text-decoration: underline dotted;
    transition: all 0.2s ease;

    &:hover {
      color: ${theme.palette.primary.dark};
      text-decoration: underline solid;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  `;

  const handleAttributeClick = (attributeName: string, modifier: number) => {
    const d20Roll = rollD20();
    const total = d20Roll + modifier;

    const rollData: AttributeRollData = {
      attributeName,
      d20Roll,
      modifier,
      total,
    };

    enqueueSnackbar('', {
      variant: 'attributeCheck',
      roll: rollData,
    });
  };

  return (
    <Stack spacing={2} direction='row' flexWrap='wrap' justifyContent='center'>
      {Object.entries(attributes).map(([attribute, value]) => {
        const label = attribute;
        return (
          <FancyBox key={attribute}>
            <NumberDisplay
              onClick={() => handleAttributeClick(label, value.mod)}
              title={`Rolar teste de ${label}`}
            >
              {addSign(value.mod)}
            </NumberDisplay>
            <Title>{label}</Title>
          </FancyBox>
        );
      })}
    </Stack>
  );
};

export default AttributeDisplay;
