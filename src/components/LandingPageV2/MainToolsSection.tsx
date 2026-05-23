import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { useAuthContext } from '../../contexts/AuthContext';
import ToolCard from './ToolCard';

interface MainToolsSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const MainToolsSection: React.FC<MainToolsSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const { openLoginModal } = useAuthContext();

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMesaVirtual = () => {
    if (isAuthenticated) {
      onClickButton('/mesas');
    } else {
      openLoginModal();
    }
  };

  const mainTools = [
    {
      title: isAuthenticated ? 'Meus Personagens' : 'Criar Personagem',
      description: isAuthenticated
        ? 'Acesse e gerencie suas fichas de personagem e ameaças'
        : 'Comece sua aventura criando um novo herói',
      icon: isAuthenticated ? (
        <GroupIcon sx={{ fontSize: 'inherit' }} />
      ) : (
        <PersonAddIcon sx={{ fontSize: 'inherit' }} />
      ),
      onClick: () =>
        onClickButton(isAuthenticated ? '/meus-personagens' : '/criar-ficha'),
      isPrimary: true,
      isExternal: false,
    },
    {
      title: 'Mesa Virtual',
      description: isAuthenticated
        ? 'Crie e gerencie mesas para jogar com seus amigos'
        : 'Jogue Tormenta 20 online em tempo real',
      icon: <TableRestaurantIcon sx={{ fontSize: 'inherit' }} />,
      onClick: handleMesaVirtual,
      isPrimary: false,
      isExternal: false,
    },
    {
      title: 'Mapa de Arton',
      description: 'Explore o mundo de Arton de forma interativa',
      icon: <MapIcon sx={{ fontSize: 'inherit' }} />,
      onClick: () =>
        handleExternalLink('https://mapadearton.fichasdenimb.com.br/'),
      isPrimary: false,
      isExternal: true,
    },
    {
      title: 'Enciclopédia de Tanah-Toh',
      description: 'Consulte raças, classes, magias e muito mais',
      icon: <StorageIcon sx={{ fontSize: 'inherit' }} />,
      onClick: () => onClickButton('/database'),
      isPrimary: false,
      isExternal: false,
    },
  ];

  return (
    <Box>
      <Typography variant='h5' className='section-title' sx={{ mb: 2 }}>
        Ações rápidas
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {mainTools.map((tool, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tool.title}>
            <ToolCard
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              isPrimary={tool.isPrimary}
              isExternal={tool.isExternal}
              delay={0.1 * (index + 1)}
              onClick={tool.onClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainToolsSection;
