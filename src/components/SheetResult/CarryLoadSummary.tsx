import React from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';

interface CarryLoadSummaryProps {
  usedSpaces: number;
  currencySpaces: number;
  maxSpaces: number;
}

const CONTAINER_SX = { mt: 1 } as const;
const HEADER_SX = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 1,
  flexWrap: 'wrap',
} as const;
const LABEL_SX = { fontWeight: 700, flexShrink: 0 } as const;
const HINT_SX = { color: 'text.secondary' } as const;
const BAR_SX = { height: 8, borderRadius: 1, mt: 0.5 } as const;

/**
 * Carga da mochila. Em Tormenta 20 o limite não é um teto duro: até o limite
 * não há penalidade; entre o limite e o dobro o personagem fica sobrecarregado
 * (−3m de deslocamento); acima do dobro ele não consegue se mover. A barra
 * mostra a faixa em que a ficha está, que é a leitura que importa.
 */
const CarryLoadSummary: React.FC<CarryLoadSummaryProps> = ({
  usedSpaces,
  currencySpaces,
  maxSpaces,
}) => {
  const overloaded = usedSpaces > maxSpaces;
  const immobile = usedSpaces > maxSpaces * 2;

  let color: 'success' | 'warning' | 'error' = 'success';
  if (immobile) color = 'error';
  else if (overloaded) color = 'warning';

  let hint = 'Sem penalidade de carga.';
  if (immobile) hint = 'Acima do dobro do limite: não é possível se mover.';
  else if (overloaded) hint = 'Sobrecarregado: −3m de deslocamento.';

  // A barra enche até o limite; o excesso continua legível pela cor e pelo aviso.
  const percent =
    maxSpaces > 0 ? Math.min(100, (usedSpaces / maxSpaces) * 100) : 0;

  return (
    <Box sx={CONTAINER_SX}>
      <Box sx={HEADER_SX}>
        <Typography variant='body2' sx={LABEL_SX}>
          Espaços: {usedSpaces} / {maxSpaces}
        </Typography>
        <Typography variant='caption' sx={HINT_SX}>
          (sobrecarga até {maxSpaces * 2})
          {currencySpaces > 0 && <> · {currencySpaces} de moedas</>}
        </Typography>
      </Box>
      <Tooltip title={hint} arrow>
        <LinearProgress
          variant='determinate'
          value={percent}
          color={color}
          sx={BAR_SX}
        />
      </Tooltip>
      <Typography
        variant='caption'
        sx={{
          display: 'block',
          mt: 0.5,
          color: overloaded ? `${color}.main` : 'text.secondary',
          fontWeight: overloaded ? 600 : 400,
        }}
      >
        {hint}
      </Typography>
    </Box>
  );
};

export default CarryLoadSummary;
