import React from 'react';
import { Stack, useTheme } from '@mui/material';

import styled from '@emotion/styled';
import { CharacterAttributes } from '@/interfaces/Character';
import { addSign } from './common/StringHelper';
import FancyBox from './common/FancyBox';

type Props = {
  attributes: CharacterAttributes;
};

const AttributeDisplay = ({ attributes }: Props) => {
  const Title = styled.span`
    font-family: 'Tfont';
    font-size: 10px;
  `;

  const NumberDisplay = styled.span`
    font-family: 'Tfont';
    font-size: 50px;
    color: ${useTheme().palette.primary.main};
  `;

  return (
    <Stack spacing={2} direction='row' flexWrap='wrap' justifyContent='center'>
      {Object.entries(attributes).map(([attribute, value]) => {
        const label = attribute;
        return (
          <FancyBox key={attribute}>
            <NumberDisplay>{addSign(value.mod)}</NumberDisplay>
            <Title>{label}</Title>
          </FancyBox>
        );
      })}
    </Stack>
  );
};

export default AttributeDisplay;
