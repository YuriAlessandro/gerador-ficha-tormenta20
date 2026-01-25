import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import heroImage from '../../assets/images/tormenta20.jpg';
import sheetImage from '../../assets/images/backgrounds/sheet.jpg';
import dungeonImage from '../../assets/images/backgrounds/dungeon.jpg';
import tabletopImage from '../../assets/images/backgrounds/tabletop.jpg';
import diceImage from '../../assets/images/backgrounds/dice.jpg';
import dragonImage from '../../assets/images/backgrounds/dragon.jpg';

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  isNew?: boolean;
  category?: string;
  bigText?: string;
  requireAuth?: boolean;
}

// ===========================================
// CONFIGURE SLIDES HERE - Easy to update
// ===========================================
export const carouselSlides: CarouselSlide[] = [
  {
    id: 'gerador-ficha',
    title: 'Criar personagem',
    subtitle:
      'Crie, gerencie e jogue com seus personagens de forma rápida e prática, com automação de regras e rolagem de dados.',
    image: sheetImage,
    ctaText: 'Meus Personagens',
    ctaLink: '/meus-personagens',
    category: 'Ferramentas',
    requireAuth: true,
  },
  {
    id: 'fichas-de-nimb',
    title: 'Fichas de Nimb',
    subtitle: 'A melhor plataforma para Tormenta 20!',
    image: heroImage,
    bigText:
      'Fichas de Nimb é uma plataforma completa com diversas ferramentas para mestres e jogadores do sistema Tormenta 20. Além da geração de fichas de personagens, oferece ferramentas para criar itens superiores e mágicos, gerar recompensas, consultar a enciclopédia e muito mais. Todas as características de uma ficha de Tormenta 20 são criadas automaticamente: atributos, perícias, origem, divindades, magias, etc. Tudo respeitando as regras oficiais do jogo.',
  },
  {
    id: 'apoio',
    title: 'Apoie o Projeto!',
    subtitle:
      'Se torne um apoiador do nosso projeto e garanta que ela siga evoluindo. Escolha o seu nível e aproveite recompensas incríveis.',
    image: dragonImage,
    category: 'Recompensas incríveis te aguardam!',
    ctaText: 'Apoiar',
    ctaLink: '/apoiar',
  },
  {
    id: 'gerador-ameacas',
    title: 'Gerador de Ameaças',
    subtitle:
      'Crie e personalize ameaças para suas aventuras com nosso gerador completo. Ajuste atributos, poderes e habilidades!',
    image: dungeonImage,
    ctaText: 'Criar Ameaça',
    ctaLink: '/gerador-ameacas',
    category: 'Ferramentas',
  },
  {
    id: 'mesas-virtuais',
    title: 'Mesas Virtuais',
    subtitle:
      'A melhor forma de jogar presencialmente. Gerencie sua mesa, rolagens e combate. Tudo sincronizado entre todos os jogadores.',
    image: tabletopImage,
    ctaText: 'Ver Mesas',
    ctaLink: '/mesas',
    category: 'Comunidade',
    requireAuth: true,
  },
  {
    id: 'builds',
    title: 'Planejador de Builds',
    subtitle:
      'Planeje a evolução do seu personagem nível a nível. Compartilhe builds com a comunidade!',
    image: diceImage,
    ctaText: 'Explorar Builds',
    ctaLink: '/builds',
    category: 'Comunidade',
  },
];
// ===========================================

interface HeroCarouselProps {
  onClickButton: (link: string) => void;
  autoPlayInterval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onClickButton,
  autoPlayInterval = 6000,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useAuthContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = carouselSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || totalSlides <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, totalSlides]);

  const slide = carouselSlides[currentSlide];

  return (
    <Box
      className='hero-section'
      sx={{
        mt: { xs: 2, md: 3 },
        minHeight: { xs: '35vh', sm: '40vh', md: '50vh' },
        position: 'relative',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade effect */}
      {carouselSlides.map((s, index) => (
        <Box
          key={s.id}
          className='hero-background'
          sx={{
            backgroundImage: `url(${s.image || heroImage})`,
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
          }}
        />
      ))}
      <Box className='hero-overlay' />

      {/* Content */}
      <Box
        className='hero-content'
        key={slide.id}
        sx={{
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        {/* Category Badge */}
        {slide.category && (
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            alignItems='center'
            sx={{ mb: 1 }}
          >
            {slide.isNew && (
              <Box
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  px: 1.5,
                  py: 0.3,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Novo
              </Box>
            )}
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontStyle: 'italic',
              }}
            >
              {slide.category}
            </Typography>
          </Stack>
        )}

        {/* Title */}
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          className='hero-title'
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            mb: 2,
          }}
        >
          {slide.title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant={isMobile ? 'body1' : 'h6'}
          className='hero-subtitle'
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            maxWidth: '600px',
            mx: 'auto',
            mb: slide.ctaText ? 3 : 0,
          }}
        >
          {slide.subtitle}
        </Typography>

        {/* Big text */}
        {slide.bigText && (
          <Typography
            variant='body1'
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {slide.bigText}
          </Typography>
        )}

        {/* CTA Button */}
        {slide.ctaText && slide.ctaLink && (
          <Button
            variant='contained'
            size={isMobile ? 'medium' : 'large'}
            onClick={() => {
              if (slide.requireAuth && !isAuthenticated) {
                openLoginModal();
              } else {
                onClickButton(slide.ctaLink!);
              }
            }}
            sx={{
              backgroundColor: theme.palette.primary.main,
              fontFamily: 'Tfont, serif',
              fontSize: { xs: '0.9rem', md: '1rem' },
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {slide.ctaText}
          </Button>
        )}
      </Box>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
              zIndex: 3,
            }}
            aria-label='Slide anterior'
          >
            <ChevronLeftIcon fontSize={isMobile ? 'medium' : 'large'} />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
              zIndex: 3,
            }}
            aria-label='Próximo slide'
          >
            <ChevronRightIcon fontSize={isMobile ? 'medium' : 'large'} />
          </IconButton>
        </>
      )}

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <Stack
          direction='row'
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: { xs: 12, md: 20 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
          }}
        >
          {carouselSlides.map((_, index) => (
            <Box
              key={carouselSlides[index].id}
              onClick={() => goToSlide(index)}
              sx={{
                width: index === currentSlide ? 24 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor:
                  index === currentSlide
                    ? theme.palette.primary.main
                    : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor:
                    index === currentSlide
                      ? theme.palette.primary.main
                      : 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default HeroCarousel;
