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
import CommunityFeedSection from './CommunityFeedSection';

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
          {/* Hero Background with Fade - Fixed to viewport */}
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1fr) 30%',
              },
              gridTemplateRows: { md: 'repeat(5, auto)' },
              gap: 2,
              alignItems: 'start',
              minHeight: '100vh',
              pb: 4,
              position: 'relative',
            }}
          >
            {/* Hero Carousel */}
            <Box sx={{ order: 1, gridColumn: '1' }}>
              <HeroCarousel onClickButton={onClickButton} />
            </Box>

            {/* Sidebar - appears after hero on mobile, right column on desktop */}
            <Box
              sx={{
                order: { xs: 2, md: 2 },
                gridColumn: { xs: '1', md: '2' },
                gridRow: { md: '1 / -1' },
                position: { md: 'sticky' },
                top: { md: 80 },
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
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
              <Box className='landing-section'>
                <CommunityFeedSection
                  onClickButton={onClickButton}
                  isAuthenticated={isAuthenticated}
                />
              </Box>
              <Box className='landing-section'>
                <RecentSheetsSection
                  onClickButton={onClickButton}
                  isAuthenticated={isAuthenticated}
                />
              </Box>
            </Box>

            {/* Support Banner */}
            <Box
              className='landing-section'
              sx={{ order: 3, gridColumn: '1', mt: 1 }}
            >
              <SupportBanner onClickButton={onClickButton} />
            </Box>

            {/* Main Tools Section */}
            <Box className='landing-section' sx={{ order: 4, gridColumn: '1' }}>
              <MainToolsSection
                onClickButton={onClickButton}
                isAuthenticated={isAuthenticated}
              />
            </Box>

            {/* Game Sessions Section */}
            <Box className='landing-section' sx={{ order: 5, gridColumn: '1' }}>
              <GameSessionsSection
                onClickButton={onClickButton}
                isAuthenticated={isAuthenticated}
              />
            </Box>

            {/* Secondary Tools Section */}
            <Box className='landing-section' sx={{ order: 6, gridColumn: '1' }}>
              <SecondaryToolsSection onClickButton={onClickButton} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </>
  );
};

export default LandingPageV2;
