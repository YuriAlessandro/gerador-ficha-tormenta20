import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import Skill, { ALL_SPECIFIC_OFICIOS } from '@/interfaces/Skills';
import { buildCustomOficio } from '@/functions/oficio';
import { normalizeSearch } from '@/functions/stringUtils';

interface OficioPickerProps {
  /** Ofícios escolhidos. Inclui customizados — é a fonte da verdade dos chips. */
  selected: Skill[];
  /** Catálogo oferecido no menu. Default: os 16 do livro. */
  options?: Skill[];
  /** Já usados em outro passo/grupo: aparecem desabilitados e bloqueiam custom. */
  unavailable?: Skill[];
  /** false => escolher substitui a escolha atual (grupo "escolha uma"). */
  multiple?: boolean;
  /** Bloqueia novas adições; desmarcar continua permitido. */
  maxReached?: boolean;
  /** Libera o campo de texto livre. */
  allowCustom?: boolean;
  /** Renderiza os chips dos selecionados ao lado do gatilho. */
  showSelectedChips?: boolean;
  onSelect: (oficio: Skill) => void;
  onDeselect?: (oficio: Skill) => void;
}

const OficioPicker: React.FC<OficioPickerProps> = ({
  selected,
  options = ALL_SPECIFIC_OFICIOS,
  unavailable = [],
  multiple = true,
  maxReached = false,
  allowCustom = false,
  showSelectedChips = true,
  onSelect,
  onDeselect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const open = Boolean(anchorEl);

  const close = () => {
    setAnchorEl(null);
    setSearch('');
    setError('');
  };

  // Customizados já escolhidos entram na lista para poderem ser desmarcados
  // aqui dentro — eles nunca estão em `options`, que vem do enum.
  const allEntries = useMemo(() => {
    const customSelected = selected.filter((s) => !options.includes(s));
    return [...customSelected, ...options];
  }, [options, selected]);

  const visibleEntries = useMemo(() => {
    const query = normalizeSearch(search.trim());
    if (!query) return allEntries;
    return allEntries.filter((entry) => normalizeSearch(entry).includes(query));
  }, [allEntries, search]);

  const exactMatch = useMemo(
    () =>
      allEntries.some(
        (entry) => normalizeSearch(entry) === normalizeSearch(search.trim())
      ),
    [allEntries, search]
  );

  const customCandidate = useMemo(() => {
    if (!allowCustom || !search.trim() || exactMatch) return null;
    return buildCustomOficio(search, [...selected, ...unavailable]);
  }, [allowCustom, search, exactMatch, selected, unavailable]);

  const handleChoose = (oficio: Skill) => {
    if (selected.includes(oficio)) {
      onDeselect?.(oficio);
      if (!multiple) close();
      return;
    }
    if (maxReached) return;
    onSelect(oficio);
    if (multiple) {
      setSearch('');
      setError('');
      inputRef.current?.focus();
    } else {
      close();
    }
  };

  const handleCreateCustom = () => {
    if (!customCandidate) return;
    if (!customCandidate.ok) {
      setError(customCandidate.error);
      return;
    }
    if (maxReached) return;
    onSelect(customCandidate.value);
    if (multiple) {
      setSearch('');
      setError('');
      inputRef.current?.focus();
    } else {
      close();
    }
  };

  const triggerLabel =
    multiple && selected.length > 0 ? `Ofício (${selected.length})` : 'Ofício';

  const renderContent = () => (
    <Box sx={{ minWidth: 260 }}>
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          size='small'
          error={!!error}
          helperText={error || undefined}
          placeholder={
            allowCustom ? 'Buscar ou criar ofício...' : 'Buscar ofício...'
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setError('');
          }}
          // O Menu do MUI faz type-ahead e rouba o foco para os MenuItem;
          // sem isto é impossível digitar no campo.
          onKeyDown={(e) => {
            if (e.key !== 'Escape') e.stopPropagation();
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreateCustom();
            }
          }}
        />
      </Box>
      <Divider />
      <Box sx={{ maxHeight: isMobile ? '50vh' : 320, overflowY: 'auto' }}>
        {visibleEntries.map((entry) => {
          const isSelected = selected.includes(entry);
          const isUnavailable = !isSelected && unavailable.includes(entry);
          const isDisabled = isUnavailable || (!isSelected && maxReached);

          return (
            <MenuItem
              key={entry}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => handleChoose(entry)}
            >
              <ListItemText
                primary={entry}
                secondary={isUnavailable ? 'já escolhida' : undefined}
              />
              {isSelected && <CheckIcon fontSize='small' color='primary' />}
            </MenuItem>
          );
        })}
        {visibleEntries.length === 0 && !customCandidate && (
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', px: 2, py: 1.5 }}
          >
            Nenhum ofício encontrado.
          </Typography>
        )}
        {customCandidate && (
          <MenuItem disabled={maxReached} onClick={handleCreateCustom}>
            <AddIcon fontSize='small' sx={{ mr: 1 }} />
            <ListItemText
              primary={
                customCandidate.ok
                  ? `Criar "${customCandidate.value}"`
                  : customCandidate.error
              }
            />
          </MenuItem>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {showSelectedChips &&
        selected.map((oficio) => (
          <Chip
            key={oficio}
            label={oficio}
            size='small'
            variant='filled'
            color='primary'
            onDelete={onDeselect ? () => onDeselect(oficio) : undefined}
            sx={{ '&:hover': { backgroundColor: 'primary.dark' } }}
          />
        ))}
      <Chip
        label={
          <Box
            component='span'
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {triggerLabel}
            <ArrowDropDownIcon fontSize='small' sx={{ ml: 0.25, mr: -0.5 }} />
          </Box>
        }
        size='small'
        variant='outlined'
        color='default'
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(209, 50, 53, 0.08)' },
        }}
      />
      {isMobile ? (
        <Drawer anchor='bottom' open={open} onClose={close}>
          <Box sx={{ pt: 1, pb: 2 }}>
            <Typography
              variant='overline'
              sx={{ px: 2, color: 'text.secondary' }}
            >
              Ofício
            </Typography>
            {renderContent()}
          </Box>
        </Drawer>
      ) : (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={close}
          disableAutoFocusItem
          slotProps={{ list: { autoFocusItem: false, sx: { pt: 0 } } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {renderContent()}
        </Menu>
      )}
    </>
  );
};

export default OficioPicker;
