import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TOUCH_CHIP_SX } from '@/components/common/responsiveSx';
import { normalizeSearch } from '@/functions/stringUtils';

export interface ClickableFilterOption {
  value: string;
  label: string;
  count?: number;
  group?: string;
}

export interface ClickableChipFilterGroupProps {
  label?: string;
  options: ClickableFilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
  allLabel?: string;
  /** Quando há muitas opções (ex.: >24 raças/deuses), exibe busca rápida sobre os chips. */
  enableQuickFilter?: boolean;
  quickFilterPlaceholder?: string;
  grouped?: boolean;
}

/**
 * Grupo de filtros em chips 100% clicáveis e responsivos para /database/*.
 */
const ClickableChipFilterGroup: React.FC<ClickableChipFilterGroupProps> = ({
  label,
  options,
  selected,
  onToggle,
  onClear,
  allLabel = 'Todos',
  enableQuickFilter = false,
  quickFilterPlaceholder = 'Filtrar opções...',
  grouped = false,
}) => {
  const theme = useTheme();
  const [quickQuery, setQuickQuery] = useState('');

  const visibleOptions = useMemo(() => {
    const q = normalizeSearch(quickQuery.trim());
    if (!q) return options;
    return options.filter(
      (opt) =>
        selected.includes(opt.value) ||
        normalizeSearch(opt.label).includes(q) ||
        (opt.group && normalizeSearch(opt.group).includes(q))
    );
  }, [options, quickQuery, selected]);

  const groupedSections = useMemo(() => {
    if (!grouped) {
      return [{ group: '', items: visibleOptions }];
    }
    const order: string[] = [];
    const map = new Map<string, ClickableFilterOption[]>();
    visibleOptions.forEach((opt) => {
      const g = opt.group || 'Outros';
      if (!map.has(g)) {
        order.push(g);
        map.set(g, []);
      }
      map.get(g)!.push(opt);
    });
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [grouped, visibleOptions]);

  if (options.length === 0) return null;

  const renderChip = (opt: ClickableFilterOption) => {
    const isSelected = selected.includes(opt.value);
    const chipLabel =
      opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label;
    return (
      <Chip
        key={opt.value}
        label={chipLabel}
        size='small'
        clickable
        variant={isSelected ? 'filled' : 'outlined'}
        color={isSelected ? 'primary' : 'default'}
        onClick={() => onToggle(opt.value)}
        sx={[
          {
            fontFamily: 'Tfont, serif',
            cursor: 'pointer',
          },
          TOUCH_CHIP_SX(theme),
        ]}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {(label || enableQuickFilter || (selected.length > 0 && onClear)) && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {label && (
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'Tfont, serif',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                {label}
              </Typography>
            )}
            {selected.length > 0 && onClear && (
              <Button
                size='small'
                variant='text'
                startIcon={<ClearIcon fontSize='small' />}
                onClick={onClear}
                sx={{ minHeight: 28, py: 0, textTransform: 'none' }}
              >
                Limpar ({selected.length})
              </Button>
            )}
          </Box>

          {enableQuickFilter && options.length > 14 && (
            <TextField
              size='small'
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder={quickFilterPlaceholder}
              sx={{ width: { xs: '100%', sm: 240 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </Box>
      )}

      {grouped ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {allLabel && onClear && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              <Chip
                label={allLabel}
                size='small'
                clickable
                variant={selected.length === 0 ? 'filled' : 'outlined'}
                color={selected.length === 0 ? 'primary' : 'default'}
                onClick={onClear}
                sx={[{ fontFamily: 'Tfont, serif' }, TOUCH_CHIP_SX(theme)]}
              />
            </Box>
          )}
          {groupedSections.map((section) => (
            <Box key={section.group}>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 0.5,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                }}
              >
                {section.group}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                }}
              >
                {section.items.map(renderChip)}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {allLabel && onClear && (
            <Chip
              label={allLabel}
              size='small'
              clickable
              variant={selected.length === 0 ? 'filled' : 'outlined'}
              color={selected.length === 0 ? 'primary' : 'default'}
              onClick={onClear}
              sx={[{ fontFamily: 'Tfont, serif' }, TOUCH_CHIP_SX(theme)]}
            />
          )}
          {visibleOptions.map(renderChip)}
        </Box>
      )}
    </Box>
  );
};

export default ClickableChipFilterGroup;
