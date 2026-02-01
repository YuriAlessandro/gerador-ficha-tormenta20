import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
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

  // Don't render for non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <Box>
        <Typography variant='h5' className='section-title'>
          Suas Fichas Recentes
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton
                variant='rectangular'
                height={180}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Don't render if no sheets
  if (recentSheets.length === 0) {
    return null;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={2}
        spacing={1}
      >
        <Typography variant='h5' className='section-title' sx={{ mb: 0 }}>
          Suas Fichas Recentes
        </Typography>
        <Button
          variant='outlined'
          size='small'
          endIcon={<ArrowForwardIcon />}
          onClick={() => onClickButton('/meus-personagens')}
        >
          Ver Todas
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {recentSheets.map((sheet, index) => {
          const data = getSheetData(sheet);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sheet.id}>
              <Box
                className='recent-sheet-card'
                onClick={() => handleSheetClick(sheet)}
                sx={{
                  animation: `scaleIn 0.4s ease-out ${0.1 * (index + 1)}s both`,
                  background: isDark
                    ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  color: isDark ? '#ffffff' : 'inherit',
                }}
              >
                {/* Card image */}
                <Box
                  component='img'
                  src={sheet.image || tormenta20}
                  alt={sheet.name}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                  }}
                />

                {/* Card content */}
                <Stack spacing={1} sx={{ p: 1.5 }}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontFamily: 'Tfont, serif',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sheet.name}
                  </Typography>

                  <Stack direction='row' spacing={1} flexWrap='wrap' gap={0.5}>
                    {data.classe?.name && (
                      <Chip
                        label={data.classe.name}
                        size='small'
                        color='primary'
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    {data.raca?.name && (
                      <Chip
                        label={data.raca.name}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    {data.nivel && (
                      <Chip
                        label={`Nv ${data.nivel}`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                  </Stack>

                  <Typography variant='caption' color='text.secondary'>
                    Editado em{' '}
                    {new Date(sheet.updatedAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default RecentSheetsSection;
