import React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BackpackIcon from '@mui/icons-material/Backpack';
import NumberField from '@/components/common/NumberField';
import CategoryChips from './CategoryChips';
import {
  MarketCategoryDescriptor,
  MarketCategoryKey,
  MarketSortKey,
  SORT_LABELS,
} from './marketCategories';

interface MarketToolbarProps {
  money: number | null;
  remainingMoney: number;
  bagItemCount: number;
  bagSpaces: number;
  search: string;
  activeCategory: MarketCategoryKey;
  categoryCounts: Record<string, number>;
  descriptor: MarketCategoryDescriptor;
  subFilter: string | null;
  sortBy: MarketSortKey;
  autoDeduct: boolean;
  compact: boolean;
  onMoneyChange: (value: number | null) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (key: MarketCategoryKey) => void;
  onSubFilterChange: (key: string | null) => void;
  onSortChange: (key: MarketSortKey) => void;
  onAutoDeductChange: (value: boolean) => void;
  onToggleBag: () => void;
}

const CONTAINER_SX = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  bgcolor: 'background.paper',
  borderBottom: 1,
  borderColor: 'divider',
  pb: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
} as const;

const SUMMARY_SX = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1,
} as const;

const FILTER_ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 0.75,
} as const;

const MONEY_FIELD_SX = { width: 130 } as const;
const SORT_FIELD_SX = { minWidth: 140 } as const;
const SPACER_SX = { flex: '1 1 auto' } as const;
const SUB_CHIP_SX = { flexShrink: 0 } as const;

const MarketToolbar: React.FC<MarketToolbarProps> = ({
  money,
  remainingMoney,
  bagItemCount,
  bagSpaces,
  search,
  activeCategory,
  categoryCounts,
  descriptor,
  subFilter,
  sortBy,
  autoDeduct,
  compact,
  onMoneyChange,
  onSearchChange,
  onCategoryChange,
  onSubFilterChange,
  onSortChange,
  onAutoDeductChange,
  onToggleBag,
}) => (
  <Box sx={CONTAINER_SX}>
    <Box sx={SUMMARY_SX}>
      <NumberField
        value={money}
        onValueChange={onMoneyChange}
        size='small'
        min={0}
        sx={MONEY_FIELD_SX}
        label='Dinheiro'
        startAdornment={<InputAdornment position='start'>T$</InputAdornment>}
      />
      <Chip
        label={`Restante: T$ ${remainingMoney}`}
        size='small'
        color={remainingMoney > 0 ? 'default' : 'warning'}
      />
      <Box sx={SPACER_SX} />
      <Button
        size='small'
        variant='outlined'
        startIcon={<BackpackIcon />}
        onClick={onToggleBag}
      >
        {compact
          ? `${bagItemCount} itens`
          : `Mochila · ${bagItemCount} itens · ${bagSpaces} esp.`}
      </Button>
    </Box>

    <TextField
      placeholder='Buscar em todas as categorias...'
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      size='small'
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position='end'>
              <IconButton
                size='small'
                onClick={() => onSearchChange('')}
                aria-label='Limpar busca'
              >
                <ClearIcon fontSize='small' />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />

    <CategoryChips
      active={activeCategory}
      counts={categoryCounts}
      onChange={onCategoryChange}
    />

    <Box sx={FILTER_ROW_SX}>
      {descriptor.subFilters?.map((filter) => {
        const isActive = subFilter === filter.key;
        return (
          <Chip
            key={filter.key}
            label={filter.label}
            size='small'
            sx={SUB_CHIP_SX}
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'secondary' : 'default'}
            onClick={() => onSubFilterChange(isActive ? null : filter.key)}
          />
        );
      })}
      <Box sx={SPACER_SX} />
      <FormControlLabel
        control={
          <Switch
            size='small'
            checked={autoDeduct}
            onChange={(event) => onAutoDeductChange(event.target.checked)}
          />
        }
        label={
          <Typography variant='caption'>
            Descontar T$ automaticamente
          </Typography>
        }
      />
      <TextField
        select
        size='small'
        label='Ordenar'
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as MarketSortKey)}
        sx={SORT_FIELD_SX}
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  </Box>
);

export default React.memo(MarketToolbar);
