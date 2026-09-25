import styled from '@emotion/styled';
import React from 'react';

import { useAccentSectionBg } from '@/hooks/useAccentSectionBg';

/**
 * O `styled.h1` fica no escopo do MÓDULO de propósito.
 *
 * Ele já morou dentro do corpo do componente, e ali o emotion gerava uma classe
 * nova a cada render — o que era tolerável quando existiam ~7 títulos fixos na
 * ficha e deixou de ser quando o layout passou a ser configurável e o número de
 * títulos virou escolha do usuário.
 *
 * `bg` e `titleColor` não vazam para o DOM: para tags de string o
 * `@emotion/styled` filtra props pelo `@emotion/is-prop-valid`.
 */
const Title = styled.h1<{ bg: string; titleColor?: string }>`
  text-align: center;
  font-family: 'Tfont';
  color: ${({ titleColor }) => titleColor ?? 'white'};
  background-image: url(${({ bg }) => bg});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
`;

export interface BookTitleProps {
  children: React.ReactNode;
  /** Cor vinda do layout do usuário. Sem ela, o branco histórico. */
  color?: string;
  /** Ícone antes do texto, na mesma cor dele (escolhido no editor de layout). */
  icon?: React.ReactNode;
}

const BookTitle: React.FC<BookTitleProps> = ({ children, color, icon }) => {
  const sectionBg = useAccentSectionBg();

  return (
    <Title bg={sectionBg} titleColor={color}>
      {icon}
      {children}
    </Title>
  );
};

export default BookTitle;
