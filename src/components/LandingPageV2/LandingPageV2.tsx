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
import ActiveSessionBanner from './ActiveSessionBanner';
import ContinueJourneySection from './ContinueJourneySection';
import BlogHighlights from './BlogHighlights';
import ForumActivity from './ForumActivity';
import BuildsShowcase from './BuildsShowcase';
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
    loading: highlightsLoading,
  } = useCommunityHighlights();

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
              lg: '92%',
              xl: '85%',
            },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Fixed hero background */}
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
              height: { xs: '35vh', sm: '40vh', md: '45vh' },
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Two-column layout: main content (with hero on top) + tools sidebar */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1fr) 280px',
                lg: 'minmax(0, 1fr) 320px',
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

              {/* Active session banner (conditional) */}
              <ActiveSessionBanner
                onClickButton={onClickButton}
                isAuthenticated={isAuthenticated}
              />

              {/* Two-column inner grid: Continue+Blog (left) + Forum (right/center) */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    md: 'minmax(0, 5fr) minmax(0, 7fr)',
                  },
                  gap: { xs: 3, md: 3 },
                  alignItems: 'start',
                }}
              >
                {/* Left inner column: continue jogando + blog */}
                <Stack spacing={{ xs: 3, md: 4 }} sx={{ minWidth: 0 }}>
                  <Box className='landing-section'>
                    <ContinueJourneySection
                      onClickButton={onClickButton}
                      isAuthenticated={isAuthenticated}
                    />
                  </Box>
                  <Box className='landing-section'>
                    <BlogHighlights
                      onClickButton={onClickButton}
                      posts={blogPosts}
                      loading={highlightsLoading}
                    />
                  </Box>
                </Stack>

                {/* Right (center) inner column: forum activity — main focus */}
                <Box className='landing-section'>
                  <ForumActivity
                    onClickButton={onClickButton}
                    threads={forumThreads}
                    loading={highlightsLoading}
                    isAuthenticated={isAuthenticated}
                  />
                </Box>
              </Box>

              {/* Bestiary banner — full width below the 2-col section */}
              {bestiaryEnabled && (
                <Box className='landing-section'>
                  <BestiaryBanner onClickButton={onClickButton} />
                </Box>
              )}

              {/* Builds showcase (grid 4-col) */}
              <Box className='landing-section'>
                <BuildsShowcase
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
