import React from 'react';
import styled from '@emotion/styled';

import { useTheme } from '@mui/material';
import lineBgRaw from '@/assets/images/fndLineBorder.svg?raw';
import { useDynamicSvg } from '@/hooks/useDynamicSvg';

type LabelSize = 'small' | 'medium' | 'large';

interface Props {
  title?: string;
  text: React.ReactNode;
  size: LabelSize;
}

interface ThemeProp {
  theme: {
    palette: {
      primary: {
        main: string;
      };
    };
  };
}

// Props transientes com `$`: o @emotion/styled filtra props inválidas para
// tags HTML, então nada disso vaza como atributo do <div>.
interface ContainerProps {
  $size: LabelSize;
  $lineBgUrl?: string;
}

const FONT_SIZE: Record<LabelSize, string> = {
  small: '16px',
  medium: '20px',
  large: '24px',
};

// Mobile: mesmo corte de 768px usado pelo Result. Reduz corpo e respiro para
// que nomes longos ocupem menos linhas na largura do celular.
const MOBILE_FONT_SIZE: Record<LabelSize, string> = {
  small: '14px',
  medium: '16px',
  large: '20px',
};

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: nowrap;
  /* Item de flex tem min-width:auto, ou seja, piso = min-content. Sem isto o
     container se recusa a encolher abaixo da largura do texto inteiro e
     estoura o card (no mobile, para os dois lados, porque a Stack pai
     centraliza). */
  min-width: 0;
  font-size: ${(props) => FONT_SIZE[props.$size]};
  padding: ${(props) => (props.$size === 'large' ? '0 0 25px 15px' : '0')};
  background: ${(props) =>
      props.$lineBgUrl ? `url("${props.$lineBgUrl}")` : 'none'}
    bottom left no-repeat;
  /* NÃO usar cover: fndLineBorder.svg só tem viewBox (sem width/height),
     então tem proporção intrínseca mas não tamanho — cover o ampliaria muito
     além da caixa. "100% auto" ancora a linha decorativa na base do bloco,
     com 1 ou com N linhas. */
  background-size: 100% auto;

  @media (max-width: 768px) {
    font-size: ${(props) => MOBILE_FONT_SIZE[props.$size]};
    padding: ${(props) => (props.$size === 'large' ? '0 0 16px 8px' : '0')};
  }
`;

const ContainerTitle = styled.span<ThemeProp>`
  font-family: 'Tfont';
  font-weight: bold;
  margin-right: 0.5rem;
  color: ${(props) => props.theme.palette.primary.main};
  /* O rótulo nunca quebra nem encolhe; só o valor quebra. */
  flex-shrink: 0;
  white-space: nowrap;
`;

const ContainerText = styled.span`
  min-width: 0;
  /* Quebra em várias linhas em vez de truncar: o card cresce em altura e o
     texto completo fica legível no celular. "anywhere" (e não "break-word")
     porque só ele zera o min-content, que é o que fazia a caixa estourar. */
  white-space: normal;
  overflow-wrap: anywhere;
`;

const LabelDisplay: React.FC<Props> = ({ title, text, size }) => {
  const theme = useTheme();
  const dynamicLineBgUrl = useDynamicSvg(lineBgRaw);

  return (
    <Container
      $size={size}
      $lineBgUrl={size === 'large' ? dynamicLineBgUrl : undefined}
    >
      {title && <ContainerTitle theme={theme}>{title}: </ContainerTitle>}
      <ContainerText>{text}</ContainerText>
    </Container>
  );
};

export default LabelDisplay;
