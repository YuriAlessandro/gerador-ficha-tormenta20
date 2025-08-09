import styled from '@emotion/styled';
import { Box, Card, Typography, useTheme, useMediaQuery } from '@mui/material';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        cursor: disabled ? 'default' : 'pointer',
        background: '#FFF',
        backgroundImage: image ? `url(${image})` : '',
        backgroundSize: isMobile ? 'cover' : '150%',
        backgroundPosition: isMobile ? 'center center' : 'center',
        height: full ? '100%' : 'auto',
        minHeight: {
          xs: full ? '250px' : '180px', // Smaller on mobile
          sm: full ? '300px' : '200px', // Medium on tablet
          md: full ? '350px' : '220px', // Full size on desktop
        },
        maxHeight: {
          xs: full ? 'none' : '180px',
          sm: full ? 'none' : '200px',
          md: full ? 'none' : '220px',
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundRepeat: 'no-repeat',
        alignItems: 'flex-start',
        transition: 'all 0.3s ease-in-out',
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          ...(disabled
            ? {}
            : {
                backgroundSize: isMobile ? 'cover' : '200%',
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }),
        },
      }}
    >
      <Box
        sx={{
          background: image
            ? 'linear-gradient(180deg,rgba(71, 68, 68, 0) 0%, rgba(71, 68, 68, 0.9) 70%)'
            : '',
          p: { xs: 1.5, sm: 2 },
          width: '100%',
        }}
      >
        <Title
          style={{
            fontSize: isMobile ? '18px' : '24px',
            margin: '0 0 8px 0',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Title>
        <Typography
          color={image ? 'white' : 'black'}
          sx={{
            fontSize: { xs: '13px', sm: '14px', md: '16px' },
            lineHeight: 1.3,
            maxWidth: '95%',
            display: '-webkit-box',
            WebkitLineClamp: isMobile ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </Typography>
      </Box>
    </Card>
  );
};

export default LandingOption;
