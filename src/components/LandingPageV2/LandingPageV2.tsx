import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/landing-page-v2.css';
import background from '../../assets/images/fantasybg.png';

import HeroCarousel from './HeroCarousel';
import SupportBanner from './SupportBanner';
import MainToolsSection from './MainToolsSection';
import SecondaryToolsSection from './SecondaryToolsSection';
import GameSessionsSection from './GameSessionsSection';
import BuildsPreviewSection from './BuildsPreviewSection';
import { BlogPreviewSection } from '../Blog';

interface LandingPageV2Props {
  onClickButton: (link: string) => void;
}

const LandingPageV2: React.FC<LandingPageV2Props> = ({ onClickButton }) => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 4,
        position: 'relative',
      }}
    >
      {/* Hero Background with Fade - Fixed to viewport to appear behind navbar */}
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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: { xs: '50vh', sm: '60vh', md: '65vh' },
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth='lg'
        sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}
      >
        {/* Hero Carousel */}
        <HeroCarousel onClickButton={onClickButton} />

        {/* Support Banner */}
        <Box className='landing-section' sx={{ mt: 3 }}>
          <SupportBanner onClickButton={onClickButton} />
        </Box>

        {/* Main Tools Section */}
        <Box className='landing-section'>
          <MainToolsSection
            onClickButton={onClickButton}
            isAuthenticated={isAuthenticated}
          />
        </Box>

        {/* Game Sessions Section */}
        <Box className='landing-section'>
          <GameSessionsSection
            onClickButton={onClickButton}
            isAuthenticated={isAuthenticated}
          />
        </Box>

        {/* Secondary Tools Section */}
        <Box className='landing-section'>
          <SecondaryToolsSection onClickButton={onClickButton} />
        </Box>

        {/* Builds Preview Section - Public builds from all users */}
        <Box className='landing-section'>
          <BuildsPreviewSection onClickButton={onClickButton} />
        </Box>

        {/* Blog Preview Section - Recent blog posts */}
        <Box className='landing-section'>
          <BlogPreviewSection onClickButton={onClickButton} />
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPageV2;
