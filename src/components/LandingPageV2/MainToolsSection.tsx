import React from 'react';
import { Box, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import ToolCard from './ToolCard';

interface MainToolsSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

const MainToolsSection: React.FC<MainToolsSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      link: isAuthenticated ? '/meus-personagens' : '/criar-ficha',
      isPrimary: true,
      isExternal: false,
    },
    {
      title: 'Mapa de Arton',
      description: 'Explore o mundo de Arton de forma interativa',
      icon: <MapIcon sx={{ fontSize: 'inherit' }} />,
      link: 'https://mapadearton.fichasdenimb.com.br/',
      isPrimary: false,
      isExternal: true,
    },
    {
      title: 'Enciclopédia de Tanah-Toh',
      description: 'Consulte raças, classes, magias e muito mais',
      icon: <StorageIcon sx={{ fontSize: 'inherit' }} />,
      link: '/database',
      isPrimary: false,
      isExternal: false,
    },
  ];

  return (
    <Box>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {mainTools.map((tool, index) => (
          <Grid
            size={{ xs: 12, sm: tool.isPrimary ? 12 : 6, md: 4 }}
            key={tool.title}
          >
            <ToolCard
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              isPrimary={tool.isPrimary}
              isExternal={tool.isExternal}
              delay={0.1 * (index + 1)}
              onClick={() =>
                tool.isExternal
                  ? handleExternalLink(tool.link)
                  : onClickButton(tool.link)
              }
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainToolsSection;
