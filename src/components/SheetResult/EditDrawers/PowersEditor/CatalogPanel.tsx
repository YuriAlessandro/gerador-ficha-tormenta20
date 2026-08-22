import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { POWER_ORIGINS } from '@/functions/powers/powerOrigins';
import PowerCatalogRow from './PowerCatalogRow';
import { CatalogEntry, usePowerCatalog } from './usePowerCatalog';
import {
  CHIP_SCROLLER_SX,
  EMPTY_SX,
  FILTER_CHIP_SX,
  GROUP_TITLE_SX,
  STICKY_GROUP_HEADER_SX,
  TOOLBAR_SX,
} from './powersEditorStyles';

type Catalog = ReturnType<typeof usePowerCatalog>;

interface CatalogPanelProps {
  catalog: Catalog;
  /** Quantas vezes cada poder está na ficha, indexado pelo nome. */
  counts: Map<string, number>;
  isSelected: (entry: CatalogEntry) => boolean;
  onToggle: (entry: CatalogEntry) => void;
  /** Nem todo repetível sabe adicionar outra instância — ver `canAddAnother`. */
  canAddAnother: (entry: CatalogEntry) => boolean;
  onAddAnother: (entry: CatalogEntry) => void;
}

/**
 * A coluna esquerda: busca e filtros grudados no topo, lista rolando abaixo.
 *
 * Sem accordions. O editor antigo tinha cinco famílias deles, todas começando
 * fechadas e todas montando o conteúdo mesmo fechadas — o pior dos dois
 * mundos. Aqui os grupos são cabeçalhos numa lista contínua.
 */
const CatalogPanel: React.FC<CatalogPanelProps> = ({
  catalog,
  counts,
  isSelected,
  onToggle,
  canAddAnother,
  onAddAnother,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    activeSearch,
    activeGroups,
    toggleGroup,
    resetGroups,
    groupOptions,
    onlyAvailable,
    setOnlyAvailable,
    filteredGroups,
    searchResults,
    resultCount,
    availabilityOf,
  } = catalog;

  const renderRow = (entry: CatalogEntry) => {
    const selected = isSelected(entry);
    return (
      <PowerCatalogRow
        key={entry.id}
        name={entry.name}
        description={entry.description}
        icon={entry.icon}
        color={entry.color}
        availability={availabilityOf(entry)}
        selected={selected}
        count={counts.get(entry.name) ?? 0}
        repeatable={entry.repeatable}
        badge={entry.badge}
        highlight={activeSearch}
        onToggle={() => onToggle(entry)}
        onAddAnother={
          canAddAnother(entry) ? () => onAddAnother(entry) : undefined
        }
      />
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ ...TOOLBAR_SX, px: 1.5 }}>
        <TextField
          fullWidth
          size='small'
          placeholder='Buscar poder ou habilidade...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position='end'>
                  <Button
                    size='small'
                    onClick={() => setSearchTerm('')}
                    aria-label='Limpar busca'
                    sx={{ minWidth: 0, p: 0.5 }}
                  >
                    <ClearIcon fontSize='small' />
                  </Button>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Box sx={{ ...CHIP_SCROLLER_SX, mt: 1, rowGap: 0.75 }}>
          <Chip
            label='Todos'
            size='small'
            sx={FILTER_CHIP_SX}
            color={activeGroups.size === 0 ? 'primary' : 'default'}
            variant={activeGroups.size === 0 ? 'filled' : 'outlined'}
            onClick={resetGroups}
          />
          {groupOptions.map((option) => (
            <Chip
              key={option.key}
              label={`${option.label} (${option.count})`}
              size='small'
              sx={FILTER_CHIP_SX}
              color={activeGroups.has(option.key) ? 'primary' : 'default'}
              variant={activeGroups.has(option.key) ? 'filled' : 'outlined'}
              onClick={() => toggleGroup(option.key)}
            />
          ))}
        </Box>

        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0.5,
          }}
        >
          <FormControlLabel
            sx={{ ml: 0, mr: 0, gap: 1 }}
            control={
              <Switch
                size='small'
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                slotProps={{
                  input: { 'aria-label': 'Só os que posso pegar' },
                }}
              />
            }
            label={
              <Typography variant='caption'>Só os que posso pegar</Typography>
            }
          />
          {activeSearch && (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {resultCount} resultado{resultCount === 1 ? '' : 's'}
            </Typography>
          )}
        </Stack>
      </Box>

      <Box
        sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, pb: 2 }}
      >
        {resultCount === 0 && (
          <Typography sx={{ ...EMPTY_SX, textAlign: 'center' }}>
            {activeSearch
              ? `Nenhum poder encontrado para «${activeSearch}».`
              : 'Nenhum poder corresponde aos filtros ativos.'}
          </Typography>
        )}

        {/* Buscando: lista única achatada, para um resultado aparecer sozinho. */}
        {activeSearch
          ? searchResults.map(renderRow)
          : filteredGroups.map((group) => {
              const Icon = POWER_ORIGINS[group.kind].icon;
              return (
                <Box key={group.key}>
                  <Box sx={STICKY_GROUP_HEADER_SX}>
                    <Icon
                      sx={{
                        color: POWER_ORIGINS[group.kind].color,
                        fontSize: '1.15rem',
                      }}
                    />
                    <Typography sx={{ ...GROUP_TITLE_SX, fontSize: '0.95rem' }}>
                      {group.label}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary' }}
                    >
                      {group.entries.length}
                    </Typography>
                  </Box>
                  {group.entries.map(renderRow)}
                </Box>
              );
            })}
      </Box>
    </Box>
  );
};

export default CatalogPanel;
