import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CasinoIcon from '@mui/icons-material/Casino';
import tormenta20 from '@/assets/images/tormenta20.jpg';
import { useSheets } from '../../hooks/useSheets';
import { useAuthContext } from '../../contexts/AuthContext';
import { SheetListData } from '../../services/sheets.service';

interface ContinueJourneySectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

interface SheetDataContent {
  raca?: { name: string };
  classe?: { name: string };
  classLevels?: { className: string }[];
  nivel?: number;
  isThreat?: boolean;
}

const MAX_SHEETS = 2;

const ContinueJourneySection: React.FC<ContinueJourneySectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { openLoginModal } = useAuthContext();

  const { sheets, loading } = useSheets();

  const recentSheets = useMemo(() => {
    if (!isAuthenticated || !sheets || sheets.length === 0) return [];
    return sheets
      .filter((sheet) => !(sheet.sheetData as SheetDataContent)?.isThreat)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, MAX_SHEETS);
  }, [isAuthenticated, sheets]);

  const getSheetData = (sheet: SheetListData): SheetDataContent =>
    (sheet.sheetData as SheetDataContent) || {};

  const getCtaBackground = (isPrimary: boolean): string => {
    if (isPrimary) {
      return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
    }
    return isDark
      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  };

  const getCtaBorderColor = (isPrimary: boolean): string => {
    if (isPrimary) return theme.palette.primary.dark;
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  };

  const getCtaHoverShadow = (isPrimary: boolean): string => {
    if (isPrimary) return 'rgba(0,0,0,0.25)';
    return isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)';
  };

  // ============== Not authenticated ==============
  if (!isAuthenticated) {
    const ctas = [
      {
        key: 'create',
        title: 'Criar Personagem',
        description: 'Gere uma ficha completa em minutos',
        icon: <PersonAddIcon sx={{ fontSize: 32 }} />,
        onClick: () => onClickButton('/criar-ficha'),
        isPrimary: true,
      },
      {
        key: 'random',
        title: 'Ficha Aleatória',
        description: 'Sem ideia? Gere uma pronta',
        icon: <CasinoIcon sx={{ fontSize: 32 }} />,
        onClick: () => onClickButton('/ficha-aleatoria'),
        isPrimary: false,
      },
      {
        key: 'login',
        title: 'Faça Login',
        description: 'Salve fichas e participe',
        icon: <LoginIcon sx={{ fontSize: 32 }} />,
        onClick: openLoginModal,
        isPrimary: false,
      },
    ];

    return (
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontFamily: 'Tfont, serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 1.5,
          }}
        >
          Comece sua jornada
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {ctas.map((cta, index) => (
            <Box
              key={cta.key}
              onClick={cta.onClick}
              sx={{
                animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                background: getCtaBackground(cta.isPrimary),
                color: cta.isPrimary || isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                p: 2,
                cursor: 'pointer',
                border: `2px solid ${getCtaBorderColor(cta.isPrimary)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minHeight: 80,
                transition: 'all 0.18s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 6px 16px ${getCtaHoverShadow(cta.isPrimary)}`,
                },
              }}
            >
              <Box
                sx={{
                  color: cta.isPrimary
                    ? 'rgba(255,255,255,0.95)'
                    : theme.palette.primary.main,
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                {cta.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontFamily: 'Tfont, serif',
                    fontWeight: 700,
                    mb: 0.25,
                    lineHeight: 1.2,
                  }}
                >
                  {cta.title}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: '0.75rem',
                    opacity: cta.isPrimary ? 0.95 : 0.7,
                    color: cta.isPrimary ? 'rgba(255,255,255,0.9)' : 'inherit',
                    display: 'block',
                  }}
                >
                  {cta.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // ============== Authenticated, loading ==============
  if (loading) {
    return (
      <Box>
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography
            variant='subtitle1'
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Continue jogando
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={68}
              sx={{ borderRadius: 2, flex: 1 }}
            />
          ))}
          <Skeleton
            variant='rectangular'
            height={68}
            width={120}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      </Box>
    );
  }

  // ============== Authenticated, no sheets ==============
  if (recentSheets.length === 0) {
    return (
      <Box
        onClick={() => onClickButton('/criar-ficha')}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#ffffff',
          borderRadius: 2,
          p: 2,
          cursor: 'pointer',
          border: `2px solid ${theme.palette.primary.dark}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          },
        }}
      >
        <PersonAddIcon sx={{ fontSize: 36, opacity: 0.95, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 0.25 }}
          >
            Crie seu primeiro personagem
          </Typography>
          <Typography
            variant='caption'
            sx={{ opacity: 0.9, fontSize: '0.8rem' }}
          >
            Comece sua aventura em Arton em poucos minutos
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{ flexShrink: 0 }} />
      </Box>
    );
  }

  // ============== Authenticated, with sheets ==============
  // Compact horizontal row: small thumbnail + name + level chip
  return (
    <Box>
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >
        <Typography
          variant='subtitle1'
          sx={{
            fontFamily: 'Tfont, serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          Continue jogando
        </Typography>
        <Button
          size='small'
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          onClick={() => onClickButton('/meus-personagens')}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Ver todas
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: `repeat(${recentSheets.length + 1}, minmax(0, 1fr))`,
          },
          gap: 1.25,
        }}
      >
        {recentSheets.map((sheet, index) => {
          const data = getSheetData(sheet);
          let classLabel = data.classe?.name;
          if (
            data.classLevels &&
            Array.isArray(data.classLevels) &&
            data.classLevels.length > 0
          ) {
            const classMap = new Map<string, number>();
            data.classLevels.forEach((cl) => {
              classMap.set(cl.className, (classMap.get(cl.className) ?? 0) + 1);
            });
            if (classMap.size > 1) {
              classLabel = Array.from(classMap.entries())
                .map(([name, level]) => `${name} ${level}`)
                .join(' / ');
            }
          }

          return (
            <Box
              key={sheet.id}
              onClick={() => onClickButton(`/ficha/${sheet.id}`)}
              sx={{
                animation: `scaleIn 0.4s ease-out ${0.08 * (index + 1)}s both`,
                background: isDark
                  ? 'rgba(45, 45, 45, 0.85)'
                  : 'rgba(255, 255, 255, 0.9)',
                color: isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                cursor: 'pointer',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }`,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
                transition: 'all 0.18s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${
                    isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'
                  }`,
                },
              }}
            >
              <Box
                component='img'
                src={sheet.image || tormenta20}
                alt={sheet.name}
                sx={{
                  width: 44,
                  height: 44,
                  objectFit: 'cover',
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontFamily: 'Tfont, serif',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sheet.name}
                </Typography>
                <Stack
                  direction='row'
                  spacing={0.5}
                  sx={{
                    alignItems: 'center',
                    mt: 0.25,
                    minWidth: 0,
                  }}
                >
                  {classLabel && (
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.65rem',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {classLabel}
                    </Typography>
                  )}
                  {data.nivel && (
                    <Chip
                      label={`Nv${data.nivel}`}
                      size='small'
                      sx={{
                        fontSize: '0.6rem',
                        height: 16,
                        flexShrink: 0,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Box>
          );
        })}

        {/* "New sheet" compact slot */}
        <Box
          onClick={() => onClickButton('/criar-ficha')}
          sx={{
            background: 'transparent',
            border: `1.5px dashed ${theme.palette.primary.main}`,
            borderRadius: 2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            color: theme.palette.primary.main,
            minHeight: 60,
            p: 1,
            transition: 'all 0.18s ease',
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}10`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          <Typography
            variant='subtitle2'
            sx={{
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            Nova ficha
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ContinueJourneySection;
