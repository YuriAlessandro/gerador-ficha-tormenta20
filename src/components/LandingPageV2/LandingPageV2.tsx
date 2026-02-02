import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { SEO, getPageSEO } from '../SEO';
import '../../assets/css/landing-page-v2.css';
import background from '../../assets/images/fantasybg.png';

import HeroCarousel from './HeroCarousel';
import SupportBanner from './SupportBanner';
import RecentSheetsSection from './RecentSheetsSection';
import MainToolsSection from './MainToolsSection';
import SecondaryToolsSection from './SecondaryToolsSection';
import GameSessionsSection from './GameSessionsSection';
import BuildsPreviewSection from './BuildsPreviewSection';
import { BlogPreviewSection } from '../../premium';

interface LandingPageV2Props {
  onClickButton: (link: string) => void;
}

const LandingPageV2: React.FC<LandingPageV2Props> = ({ onClickButton }) => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';

  const homeSEO = getPageSEO('home');

  return (
    <>
      <SEO title={homeSEO.title} description={homeSEO.description} url='/' />
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='center'
        spacing={2}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            position: 'relative',
            maxWidth: {
              xs: '100%',
              sm: '95%',
              md: '95%',
              lg: '90%',
              xl: '80%',
            },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems='flex-start'
            justifyContent='flex-start'
          >
            <Box
              sx={{
                minHeight: '100vh',
                pb: 4,
                position: 'relative',
                width: { xs: '100%', md: '70%' },
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
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', md: '30%' },
                maxWidth: '100%',
                boxSizing: 'border-box',
                mt: { xs: 2, md: 3 },
                background: isDarkTheme
                  ? 'rgba(33, 33, 33, 0.85)'
                  : 'rgba(243, 242, 241, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                p: 2,
                border: `1px solid ${
                  isDarkTheme
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                }`,
              }}
            >
              {/* Blog Preview Section - Recent blog posts */}
              <Box className='landing-section'>
                <BlogPreviewSection onClickButton={onClickButton} />
              </Box>
              {/* Recent Sheets Section - Only for authenticated users */}
              <Box className='landing-section'>
                <RecentSheetsSection
                  onClickButton={onClickButton}
                  isAuthenticated={isAuthenticated}
                />
              </Box>
              {/* Builds Preview Section - Public builds from all users */}
              <Box className='landing-section'>
                <BuildsPreviewSection onClickButton={onClickButton} />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default LandingPageV2;
