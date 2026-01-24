import React from 'react';
import { Stack, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import { CharacterAttributes } from '@/interfaces/Character';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';
import { rollD20 } from '../../functions/diceRoller';
import { useDice3D } from '../../contexts/Dice3DContext';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';

type Props = {
  attributes: CharacterAttributes;
  characterName?: string;
};

const AttributeDisplay = ({ attributes, characterName }: Props) => {
  const theme = useTheme();
  const { settings, roll3D, isReady } = useDice3D();
  const { showDiceResult } = useDiceRoll();

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

    const total = Math.max(1, d20Roll + modifier);
    const isCritical = d20Roll === 20;
    const isFumble = d20Roll === 1;

    // Format dice notation with sign
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const diceNotation = `1d20${modifierStr}`;

    showDiceResult(
      `Teste de ${attributeName}`,
      [
        {
          label: attributeName,
          diceNotation,
          rolls: [d20Roll],
          modifier,
          total,
          isCritical,
          isFumble,
        },
      ],
      characterName
    );
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
