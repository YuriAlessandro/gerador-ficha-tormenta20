import React from 'react';
import { Box, Typography, Button, Stack, Chip, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import {
  GameTable,
  GameTableStatus,
} from '../../premium/services/gameTable.service';

interface VirtualTablesColumnProps {
  onClickButton: (link: string) => void;
  tables: GameTable[];
}

const MAX_TABLES = 1;

const statusLabel = (status: GameTableStatus): string => {
  switch (status) {
    case GameTableStatus.ACTIVE:
      return 'Ativa';
    case GameTableStatus.PAUSED:
      return 'Pausada';
    case GameTableStatus.ARCHIVED:
      return 'Arquivada';
    default:
      return 'Preparando';
  }
};

const statusColor = (
  status: GameTableStatus
): 'success' | 'warning' | 'default' | 'info' => {
  switch (status) {
    case GameTableStatus.ACTIVE:
      return 'success';
    case GameTableStatus.PAUSED:
      return 'warning';
    case GameTableStatus.ARCHIVED:
      return 'default';
    default:
      return 'info';
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const VirtualTablesColumn: React.FC<VirtualTablesColumnProps> = ({
  onClickButton,
  tables,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const sectionHeader = (action?: React.ReactNode) => (
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
        Suas mesas
      </Typography>
      {action}
    </Stack>
  );

  // No tables yet — empty state
  if (tables.length === 0) {
    return (
      <Box>
        {sectionHeader()}
        <Box
          onClick={() => onClickButton('/mesas')}
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
          <TableRestaurantIcon
            sx={{ fontSize: 36, opacity: 0.95, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='subtitle1'
              sx={{ fontFamily: 'Tfont, serif', fontWeight: 700, mb: 0.25 }}
            >
              Crie sua primeira mesa
            </Typography>
            <Typography
              variant='caption'
              sx={{ opacity: 0.9, fontSize: '0.8rem' }}
            >
              Jogue Tormenta 20 online com seus amigos
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ flexShrink: 0 }} />
        </Box>
      </Box>
    );
  }

  const visibleTables = tables.slice(0, MAX_TABLES);

  return (
    <Box>
      {sectionHeader(
        <Button
          size='small'
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          onClick={() => onClickButton('/mesas')}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Ver todas
        </Button>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: `repeat(${visibleTables.length + 1}, minmax(0, 1fr))`,
          },
          gap: 1.25,
        }}
      >
        {visibleTables.map((table, index) => (
          <Box
            key={table.id}
            onClick={() => onClickButton(`/mesa/${table.id}`)}
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
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: '#ffffff',
              }}
            >
              <TableRestaurantIcon sx={{ fontSize: 22 }} />
            </Box>
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
                {table.name}
              </Typography>
              <Stack
                direction='row'
                spacing={0.75}
                sx={{
                  alignItems: 'center',
                  mt: 0.25,
                  minWidth: 0,
                }}
              >
                <Chip
                  label={statusLabel(table.status)}
                  size='small'
                  color={statusColor(table.status)}
                  sx={{
                    fontSize: '0.6rem',
                    height: 16,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
                <Stack
                  direction='row'
                  spacing={0.3}
                  sx={{
                    alignItems: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <PeopleAltIcon sx={{ fontSize: 11 }} />
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.65rem',
                    }}
                  >
                    {table.members.length}
                  </Typography>
                </Stack>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                  }}
                >
                  {formatDate(table.updatedAt)}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ))}

        {/* "New table" compact slot */}
        <Box
          onClick={() => onClickButton('/mesas')}
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
            Nova mesa
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualTablesColumn;
