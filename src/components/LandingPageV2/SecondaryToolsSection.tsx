import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SecurityIcon from '@mui/icons-material/Security';
import ToolCard from './ToolCard';

interface SecondaryToolsSectionProps {
  onClickButton: (link: string) => void;
}

const SecondaryToolsSection: React.FC<SecondaryToolsSectionProps> = ({
  onClickButton,
}) => {
  const secondaryTools = [
    {
      title: 'Gerador de Ameaças',
      description: 'Crie e gerencie suas ameaças do jeito mais fácil',
      icon: <SecurityIcon sx={{ fontSize: 'inherit' }} />,
      link: '/gerador-ameacas',
    },
    {
      title: 'Caverna do Saber',
      description: 'Artigos, dicas e guias para mestres e jogadores',
      icon: <BookIcon sx={{ fontSize: 'inherit' }} />,
      link: '/caverna-do-saber',
    },
    {
      title: 'Rolador de Recompensas',
      description: 'Gere tesouros aleatórios para suas aventuras',
      icon: <AttachMoneyIcon sx={{ fontSize: 'inherit' }} />,
      link: '/recompensas',
    },
    {
      title: 'Criar Item Superior',
      description: 'Personalize armas e armaduras superiores',
      icon: <ArchitectureIcon sx={{ fontSize: 'inherit' }} />,
      link: '/itens-superiores',
    },
    {
      title: 'Criar Item Mágico',
      description: 'Encante itens com propriedades mágicas',
      icon: <AutoFixHighIcon sx={{ fontSize: 'inherit' }} />,
      link: '/itens-magicos',
    },
  ];

  return (
    <Box>
      <Typography variant='h5' className='section-title'>
        Mais Ferramentas
      </Typography>
      <Grid
        container
        spacing={{ xs: 2, md: 2 }}
        sx={{ mt: 2 }}
        className='secondary-tools-grid'
      >
        {secondaryTools.map((tool, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4, lg: 'grow' }}
            key={tool.title}
            sx={{
              '@media (min-width: 1200px)': {
                flex: '1 1 0',
                maxWidth: '20%',
              },
            }}
          >
            <ToolCard
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              isSecondary
              delay={0.1 * (index + 1)}
              onClick={() => onClickButton(tool.link)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SecondaryToolsSection;
