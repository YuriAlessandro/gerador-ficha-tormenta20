import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PowerOriginDescriptor } from '@/functions/powers/powerOrigins';
import {
  CHIP_SCROLLER_SX,
  FILTER_CHIP_SX,
  TOOLBAR_SX,
} from './powersTabStyles';

export interface OriginFilterOption {
  key: string;
  label: string;
  count: number;
  descriptor: PowerOriginDescriptor;
}

export interface PowersToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  originOptions: OriginFilterOption[];
  activeOrigins: Set<string>;
  onToggleOrigin: (key: string) => void;
  onResetOrigins: () => void;
  canReorder: boolean;
  reorderMode: boolean;
  onReorderModeChange: (value: boolean) => void;
  hasCustomOrder: boolean;
  onResetOrder: () => void;
}

/**
 * Busca + chips de filtro por origem, grudados no topo da aba.
 *
 * Em modo reordenar a toolbar se reduz aos controles de reordenação: filtrar
 * uma lista que você está arrastando não faz sentido, e `powersOrder` é uma
 * lista plana — arrastar dentro de um subconjunto corromperia os índices.
 */
const PowersToolbar: React.FC<PowersToolbarProps> = ({
  searchTerm,
  onSearchTermChange,
  originOptions,
  activeOrigins,
  onToggleOrigin,
  onResetOrigins,
  canReorder,
  reorderMode,
  onReorderModeChange,
  hasCustomOrder,
  onResetOrder,
}) => {
  const reorderControls = canReorder && (
    <Stack direction='row' spacing={0.5} sx={{ flexShrink: 0 }}>
      {reorderMode && hasCustomOrder && (
        <Tooltip title='Restaurar ordem alfabética'>
          <IconButton size='small' onClick={onResetOrder}>
            <RestartAltIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip
        title={reorderMode ? 'Concluir reordenação' : 'Reordenar poderes'}
      >
        <IconButton
          size='small'
          color={reorderMode ? 'primary' : 'default'}
          onClick={() => onReorderModeChange(!reorderMode)}
          aria-label={
            reorderMode ? 'Concluir reordenação' : 'Reordenar poderes'
          }
        >
          {reorderMode ? (
            <CheckIcon fontSize='small' />
          ) : (
            <DragIndicatorIcon fontSize='small' />
          )}
        </IconButton>
      </Tooltip>
    </Stack>
  );

  if (reorderMode) {
    return (
      <Box sx={TOOLBAR_SX}>
        <Stack direction='row' sx={{ alignItems: 'center', gap: 1, pt: 1 }}>
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', flex: 1, minWidth: 0 }}
          >
            Arraste para reordenar. Filtros e busca voltam ao concluir.
          </Typography>
          {reorderControls}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={TOOLBAR_SX}>
      <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75, pt: 1 }}>
        <TextField
          size='small'
          sx={{ flex: 1, minWidth: 0 }}
          placeholder='Buscar poder...'
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => onSearchTermChange('')}
                    aria-label='Limpar busca'
                  >
                    <ClearIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        {reorderControls}
      </Stack>

      {originOptions.length > 1 && (
        <Box sx={CHIP_SCROLLER_SX}>
          <Chip
            label='Todos'
            size='small'
            sx={FILTER_CHIP_SX}
            color={activeOrigins.size === 0 ? 'primary' : 'default'}
            variant={activeOrigins.size === 0 ? 'filled' : 'outlined'}
            onClick={onResetOrigins}
          />
          {originOptions.map((option) => (
            <Chip
              key={option.key}
              label={`${option.label} (${option.count})`}
              size='small'
              sx={FILTER_CHIP_SX}
              color={activeOrigins.has(option.key) ? 'primary' : 'default'}
              variant={activeOrigins.has(option.key) ? 'filled' : 'outlined'}
              onClick={() => onToggleOrigin(option.key)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PowersToolbar;
