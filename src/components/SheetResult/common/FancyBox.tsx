import { Box, useTheme } from '@mui/material';
import React from 'react';
import attrBox from '@/assets/images/attrBox.svg';
import attrBoxDark from '@/assets/images/attrBoxDark.svg';

const FancyBox: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  const isDarkTheme = useTheme().palette.mode === 'dark';

  return (
    <Box
      onClick={onClick}
      sx={{
        width: '30px',
        height: '80px',
        p: 5,
        backgroundImage: `url(${isDarkTheme ? attrBoxDark : attrBox})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
};

export default FancyBox;
