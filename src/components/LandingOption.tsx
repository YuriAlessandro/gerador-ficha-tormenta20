import styled from '@emotion/styled';
import { Box, Paper, Stack, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  title: string;
  text: string;
  onClick: () => void;
  image?: string;
}

const LandingOption: React.FC<Props> = ({ title, text, onClick, image }) => {
  const theme = useTheme();

  const Option = styled(Paper)`
    padding: 0.7rem;
    cursor: pointer;
  `;

  const Title = styled.h4`
    color: ${theme.palette.primary.main};
    font-family: 'Tfont';
  `;

  return (
    <Option elevation={4} onClick={onClick}>
      <Stack direction='row' justifyContent='space-between'>
        <Box>
          <Title>{title}</Title>
          <p>{text}</p>
        </Box>
        <Box
          sx={{
            width: '30%',
            backgroundImage: `url(${image})`,
            backgroundPosition: 'top',
            backgroundSize: 'cover',
          }}
        />
      </Stack>
    </Option>
  );
};

export default LandingOption;
