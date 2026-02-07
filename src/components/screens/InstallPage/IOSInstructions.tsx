import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CheckIcon from '@mui/icons-material/Check';

interface StepProps {
  stepNumber: number;
  icon: React.ReactNode;
  text: string;
}

const Step: React.FC<StepProps> = ({ stepNumber, icon, text }) => (
  <Stack direction='row' alignItems='center' spacing={2} sx={{ py: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
      }}
    >
      {stepNumber}
    </Box>
    <Box sx={{ color: 'primary.main', flexShrink: 0 }}>{icon}</Box>
    <Typography variant='body1' sx={{ textAlign: 'left' }}>
      {text}
    </Typography>
  </Stack>
);

const IOSInstructions: React.FC = () => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      bgcolor: 'action.hover',
      borderRadius: 2,
    }}
  >
    <Typography
      variant='subtitle2'
      color='text.secondary'
      sx={{ mb: 1, textAlign: 'left' }}
    >
      Siga estes passos no Safari:
    </Typography>
    <Step
      stepNumber={1}
      icon={<IosShareIcon />}
      text='Toque no ícone de compartilhar na barra do navegador'
    />
    <Step
      stepNumber={2}
      icon={<AddBoxOutlinedIcon />}
      text="Role para baixo e toque em 'Adicionar à Tela de Início'"
    />
    <Step
      stepNumber={3}
      icon={<CheckIcon />}
      text="Toque em 'Adicionar' no canto superior direito"
    />
  </Paper>
);

export default IOSInstructions;
