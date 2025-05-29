import styled from '@emotion/styled';
import { Box, Card, Typography, useTheme } from '@mui/material';
import React from 'react';

interface Props {
  title: string;
  text: string;
  onClick: () => void;
  image?: string;
  disabled?: boolean;
  full?: boolean;
}

const LandingOption: React.FC<Props> = ({
  title,
  text,
  onClick,
  image,
  disabled,
  full = false,
}) => {
  const theme = useTheme();

  const Title = styled.h2`
    color: ${disabled ? '#696969' : theme.palette.primary.main};
    font-family: 'Tfont';
    text-shadow: ${image ? '2px 2px 4px rgba(0, 0, 0, 0.5)' : 'none'};
  `;

  return (
    <Card
      onClick={() => {
        if (!disabled) onClick();
      }}
      sx={{
        cursor: 'pointer',
        background: '#FFF',
        backgroundImage: image ? `url(${image})` : '',
        backgroundSize: '150%',
        backgroundPosition: 'center',
        height: full ? '100%' : 'auto',
        minHeight: full ? '350px' : '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundRepeat: 'no-repeat',
        alignItems: 'flex-start',
        transition: 'all 1.5s',
        '&:hover': {
          backgroundSize: '200%',
        },
      }}
    >
      <Box
        sx={{
          background: image
            ? 'linear-gradient(180deg,rgba(71, 68, 68, 0) 10%, rgba(71, 68, 68, 0.8) 50%)'
            : '',
          p: 2,
          width: '100%',
        }}
      >
        <Title>{title}</Title>
        <Typography color={image ? 'white' : 'black'} maxWidth='90%'>
          {text}
        </Typography>
      </Box>
    </Card>
  );
};

export default LandingOption;
