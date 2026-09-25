import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface CompactStepProgressProps {
  /** Índice 0-based do passo atual. Valores fora do intervalo são limitados. */
  activeStep: number;
  /** Rótulos dos passos, na ordem. */
  steps: string[];
}

/**
 * Progresso de um fluxo em passos para telas estreitas: "Passo 3 de 12", o
 * nome do passo e uma barra. Substitui o `Stepper` no mobile, onde uma fila
 * de 12 rótulos não cabe e um stepper vertical ocupa a tela inteira.
 */
const CompactStepProgress: React.FC<CompactStepProgressProps> = ({
  activeStep,
  steps,
}) => {
  if (steps.length === 0) return null;

  const current = Math.min(Math.max(activeStep, 0), steps.length - 1);
  const position = `Passo ${current + 1} de ${steps.length}`;
  const label = steps[current];

  return (
    <Box>
      <Typography
        variant='caption'
        component='p'
        sx={{ color: 'text.secondary' }}
      >
        {position}
      </Typography>
      <Typography variant='subtitle1' noWrap sx={{ fontWeight: 600, mb: 1 }}>
        {label}
      </Typography>
      <LinearProgress
        variant='determinate'
        value={Math.round(((current + 1) / steps.length) * 100)}
        aria-label={`${position}: ${label}`}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

export default CompactStepProgress;
