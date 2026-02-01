import { Box, useTheme } from '@mui/material';
import React from 'react';
import attrBoxRaw from '@/assets/images/attrBox.svg?raw';
import attrBoxDarkRaw from '@/assets/images/attrBoxDark.svg?raw';
import { useDynamicSvg } from '@/hooks/useDynamicSvg';

const FancyBox: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  const isDarkTheme = useTheme().palette.mode === 'dark';
  const svgContent = isDarkTheme ? attrBoxDarkRaw : attrBoxRaw;
  const dynamicSvgUrl = useDynamicSvg(svgContent);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: '30px',
        height: '80px',
        p: 5,
        backgroundImage: `url("${dynamicSvgUrl}")`,
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
