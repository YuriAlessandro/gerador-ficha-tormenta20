import React from 'react';
import { Stack, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';

import styled from '@emotion/styled';
import { CharacterAttributes } from '@/interfaces/Character';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';
import { rollD20 } from '../../functions/diceRoller';
import { AttributeRollData } from './notifications/AttributeRollNotification';
import { useDice3D } from '../../contexts/Dice3DContext';

type Props = {
  attributes: CharacterAttributes;
};

const AttributeDisplay = ({ attributes }: Props) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { settings, roll3D, isReady } = useDice3D();

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

  const handleAttributeClick = async (
    attributeName: string,
    modifier: number
  ) => {
    let d20Roll: number;

    // Try to use 3D dice if enabled
    if (settings.enabled && isReady) {
      try {
        const results = await roll3D('1d20');
        d20Roll = results[0]?.value || rollD20();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('3D dice roll failed, falling back to 2D:', error);
        d20Roll = rollD20();
      }
    } else {
      d20Roll = rollD20();
    }

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
