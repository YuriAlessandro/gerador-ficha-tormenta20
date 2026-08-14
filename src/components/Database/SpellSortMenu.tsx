import React, { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';

export type SortCriterion = 'name' | 'school' | 'circle';

export const SORT_CRITERIA: SortCriterion[] = ['name', 'school', 'circle'];

export const SORT_CRITERION_LABELS: Record<SortCriterion, string> = {
  name: 'Alfabética',
  school: 'Escola',
  circle: 'Círculo',
};

const POSITION_LABELS = ['1º critério', '2º critério', '3º critério'];

interface SpellSortMenuProps {
  sortOrder: SortCriterion[];
  onChange: (newOrder: SortCriterion[]) => void;
}

const SpellSortMenu: React.FC<SpellSortMenuProps> = ({
  sortOrder,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 720px)');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Ao escolher um critério já usado em outra posição, os dois trocam de lugar
  const handleSelect = (index: number, value: SortCriterion) => {
    if (sortOrder[index] === value) return;
    const next = [...sortOrder];
    const previous = next[index];
    const existingIndex = next.indexOf(value);
    next[index] = value;
    if (existingIndex !== -1) next[existingIndex] = previous;
    onChange(next);
  };

  const currentOrderLabel = sortOrder
    .map((c) => SORT_CRITERION_LABELS[c])
    .join(' > ');

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.primary.main}33`,
        overflow: 'hidden',
      }}
    >
      {/* Header (mesmo estilo do AdvancedSpellFilter) */}
      <Box
        sx={{
          p: 2,
          background: isDark
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: expanded
            ? `1px solid ${theme.palette.primary.main}4D`
            : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SortIcon color='primary' />
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Tfont, serif',
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Ordenação
          </Typography>
          <Chip
            label={currentOrderLabel}
            size='small'
            color='primary'
            sx={{ ml: 1, fontFamily: 'Tfont, serif' }}
          />
        </Box>
        <IconButton size='small' sx={{ color: theme.palette.primary.main }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout='auto'>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {sortOrder.map((criterion, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <FormControl fullWidth size='small'>
                  <InputLabel id={`sort-position-${index}-label`}>
                    {POSITION_LABELS[index]}
                  </InputLabel>
                  <Select
                    labelId={`sort-position-${index}-label`}
                    value={criterion}
                    label={POSITION_LABELS[index]}
                    onChange={(e) =>
                      handleSelect(index, e.target.value as SortCriterion)
                    }
                  >
                    {SORT_CRITERIA.map((option) => (
                      <MenuItem key={option} value={option}>
                        {SORT_CRITERION_LABELS[option]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>

          {/* Caixa de dica (mesmo estilo do AdvancedSpellFilter) */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: `${theme.palette.primary.main}0D`,
              borderRadius: 1,
            }}
          >
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              <strong>Dica:</strong> A lista é ordenada pelo primeiro critério;
              em caso de empate, pelo segundo; e por fim pelo terceiro. Ordem
              atual: <strong>{currentOrderLabel}</strong>.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SpellSortMenu;
