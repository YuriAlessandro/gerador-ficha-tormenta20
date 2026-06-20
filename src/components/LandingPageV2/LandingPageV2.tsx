import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { SEO, getPageSEO } from '../SEO';
import '../../assets/css/landing-page-v2.css';
import background from '../../assets/images/fantasybg.png';

import HeroCarousel from './HeroCarousel';
import SupportBanner from './SupportBanner';
import BestiaryBanner from './BestiaryBanner';
import HomebrewsBanner from './HomebrewsBanner';
import BuildsBanner from './BuildsBanner';
import ContinueAndTablesSection from './ContinueAndTablesSection';
import BlogHighlights from './BlogHighlights';
import ForumActivity from './ForumActivity';
import ToolsSidebar from './ToolsSidebar';
import useCommunityHighlights from './hooks/useCommunityHighlights';

interface LandingPageV2Props {
  onClickButton: (link: string) => void;
}

const LandingPageV2: React.FC<LandingPageV2Props> = ({ onClickButton }) => {
  const { isAuthenticated } = useAuth();
  const bestiaryEnabled = useFeatureAccess('bestiary').isEnabled;
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';

  const homeSEO = getPageSEO('home');

  const {
    blogPosts,
    forumThreads,
    builds,
    homebrews,
    bestiary,
    loading: highlightsLoading,
  } = useCommunityHighlights();

  return (
    <>
      <SEO title={homeSEO.title} description={homeSEO.description} url='/' />

      {/* Full-width backdrop behind the hero — sits at the top of the page,
          extends upward behind the navbar, and does NOT follow the scroll
          (position: absolute, not fixed). Once the user scrolls past the
          hero area, the rest of the page has its normal background. */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0) 35%,
              ${isDarkTheme ? '#212121' : '#f3f2f1'}
            ), url(${background})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: { xs: 'center top', sm: 'center center' },
          position: 'absolute',
          top: -120,
          left: 0,
          right: 0,
          width: '100%',
          height: {
            xs: 'calc(38vh + 120px)',
            sm: 'calc(42vh + 120px)',
            md: 'calc(45vh + 120px)',
          },
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction='row'
        alignItems='center'
        justifyContent='center'
        spacing={2}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            position: 'relative',
            maxWidth: {
              xs: '100%',
              sm: '95%',
              md: '95%',
              lg: '92%',
              xl: '85%',
            },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Two-column layout: main content (with hero on top) + tools sidebar */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1fr) 320px',
                lg: 'minmax(0, 1fr) 360px',
              },
              gap: { xs: 2, md: 3 },
              alignItems: 'start',
              position: 'relative',
              pt: 1,
              pb: 4,
            }}
          >
            {/* MAIN COLUMN */}
            <Stack spacing={{ xs: 3, md: 4 }} sx={{ minWidth: 0 }}>
              {/* Hero carousel — shares row with sidebar */}
              <Box className='landing-section'>
                <HeroCarousel onClickButton={onClickButton} />
              </Box>

              {/* Continue jogando + Mesas virtuais — full width.
                  Switches between: anon CTAs / active session highlight /
                  2-column (recent sheets + tables). */}
              <Box className='landing-section'>
                <ContinueAndTablesSection
                  onClickButton={onClickButton}
                  isAuthenticated={isAuthenticated}
                />
              </Box>

              {/* Inner grid: desktop = Forum left + Blog right;
                  mobile = Forum → Blog stacked */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    md: 'minmax(0, 7fr) minmax(0, 5fr)',
                  },
                  gap: 3,
                  alignItems: 'start',
                }}
              >
                {/* Forum activity */}
                <Box className='landing-section' sx={{ minWidth: 0 }}>
                  <ForumActivity
                    onClickButton={onClickButton}
                    threads={forumThreads}
                    loading={highlightsLoading}
                    isAuthenticated={isAuthenticated}
                  />
                </Box>

                {/* Blog highlights */}
                <Box className='landing-section' sx={{ minWidth: 0 }}>
                  <BlogHighlights
                    onClickButton={onClickButton}
                    posts={blogPosts}
                    loading={highlightsLoading}
                  />
                </Box>
              </Box>

              {/* Criado pela comunidade — banners temáticos consistentes:
                  Homebrews, Bestiário e Builds */}
              <Box className='landing-section'>
                <HomebrewsBanner
                  onClickButton={onClickButton}
                  homebrews={homebrews}
                  loading={highlightsLoading}
                />
              </Box>

              {bestiaryEnabled && (
                <Box className='landing-section'>
                  <BestiaryBanner
                    onClickButton={onClickButton}
                    bestiary={bestiary}
                    loading={highlightsLoading}
                  />
                </Box>
              )}

              <Box className='landing-section'>
                <BuildsBanner
                  onClickButton={onClickButton}
                  builds={builds}
                  loading={highlightsLoading}
                />
              </Box>

              {/* Support banner */}
              <Box className='landing-section'>
                <SupportBanner onClickButton={onClickButton} />
              </Box>
            </Stack>

            {/* SIDEBAR (sticky on desktop) */}
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 80 },
                minWidth: 0,
              }}
            >
              <ToolsSidebar
                onClickButton={onClickButton}
                isAuthenticated={isAuthenticated}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </>
  );
};

export default LandingPageV2;
