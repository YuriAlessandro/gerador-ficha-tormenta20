import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  SwapVert as ReorderIcon,
  ViewModule as GroupIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

import { equipGroup } from '../../../interfaces/Equipment';
import { CATEGORY_ORDER, itemTypeStyles } from './itemTypeStyles';

export interface BackpackToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategories: Set<equipGroup>;
  onToggleCategory: (category: equipGroup) => void;
  onResetCategories: () => void;
  reorderMode: boolean;
  onReorderModeChange: (active: boolean) => void;
  onAddItem: () => void;
  groupByCategory: boolean;
  onGroupByCategoryChange: (value: boolean) => void;
}

const BackpackToolbar: React.FC<BackpackToolbarProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedCategories,
  onToggleCategory,
  onResetCategories,
  reorderMode,
  onReorderModeChange,
  onAddItem,
  groupByCategory,
  onGroupByCategoryChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Filtros começam escondidos por padrão em todas as larguras; o ícone de
  // filtro com badge mostra quantas categorias estão selecionadas.
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: { xs: 1.25, sm: 2 },
        py: { xs: 1, sm: 1.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.75, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          alignItems: 'center',
        }}
      >
        <TextField
          size='small'
          sx={{ flex: 1, minWidth: 0 }}
          placeholder='Buscar item...'
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={() => onSearchQueryChange('')}
                  aria-label='Limpar busca'
                >
                  <ClearIcon fontSize='small' />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Tooltip title='Reordenar itens'>
          <ToggleButton
            value='reorder'
            size='small'
            selected={reorderMode}
            onChange={() => onReorderModeChange(!reorderMode)}
            aria-label='Modo reordenar'
          >
            <ReorderIcon fontSize='small' />
          </ToggleButton>
        </Tooltip>

        {isMobile ? (
          <Tooltip
            title={
              groupByCategory
                ? 'Listar plano (sem grupos)'
                : 'Agrupar por categoria'
            }
          >
            <ToggleButton
              value='group'
              size='small'
              selected={groupByCategory}
              onChange={() => onGroupByCategoryChange(!groupByCategory)}
              aria-label='Agrupar por categoria'
            >
              <GroupIcon fontSize='small' />
            </ToggleButton>
          </Tooltip>
        ) : (
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={groupByCategory}
                onChange={(_, v) => onGroupByCategoryChange(v)}
              />
            }
            label='Agrupar por categoria'
            sx={{ ml: 0, mr: 0 }}
          />
        )}

        <Tooltip title='Filtrar por categoria'>
          <IconButton
            size='small'
            onClick={() => setFiltersOpen((v) => !v)}
            aria-label='Mostrar filtros'
            color={filtersOpen ? 'primary' : 'default'}
          >
            <Badge
              badgeContent={selectedCategories.size}
              color='primary'
              overlap='circular'
            >
              <FilterIcon fontSize='small' />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title='Adicionar item'>
          <IconButton
            color='primary'
            onClick={onAddItem}
            aria-label='Adicionar'
            size={isMobile ? 'small' : 'medium'}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={filtersOpen} unmountOnExit={isMobile}>
        <Stack
          direction='row'
          spacing={0.5}
          sx={{ flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}
        >
          <Chip
            label='Todas'
            size='small'
            color={selectedCategories.size === 0 ? 'primary' : 'default'}
            variant={selectedCategories.size === 0 ? 'filled' : 'outlined'}
            onClick={onResetCategories}
          />
          {CATEGORY_ORDER.map((cat) => {
            const style = itemTypeStyles[cat];
            const Icon = style.icon;
            const selected = selectedCategories.has(cat);
            return (
              <Chip
                key={cat}
                label={style.label}
                size='small'
                icon={<Icon style={{ fontSize: 16, color: style.color }} />}
                variant={selected ? 'filled' : 'outlined'}
                color={selected ? 'primary' : 'default'}
                onClick={() => onToggleCategory(cat)}
              />
            );
          })}
          {isMobile && selectedCategories.size > 0 && (
            <Button
              size='small'
              onClick={onResetCategories}
              sx={{ ml: 'auto', textTransform: 'none' }}
            >
              Limpar
            </Button>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default BackpackToolbar;
