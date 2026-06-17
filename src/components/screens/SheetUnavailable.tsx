import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface SheetUnavailableProps {
  /** Quantos suplementos runtime (homebrews) inativos a ficha exige. */
  count: number;
}

/**
 * Bloco exibido quando uma ficha depende de conteúdo runtime (homebrews) que
 * não está ativo no momento. Impede a renderização da ficha — fundamental para
 * os limites de ativação: o usuário precisa reativar o conteúdo (ou liberar um
 * slot) para abrir a ficha.
 */
const SheetUnavailable: React.FC<SheetUnavailableProps> = ({ count }) => (
  <Box
    display='flex'
    flexDirection='column'
    justifyContent='center'
    alignItems='center'
    minHeight='50vh'
    textAlign='center'
    px={3}
    gap={2}
  >
    <Typography variant='h6'>Ficha indisponível</Typography>
    <Typography color='text.secondary' maxWidth={520}>
      Esta ficha usa {count} homebrew(s) que não estão ativos no momento. Ative
      o(s) homebrew(s) necessário(s) para abri-la.
    </Typography>
    <Typography variant='body2'>
      <Link to='/meus-homebrews'>Ir para Meus Homebrews</Link>
    </Typography>
  </Box>
);

export default SheetUnavailable;
