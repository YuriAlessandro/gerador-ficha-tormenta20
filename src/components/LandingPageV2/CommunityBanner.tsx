import React from 'react';
import {
  Box,
  Button,
  Rating,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/** Um item genérico da bandeja, mapeado de homebrew/ameaça/build. */
export interface CommunityItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  icon: React.ReactNode;
  accentColor: string;
  rating?: number;
  ratingCount?: number;
  author?: string;
  onClick: () => void;
}

interface CommunityBannerProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  /** Gradiente CSS do header (identidade do tipo). */
  gradient: string;
  /** Cor base da sombra do banner. */
  shadowColor: string;
  exploreLabel: string;
  onExplore: () => void;
  createLabel: string;
  onCreate: () => void;
  items: CommunityItem[];
  loading?: boolean;
  emptyText: string;
}

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

const CommunityCard: React.FC<{ item: CommunityItem }> = ({ item }) => (
  <Box
    onClick={item.onClick}
    sx={{
      width: '100%',
      cursor: 'pointer',
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }}
  >
    <Box
      sx={{
        height: 96,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: item.image
          ? `url(${item.image}) center/cover no-repeat`
          : `linear-gradient(135deg, ${item.accentColor}33, ${item.accentColor}14)`,
        color: item.accentColor,
      }}
    >
      {!item.image && (
        <Box sx={{ fontSize: 40, display: 'flex' }}>{item.icon}</Box>
      )}
    </Box>
    <Box sx={{ p: 1.25 }}>
      {item.subtitle && (
        <Typography
          variant='caption'
          noWrap
          sx={{
            display: 'block',
            color: item.accentColor,
            fontWeight: 700,
          }}
        >
          {item.subtitle}
        </Typography>
      )}
      <Typography
        variant='subtitle2'
        sx={{ fontWeight: 700 }}
        noWrap
        title={item.title}
      >
        {item.title}
      </Typography>
      <Stack
        direction='row'
        spacing={0.5}
        sx={{
          alignItems: 'center',
          mt: 0.5,
          minHeight: 20,
        }}
      >
        {typeof item.rating === 'number' && item.rating > 0 ? (
          <>
            <Rating
              value={item.rating}
              precision={0.1}
              size='small'
              readOnly
              emptyIcon={
                <StarIcon style={{ opacity: 0.3 }} fontSize='inherit' />
              }
            />
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
              ({item.ratingCount || 0})
            </Typography>
          </>
        ) : (
          <Typography
            variant='caption'
            noWrap
            sx={{
              color: 'text.secondary',
            }}
          >
            {item.author ? `por ${item.author}` : 'Novo'}
          </Typography>
        )}
      </Stack>
    </Box>
  </Box>
);

/**
 * Banner temático reutilizável para conteúdo da comunidade (Homebrews, Bestiário,
 * Builds). Header com gradiente próprio + dois CTAs (Explorar / Criar) e uma
 * bandeja anexada com cards reais (compactos e consistentes entre os tipos).
 */
const CommunityBanner: React.FC<CommunityBannerProps> = ({
  icon,
  title,
  subtitle,
  gradient,
  shadowColor,
  exploreLabel,
  onExplore,
  createLabel,
  onCreate,
  items,
  loading,
  emptyText,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Header gradiente */}
      <Box
        sx={{
          background: gradient,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          borderRadius: 3,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          p: { xs: 2, sm: 3 },
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 16px ${shadowColor}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            animation: 'shineSweep 3s ease-in-out infinite',
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            direction='row'
            spacing={2}
            sx={{
              alignItems: 'center',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Box
              sx={{
                fontSize: { xs: 32, sm: 40 },
                opacity: 0.9,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{ fontFamily: 'Tfont, serif', fontWeight: 600, mb: 0.5 }}
              >
                {title}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant='contained'
              startIcon={<ArrowForwardIcon />}
              onClick={onExplore}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: '#1a1a1a',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#fff',
                  transform: 'scale(1.03)',
                },
                transition: 'all 0.25s ease',
              }}
            >
              {exploreLabel}
            </Button>
            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={onCreate}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                },
              }}
            >
              {createLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
      {/* Bandeja anexada (grade): skeleton / cards / vazio */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 1.25,
          p: 1.25,
          border: `1px solid ${shadowColor}`,
          borderTop: 'none',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          bgcolor: 'background.default',
        }}
      >
        {loading &&
          SKELETON_KEYS.map((key) => (
            <Skeleton
              key={key}
              variant='rounded'
              sx={{ width: '100%', height: 188 }}
            />
          ))}

        {!loading && items.length === 0 && (
          <Box
            sx={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              py: 3,
              color: 'text.secondary',
            }}
          >
            <Typography variant='body2'>{emptyText}</Typography>
          </Box>
        )}

        {!loading &&
          items.map((item) => <CommunityCard key={item.id} item={item} />)}
      </Box>
    </Box>
  );
};

export default CommunityBanner;
