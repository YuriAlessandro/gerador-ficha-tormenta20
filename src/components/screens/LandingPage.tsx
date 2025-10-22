import background from '@/assets/images/fantasybg.png';
import {
  Box,
  Card,
  Container,
  Grid,
  Button,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const LandingPage: React.FC<{
  onClickButton: (link: string) => void;
}> = ({ onClickButton }) => {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
  const { isAuthenticated } = useAuth();

  const onOpenLink = (link: string) => {
    window.open(link);
  };

  return (
    <>
      {/* Hero Background */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0) 20%,
          ${isDarkTheme ? '#212121' : '#f3f2f1'}
        ), url(${background})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: { xs: 'center top', sm: 'center center' },
          position: 'absolute',
          top: 0,
          width: '100%',
          height: { xs: '50vh', sm: '60vh', md: '65vh' },
          zIndex: 0,
        }}
      />

      <Container sx={{ position: 'relative', mb: 4, px: { xs: 1, sm: 2 } }}>
        {/* Hero Quote */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, sm: 6, md: 8 },
            fontFamily: 'Tfont',
            color: '#FFFFFF',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            px: { xs: 1, sm: 2 },
            pt: { xs: 2, sm: 4 },
          }}
        >
          <Typography
            variant='h3'
            component='h1'
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
              fontFamily: 'Tfont',
              fontWeight: 'bold',
            }}
          >
            &ldquo;Khalmyr tem o tabuleiro, mas quem move as peças é Nimb&rdquo;
          </Typography>
        </Box>

        {/* Main Tools - 3 Big Cards - Modern Edition */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {/* Main Hero Card - Changes based on authentication */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                onClick={() =>
                  onClickButton(
                    isAuthenticated ? 'meus-personagens' : 'criar-ficha'
                  )
                }
                sx={{
                  cursor: 'pointer',
                  height: { xs: '280px', md: '350px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${theme.palette.primary.main}30`,
                    borderColor: `${theme.palette.primary.main}60`,
                    '& .hero-icon': {
                      transform: 'rotate(10deg) scale(1.1)',
                    },
                    '& .hero-bg': {
                      transform:
                        'translateX(20px) translateY(-20px) scale(1.05)',
                      opacity: 0.15,
                    },
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
                    borderRadius: '50%',
                    transition: 'all 0.4s ease',
                  },
                }}
              >
                <Box
                  className='hero-bg'
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    fontSize: { xs: '100px', md: '120px' },
                    opacity: 0.08,
                    color: theme.palette.primary.main,
                    transition: 'all 0.4s ease',
                    pointerEvents: 'none',
                  }}
                >
                  {isAuthenticated ? '👥' : '✏️'}
                </Box>

                <Box
                  sx={{
                    p: 4,
                    zIndex: 1,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    className='hero-icon'
                    sx={{
                      fontSize: { xs: '3rem', md: '4rem' },
                      mb: 2,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      textAlign: 'left',
                    }}
                  >
                    {isAuthenticated ? '👥' : '✏️'}
                  </Typography>

                  <Typography
                    variant='h3'
                    component='h2'
                    sx={{
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      fontFamily: 'Tfont',
                      fontWeight: 800,
                      mb: 1,
                      color: '#FFFFFF',
                      lineHeight: 1.1,
                    }}
                  >
                    {isAuthenticated ? 'Meus Personagens' : 'Criar Personagem'}
                  </Typography>

                  <Typography
                    variant='body1'
                    sx={{
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.4,
                      maxWidth: '300px',
                    }}
                  >
                    {isAuthenticated
                      ? 'Acesse todos seus personagens salvos na nuvem com sincronização automática'
                      : 'Crie seu personagem do zero com total controle sobre raça, classe, atributos e habilidades'}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Right Side - Modern Stacked Cards */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                {/* Map Card - Modern */}
                <Grid size={12}>
                  <Card
                    onClick={() =>
                      onOpenLink('https://mapadearton.fichasdenimb.com.br/')
                    }
                    sx={{
                      cursor: 'pointer',
                      height: { xs: '135px', md: '162px' },
                      display: 'flex',
                      alignItems: 'center',
                      background: isDarkTheme
                        ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                      border: isDarkTheme
                        ? `2px solid ${theme.palette.grey[700]}`
                        : `2px solid ${theme.palette.secondary.main}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px) translateX(4px)',
                        boxShadow: isDarkTheme
                          ? `0 12px 28px ${theme.palette.grey[900]}80`
                          : `0 12px 28px ${theme.palette.secondary.main}25`,
                        borderColor: isDarkTheme
                          ? theme.palette.grey[600]
                          : `${theme.palette.secondary.main}40`,
                        '& .map-icon': {
                          transform: 'scale(1.1)',
                        },
                        '& .map-bg': {
                          transform: 'translateX(10px) scale(1.05)',
                        },
                      },
                    }}
                  >
                    <Box
                      className='map-bg'
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        fontSize: '80px',
                        opacity: 0.06,
                        color: theme.palette.secondary.main,
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      🗺️
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 3,
                        width: '100%',
                        gap: 3,
                      }}
                    >
                      <Box
                        className='map-icon'
                        sx={{
                          minWidth: 60,
                          height: 60,
                          borderRadius: 3,
                          backgroundColor: isDarkTheme
                            ? `${theme.palette.grey[700]}80`
                            : `${theme.palette.secondary.main}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        🗺️
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='h5'
                          component='h3'
                          sx={{
                            fontFamily: 'Tfont',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                            color: '#FFFFFF',
                          }}
                        >
                          Mapa Interativo
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            lineHeight: 1.3,
                          }}
                        >
                          Explore Arton com pins de cidades e pontos de
                          interesse
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                        }}
                      >
                        ↗
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* Threat Generator Card - Modern */}
                <Grid size={12}>
                  <Card
                    onClick={() => onClickButton('gerador-ameacas')}
                    sx={{
                      cursor: 'pointer',
                      height: { xs: '135px', md: '162px' },
                      display: 'flex',
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                      border: `2px solid ${theme.palette.error.main}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px) translateX(-4px)',
                        boxShadow: `0 12px 28px ${theme.palette.error.main}25`,
                        borderColor: `${theme.palette.error.main}40`,
                        '& .threat-icon': {
                          transform: 'scale(1.1) rotate(-5deg)',
                        },
                        '& .threat-bg': {
                          transform: 'translateX(-10px) scale(1.05)',
                        },
                      },
                    }}
                  >
                    {/* New Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 12,
                        background:
                          'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)',
                        color: '#FFFFFF',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                        zIndex: 10,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                          },
                          '50%': {
                            boxShadow: '0 2px 16px rgba(255, 107, 107, 0.6)',
                          },
                          '100%': {
                            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                          },
                        },
                      }}
                    >
                      Novo
                    </Box>
                    <Box
                      className='threat-bg'
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        fontSize: '80px',
                        opacity: 0.06,
                        color: theme.palette.error.main,
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      ⚔️
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 3,
                        width: '100%',
                        gap: 3,
                      }}
                    >
                      <Box
                        className='threat-icon'
                        sx={{
                          minWidth: 60,
                          height: 60,
                          borderRadius: 3,
                          backgroundColor: `${theme.palette.error.main}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        ⚔️
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='h5'
                          component='h3'
                          sx={{
                            fontFamily: 'Tfont',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                            color: '#FFFFFF',
                          }}
                        >
                          Gerador de Ameaças
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            lineHeight: 1.3,
                          }}
                        >
                          Crie inimigos e NPCs seguindo as regras oficiais
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                        }}
                      >
                        →
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Secondary Tools */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {/* Caverna do Saber */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Box
                onClick={() => onClickButton('caverna-do-saber')}
                sx={{
                  width: '100%',
                  height: '100px',
                  perspective: '1000px',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease-in-out',
                    '&:hover': {
                      transform: 'rotateY(180deg)',
                    },
                    // For mobile devices: show flip on tap/touch
                    '@media (hover: none)': {
                      '&:active': {
                        transform: 'rotateY(180deg)',
                      },
                    },
                  }}
                >
                  {/* Front of card */}
                  <Button
                    variant='outlined'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      borderWidth: 2,
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      backgroundColor: isDarkTheme
                        ? theme.palette.grey[900]
                        : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: isDarkTheme
                          ? theme.palette.grey[900]
                          : theme.palette.background.paper,
                      },
                    }}
                  >
                    <Typography variant='h5'>📚</Typography>
                    <Typography variant='body2' fontWeight='bold'>
                      Caverna do Saber
                    </Typography>
                  </Button>

                  {/* Back of card */}
                  <Button
                    variant='contained'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 1,
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ textAlign: 'center', lineHeight: 1.2 }}
                    >
                      Material de jogo em fase de teste, que está sendo
                      trabalhado pela equipe de game design
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Enciclopédia */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Box
                onClick={() => onClickButton('database/raças')}
                sx={{
                  width: '100%',
                  height: '100px',
                  perspective: '1000px',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease-in-out',
                    '&:hover': {
                      transform: 'rotateY(180deg)',
                    },
                    // For mobile devices: show flip on tap/touch
                    '@media (hover: none)': {
                      '&:active': {
                        transform: 'rotateY(180deg)',
                      },
                    },
                  }}
                >
                  {/* Front of card */}
                  <Button
                    variant='outlined'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      borderWidth: 2,
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      backgroundColor: isDarkTheme
                        ? theme.palette.grey[900]
                        : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: isDarkTheme
                          ? theme.palette.grey[900]
                          : theme.palette.background.paper,
                      },
                    }}
                  >
                    <Typography variant='h5'>📖</Typography>
                    <Typography
                      variant='body2'
                      fontWeight='bold'
                      textAlign='center'
                    >
                      Enciclopédia de Tanah-Toh
                    </Typography>
                  </Button>

                  {/* Back of card */}
                  <Button
                    variant='contained'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      bgcolor: 'secondary.main',
                      color: isDarkTheme ? '#000000' : 'white',
                      p: 1,
                      '&:hover': {
                        color: isDarkTheme ? '#000000' : 'white',
                      },
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ textAlign: 'center', lineHeight: 1.2 }}
                    >
                      Base de dados completa com raças, classes, magias,
                      equipamentos e muito mais
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Rolador de Recompensas */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Box
                onClick={() => onClickButton('recompensas')}
                sx={{
                  width: '100%',
                  height: '100px',
                  perspective: '1000px',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease-in-out',
                    '&:hover': {
                      transform: 'rotateY(180deg)',
                    },
                    // For mobile devices: show flip on tap/touch
                    '@media (hover: none)': {
                      '&:active': {
                        transform: 'rotateY(180deg)',
                      },
                    },
                  }}
                >
                  {/* Front of card */}
                  <Button
                    variant='outlined'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      borderWidth: 2,
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      backgroundColor: isDarkTheme
                        ? theme.palette.grey[900]
                        : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: isDarkTheme
                          ? theme.palette.grey[900]
                          : theme.palette.background.paper,
                      },
                    }}
                  >
                    <Typography variant='h5'>💰</Typography>
                    <Typography
                      variant='body2'
                      fontWeight='bold'
                      textAlign='center'
                    >
                      Rolador de Recompensas
                    </Typography>
                  </Button>

                  {/* Back of card */}
                  <Button
                    variant='contained'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      bgcolor: 'success.main',
                      color: 'white',
                      p: 1,
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ textAlign: 'center', lineHeight: 1.2 }}
                    >
                      Gere tesouros, dinheiro e itens baseados no nível de
                      desafio do encontro
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Criar Item Superior */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Box
                onClick={() => onClickButton('itens-superiores')}
                sx={{
                  width: '100%',
                  height: '100px',
                  perspective: '1000px',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s ease-in-out',
                    '&:hover': {
                      transform: 'rotateY(180deg)',
                    },
                    // For mobile devices: show flip on tap/touch
                    '@media (hover: none)': {
                      '&:active': {
                        transform: 'rotateY(180deg)',
                      },
                    },
                  }}
                >
                  {/* Front of card */}
                  <Button
                    variant='outlined'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      borderWidth: 2,
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      backgroundColor: isDarkTheme
                        ? theme.palette.grey[900]
                        : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: isDarkTheme
                          ? theme.palette.grey[900]
                          : theme.palette.background.paper,
                      },
                    }}
                  >
                    <Typography variant='h5'>✨</Typography>
                    <Typography
                      variant='body2'
                      fontWeight='bold'
                      textAlign='center'
                    >
                      Criar Item Superior
                    </Typography>
                  </Button>

                  {/* Back of card */}
                  <Button
                    variant='contained'
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 2,
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      pointerEvents: 'none',
                      bgcolor: 'warning.main',
                      color: 'white',
                      p: 1,
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ textAlign: 'center', lineHeight: 1.2 }}
                    >
                      Crie armas e armaduras superiores com modificações e
                      materiais especiais
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Criar Item Mágico */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Box sx={{ position: 'relative' }}>
                {/* New Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 12,
                    background:
                      'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                    color: '#FFFFFF',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.4)',
                    zIndex: 10,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.4)',
                      },
                      '50%': {
                        boxShadow: '0 2px 16px rgba(156, 39, 176, 0.6)',
                      },
                      '100%': {
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.4)',
                      },
                    },
                  }}
                >
                  Novo
                </Box>
                <Box
                  onClick={() => onClickButton('itens-magicos')}
                  sx={{
                    width: '100%',
                    height: '100px',
                    perspective: '1000px',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s ease-in-out',
                      '&:hover': {
                        transform: 'rotateY(180deg)',
                      },
                    }}
                  >
                    {/* Front of card */}
                    <Button
                      variant='outlined'
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        borderRadius: 2,
                        borderWidth: 2,
                        backfaceVisibility: 'hidden',
                        pointerEvents: 'none',
                        backgroundColor: isDarkTheme
                          ? theme.palette.grey[900]
                          : theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: isDarkTheme
                            ? theme.palette.grey[900]
                            : theme.palette.background.paper,
                        },
                      }}
                    >
                      <Typography variant='h5'>🔮</Typography>
                      <Typography
                        variant='body2'
                        fontWeight='bold'
                        textAlign='center'
                      >
                        Criar Item Mágico
                      </Typography>
                    </Button>

                    {/* Back of card */}
                    <Button
                      variant='contained'
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        borderRadius: 2,
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        pointerEvents: 'none',
                        bgcolor: '#9C27B0',
                        color: 'white',
                        p: 1,
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ textAlign: 'center', lineHeight: 1.2 }}
                      >
                        Crie itens mágicos com encantamentos poderosos para
                        armas, armaduras e escudos
                      </Typography>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Project Description */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 6,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
          }}
        >
          <Typography
            variant='h5'
            component='h2'
            sx={{
              textAlign: 'center',
              mb: 3,
              fontFamily: 'Tfont',
              color: theme.palette.primary.main,
              fontWeight: 'bold',
            }}
          >
            Sobre o Fichas de Nimb
          </Typography>

          <Typography
            variant='body1'
            paragraph
            sx={{ textAlign: 'justify', lineHeight: 1.6 }}
          >
            <strong>Fichas de Nimb</strong> é uma plataforma completa com
            diversas ferramentas para mestres e jogadores do sistema Tormenta
            20. Além da geração de fichas de personagens, oferece ferramentas
            para criar itens superiores e mágicos, gerar recompensas, consultar
            a enciclopédia e muito mais. Todas as características de uma ficha
            de Tormenta 20 são criadas automaticamente: atributos, perícias,
            origem, divindades, magias, etc. Tudo respeitando as regras oficiais
            do jogo.
          </Typography>

          <Typography
            variant='body1'
            paragraph
            sx={{ textAlign: 'justify', lineHeight: 1.6 }}
          >
            O gerador aleatório é uma ótima pedida para jogadores que queiram
            experimentar um pouco de aleatoriedade ou não gastar muito tempo
            criando a ficha, e principalmente para mestres que queriam gerar
            seus NPCs de forma rápida e prática.
          </Typography>

          <Typography
            variant='body1'
            paragraph
            sx={{ textAlign: 'justify', lineHeight: 1.6 }}
          >
            O criador de fichas é uma forma prática e rápida de criar
            personagens sem se preocupar com a aplicação das regras. As
            ferramentas de geração de itens permitem criar equipamentos únicos
            para suas aventuras. Tudo está sendo validado pelo código - você só
            precisa escolher as opções e usar o resultado.
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant='outlined'
              onClick={() =>
                onOpenLink(
                  'https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions'
                )
              }
              sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
            >
              💬 Discussões & Suporte
            </Button>
            <Button
              variant='outlined'
              onClick={() =>
                onOpenLink(
                  'https://github.com/YuriAlessandro/gerador-ficha-tormenta20'
                )
              }
            >
              💻 GitHub
            </Button>
          </Box>
        </Paper>

        {/* Bottom Section - Additional Tools with Sauce! */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
            borderRadius: 4,
            p: 4,
            mt: 6,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, ${theme.palette.primary.main}20 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}20 0%, transparent 50%)`,
              opacity: 0.3,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant='h4'
              component='h2'
              sx={{
                textAlign: 'center',
                mb: 4,
                fontFamily: 'Tfont',
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              ✨ Mais Recursos ✨
            </Typography>

            <Grid container spacing={3}>
              {/* Utilities Section */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    borderRadius: 3,
                    border: `2px solid ${theme.palette.primary.main}30`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      🔧
                    </Box>
                    <Typography
                      variant='h6'
                      component='h3'
                      sx={{
                        fontFamily: 'Tfont',
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                      }}
                    >
                      Utilitários
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Button
                        variant='contained'
                        onClick={() => onClickButton('changelog')}
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 2,
                          px: 3,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[6],
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                          }}
                        >
                          <Typography variant='h6'>📝</Typography>
                          <Box>
                            <Typography variant='body1' fontWeight='bold'>
                              Changelog
                            </Typography>
                            <Typography variant='caption' sx={{ opacity: 0.8 }}>
                              Acompanhe as novidades
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    </Grid>
                    <Grid size={12}>
                      <Button
                        variant='contained'
                        onClick={() =>
                          onOpenLink(
                            'https://jamboeditora.com.br/categoria/rpg/tormenta20-rpg/'
                          )
                        }
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 2,
                          px: 3,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[6],
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                          }}
                        >
                          <Typography variant='h6'>🛒</Typography>
                          <Box>
                            <Typography variant='body1' fontWeight='bold'>
                              Compre Tormenta 20
                            </Typography>
                            <Typography variant='caption' sx={{ opacity: 0.8 }}>
                              Apoie o sistema oficial
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Community Projects Section */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    borderRadius: 3,
                    border: `2px solid ${theme.palette.secondary.main}30`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      🤝
                    </Box>
                    <Typography
                      variant='h6'
                      component='h3'
                      sx={{
                        fontFamily: 'Tfont',
                        color: theme.palette.secondary.main,
                        fontWeight: 'bold',
                      }}
                    >
                      Projetos da Comunidade
                    </Typography>
                  </Box>

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mb: 3,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      backgroundColor: `${theme.palette.warning.light}20`,
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.warning.main}30`,
                    }}
                  >
                    ⚠️ Projetos independentes, sem vínculo com Fichas de Nimb
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Button
                        variant='outlined'
                        onClick={() =>
                          onOpenLink(
                            'https://eduardomarques.pythonanywhere.com/'
                          )
                        }
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 2,
                          px: 3,
                          borderRadius: 2,
                          borderWidth: 2,
                          borderColor: theme.palette.secondary.main,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            backgroundColor: `${theme.palette.secondary.main}10`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                          }}
                        >
                          <Typography variant='h6'>🔮</Typography>
                          <Box>
                            <Typography variant='body1' fontWeight='bold'>
                              Grimório T20
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Magias e feitiços
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    </Grid>
                    <Grid size={12}>
                      <Button
                        variant='outlined'
                        onClick={() =>
                          onOpenLink(
                            'https://mclemente.github.io/Calculadora-ND/'
                          )
                        }
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 2,
                          px: 3,
                          borderRadius: 2,
                          borderWidth: 2,
                          borderColor: theme.palette.secondary.main,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            backgroundColor: `${theme.palette.secondary.main}10`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                          }}
                        >
                          <Typography variant='h6'>🧮</Typography>
                          <Box>
                            <Typography variant='body1' fontWeight='bold'>
                              Calculadora ND
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Balanceamento de encontros
                            </Typography>
                          </Box>
                        </Box>
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LandingPage;
