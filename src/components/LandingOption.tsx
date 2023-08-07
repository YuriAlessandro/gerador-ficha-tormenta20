import styled from '@emotion/styled';
import { Box, Paper, Stack, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  title: string;
  text: string;
  onClick: () => void;
  image?: string;
  disabled?: boolean;
}

const LandingOption: React.FC<Props> = ({
  title,
  text,
  onClick,
  image,
  disabled,
}) => {
  const theme = useTheme();

  const Option = styled(Paper)`
    padding: 0.7rem;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    color: ${disabled ? '#696969' : 'auto'};
  `;

  const Title = styled.h2`
    color: ${disabled ? '#696969' : theme.palette.primary.main};
    font-family: 'Tfont';
  `;

  return (
    <Option
      elevation={4}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
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
