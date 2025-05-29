import styled from '@emotion/styled';
import React from 'react';

import sectionBg from '@/assets/images/sectionBg.png';

const BookTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const Title = styled.h1`
    text-align: center;
    font-family: 'Tfont';
    color: white;
    background-image: url(${sectionBg});
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
  `;

  return <Title>{children}</Title>;
};

export default BookTitle;
