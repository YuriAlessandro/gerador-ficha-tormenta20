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
import tormenta20 from '@/assets/images/tormenta20.jpg';
import { useSheets } from '../../hooks/useSheets';
import { SheetData } from '../../services/sheets.service';

interface RecentSheetsSectionProps {
  onClickButton: (link: string) => void;
  isAuthenticated: boolean;
}

interface SheetDataContent {
  raca?: { name: string };
  classe?: { name: string };
  nivel?: number;
  isThreat?: boolean;
}

const RecentSheetsSection: React.FC<RecentSheetsSectionProps> = ({
  onClickButton,
  isAuthenticated,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { sheets, loading } = useSheets();

  const recentSheets = useMemo(() => {
    if (!isAuthenticated || !sheets || sheets.length === 0) {
      return [];
    }

    return sheets
      .filter((sheet) => !sheet.sheetData?.isThreat)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3);
  }, [isAuthenticated, sheets]);

  const getSheetData = (sheet: SheetData): SheetDataContent =>
    (sheet.sheetData as SheetDataContent) || {};

  const handleSheetClick = (sheet: SheetData) => {
    onClickButton(`/ficha/${sheet.id}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Suas Fichas Recentes
        </Typography>
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={70}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  if (recentSheets.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant='h5' className='section-title' sx={{ mb: 2 }}>
        Suas Fichas Recentes
      </Typography>

      <Stack spacing={1.5}>
        {recentSheets.map((sheet, index) => {
          const data = getSheetData(sheet);
          return (
            <Box
              key={sheet.id}
              onClick={() => handleSheetClick(sheet)}
              sx={{
                display: 'flex',
                gap: 1.5,
                animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                background: isDark
                  ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                color: isDark ? '#ffffff' : 'inherit',
                borderRadius: 2,
                p: 1.5,
                cursor: 'pointer',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Box
                component='img'
                src={sheet.image || tormenta20}
                alt={sheet.name}
                sx={{
                  width: 60,
                  height: 50,
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
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5,
                  }}
                >
                  {sheet.name}
                </Typography>

                <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
                  {data.classe?.name && (
                    <Chip
                      label={data.classe.name}
                      size='small'
                      color='primary'
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {data.raca?.name && (
                    <Chip
                      label={data.raca.name}
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {data.nivel && (
                    <Chip
                      label={`Nv${data.nivel}`}
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </Stack>

                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}
                >
                  Editado em{' '}
                  {new Date(sheet.updatedAt).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Button
        variant='contained'
        size='small'
        fullWidth
        endIcon={<ArrowForwardIcon />}
        onClick={() => onClickButton('/meus-personagens')}
        sx={{ mt: 2 }}
      >
        Ver Todas
      </Button>
    </Box>
  );
};

export default RecentSheetsSection;
