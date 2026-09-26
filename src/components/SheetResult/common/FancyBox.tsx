import { Box, useTheme } from '@mui/material';
import React from 'react';
import attrBoxRaw from '@/assets/images/attrBox.svg?raw';
import attrBoxDarkRaw from '@/assets/images/attrBoxDark.svg?raw';
import { useDynamicSvg } from '@/hooks/useDynamicSvg';

const FancyBox: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  /**
   * Abaixo de `md`, moldura menor e com o SVG escalado, para caberem três
   * por linha. Só para conteúdo que também encolhe (os atributos); Defesa,
   * Deslocamento e Tamanho usam fonte grande e ficam no tamanho padrão.
   */
  compactOnMobile?: boolean;
}> = ({ children, onClick, compactOnMobile = false }) => {
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
        ...(compactOnMobile && {
          p: { xs: 4, md: 5 },
          height: { xs: '76px', md: '80px' },
          backgroundSize: { xs: 'contain', md: 'auto' },
        }),
      }}
    >
      {children}
    </Box>
  );
};

export default FancyBox;
