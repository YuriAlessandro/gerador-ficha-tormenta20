import React from 'react';
import styled from '@emotion/styled';

import lineBgRaw from '@/assets/images/fndLineBorder.svg?raw';
import { useTheme } from '@mui/material';
import { useDynamicSvg } from '@/hooks/useDynamicSvg';

interface Props {
  title?: string;
  text: string;
  size: 'small' | 'medium' | 'large';
}

const LabelDisplay: React.FC<Props> = ({ title, text, size }) => {
  const theme = useTheme();
  const dynamicLineBgUrl = useDynamicSvg(lineBgRaw);

  const Container = styled.div`
    align-items: flex-start;
    justify-content: flex-start;
    heigth: ${() => {
      if (size === 'small') return '40px';
      if (size === 'medium') return '60px';
      return '100px';
    }};
    display: flex;
    background: ${size === 'large' ? `url("${dynamicLineBgUrl}")` : 'none'}
      bottom left no-repeat;
    backgrounb-size: cover;
    font-size: ${() => {
      if (size === 'small') return '16px';
      if (size === 'medium') return '20px';
      return '24px;';
    }};
    padding: ${() => {
      if (size === 'large') return '0 0 25px 15px';
      return '0';
    }};
    flex-wrap: no-wrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const ContainerTitle = styled.span`
    font-family: 'Tfont';
    font-weight: bold;
    margin-right: 0.5rem;
    color: ${theme.palette.primary.main};
  `;

  return (
    <>
      <Container>
        {title && <ContainerTitle>{title}: </ContainerTitle>}
        <span>{text}</span>
      </Container>
    </>
  );
};

export default LabelDisplay;
