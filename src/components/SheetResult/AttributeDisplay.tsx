import React from 'react';
import { Stack, Box, Tooltip, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { CharacterAttributes } from '@/interfaces/Character';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';
import { rollD20 } from '../../functions/diceRoller';
import { useDiceRoll } from '../../premium/hooks/useDiceRoll';
import { ConditionMarker } from '../../premium/components/Conditions';
import type { ActiveCondition } from '../../premium/interfaces/ActiveCondition';
import { getConditionLabelStyle } from '../../premium/functions/conditionHighlights';
import { getConditionAttributeModifier } from '../../premium/functions/conditionAttributeModifier';

type Props = {
  attributes: CharacterAttributes;
  characterName?: string;
  attributeHighlights?: Partial<Record<Atributo, ActiveCondition[]>>;
  sheet?: CharacterSheet;
};

const AttributeDisplay = ({
  attributes,
  characterName,
  attributeHighlights,
  sheet,
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
    // Penalidade por condição ativa (Esmorecido, Frustrado, Fraco, Debilitado, etc.)
    // — atributos não são mutados; a penalidade é aplicada apenas no roll do teste.
    const conditionPenalty = sheet
      ? getConditionAttributeModifier(
          sheet.activeConditions,
          sheet,
          attributeName as Atributo
        )
      : 0;

    const effectiveModifier = modifier + conditionPenalty;
    const d20Roll = rollD20();
    const total = Math.max(1, d20Roll + effectiveModifier);
    const isCritical = d20Roll === 20;
    const isFumble = d20Roll === 1;

    const baseStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const penaltyStr =
      conditionPenalty !== 0
        ? `${conditionPenalty >= 0 ? '+' : ''}${conditionPenalty}`
        : '';
    const diceNotation = `1d20${baseStr}${penaltyStr}`;

    showDiceResult(
      `Teste de ${attributeName}`,
      [
        {
          label: attributeName,
          diceNotation,
          rolls: [d20Roll],
          modifier: effectiveModifier,
          total,
          isCritical,
          isFumble,
        },
      ],
      characterName
    );
  };

  return (
    <Stack
      direction='row'
      flexWrap='wrap'
      justifyContent='center'
      sx={{
        rowGap: { xs: 1, sm: 2 },
        columnGap: { xs: 1, sm: 2 },
      }}
    >
      {Object.entries(attributes).map(([attribute, value]) => {
        const label = attribute;
        const attrConditions = attributeHighlights?.[attribute as Atributo];
        const labelStyle = getConditionLabelStyle(attrConditions);
        // Override puramente visual: mostra `valorBase + penalidade` quando há
        // condição ativa afetando este atributo. NÃO altera o valor persistido
        // na ficha — `value.value` permanece o base, e a penalidade é re-derivada
        // de `sheet.activeConditions` em todo render.
        const conditionPenalty = sheet
          ? getConditionAttributeModifier(
              sheet.activeConditions,
              sheet,
              attribute as Atributo
            )
          : 0;
        const displayedValue = value.value + conditionPenalty;
        const hasDelta = conditionPenalty !== 0;
        const deltaColor =
          conditionPenalty < 0
            ? theme.palette.error.main
            : theme.palette.success.main;
        return (
          <Box
            key={attribute}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
            }}
          >
            <FancyBox>
              <NumberDisplay
                onClick={() => handleAttributeClick(label, value.value)}
                title={`Rolar teste de ${label}`}
                style={labelStyle}
              >
                {addSign(displayedValue)}
              </NumberDisplay>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  ...labelStyle,
                }}
              >
                <ConditionMarker
                  conditions={attrConditions}
                  fontSize='inherit'
                />
                <Title>{label}</Title>
              </Box>
            </FancyBox>
            {hasDelta && (
              <Tooltip
                title={`Base ${addSign(value.value)} → ${addSign(
                  displayedValue
                )}`}
                arrow
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    px: 0.75,
                    py: 0.1,
                    borderRadius: 1,
                    backgroundColor: `${deltaColor}22`,
                    color: deltaColor,
                    fontFamily: 'Tfont',
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    border: `1px solid ${deltaColor}55`,
                  }}
                >
                  {addSign(conditionPenalty)}
                </Box>
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default AttributeDisplay;
