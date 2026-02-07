import React from 'react';
import { Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface AlreadyInstalledCardProps {
  wasJustInstalled: boolean;
}

const AlreadyInstalledCard: React.FC<AlreadyInstalledCardProps> = ({
  wasJustInstalled,
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 4,
      textAlign: 'center',
      borderRadius: 3,
    }}
  >
    <CheckCircleOutlineIcon
      sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
    />
    <Typography
      variant='h5'
      sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 1 }}
    >
      {wasJustInstalled
        ? 'App instalado com sucesso!'
        : 'Você já está usando o app!'}
    </Typography>
    <Typography variant='body1' color='text.secondary'>
      {wasJustInstalled
        ? 'Agora você pode encontrar o Fichas de Nimb na sua tela inicial.'
        : 'O Fichas de Nimb já está instalado no seu dispositivo.'}
    </Typography>
  </Paper>
);

export default AlreadyInstalledCard;
