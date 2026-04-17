import React from 'react';
import { Stack, Box, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import { CharacterAttributes } from '@/interfaces/Character';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';
import { rollD20 } from '../../functions/diceRoller';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';
import { ConditionMarker } from '../../premium/components/Conditions';
import type { ActiveCondition } from '../../premium/interfaces/ActiveCondition';
import { getConditionLabelStyle } from '../../premium/functions/conditionHighlights';

type Props = {
  attributes: CharacterAttributes;
  characterName?: string;
  attributeHighlights?: Partial<Record<Atributo, ActiveCondition[]>>;
};

const AttributeDisplay = ({
  attributes,
  characterName,
  attributeHighlights,
}: Props) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();

  const Title = styled.span`
    font-family: 'Tfont';
    font-size: 12px;
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
    // Roll the d20 locally - 3D animation will be handled by showDiceResult
    const d20Roll = rollD20();
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
        const attrConditions = attributeHighlights?.[attribute as Atributo];
        const labelStyle = getConditionLabelStyle(attrConditions);
        return (
          <FancyBox key={attribute}>
            <NumberDisplay
              onClick={() => handleAttributeClick(label, value.value)}
              title={`Rolar teste de ${label}`}
              style={labelStyle}
            >
              {addSign(value.value)}
            </NumberDisplay>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                ...labelStyle,
              }}
            >
              <ConditionMarker conditions={attrConditions} fontSize='inherit' />
              <Title>{label}</Title>
            </Box>
          </FancyBox>
        );
      })}
    </Stack>
  );
};

export default AttributeDisplay;
