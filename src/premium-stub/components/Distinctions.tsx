/* eslint-disable */
import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Link } from 'react-router-dom';
import { NullComponent } from '../_inert';
import TormentaTitle from '../../components/Database/TormentaTitle';

export const DistinctionEditDrawer = NullComponent;

export const DistinctionsTable: React.FC = () => (
  <Box>
    <TormentaTitle variant='h4' centered sx={{ mb: 3 }}>
      Distinções
    </TormentaTitle>
    <Paper
      variant='outlined'
      sx={{
        p: { xs: 3, sm: 4 },
        textAlign: 'center',
        borderRadius: 2,
      }}
    >
      <WorkspacePremiumIcon
        color='primary'
        sx={{ fontSize: '2.5rem', mb: 1 }}
      />
      <Typography variant='h6' sx={{ fontFamily: 'Tfont, serif', mb: 1 }}>
        Conteúdo de Distinções indisponível no build público
      </Typography>
      <Typography
        variant='body2'
        sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto', mb: 2.5 }}
      >
        O catálogo completo de Distinções faz parte do módulo privado do Fichas
        de Nimb e vem desativado no stub público do fork. Você ainda pode
        explorar todos os poderes gerais e de classe na aba Poderes.
      </Typography>
      <Button
        component={Link}
        to='/database/poderes'
        variant='outlined'
        sx={{ fontFamily: 'Tfont, serif' }}
      >
        Ir para Poderes
      </Button>
    </Paper>
  </Box>
);
