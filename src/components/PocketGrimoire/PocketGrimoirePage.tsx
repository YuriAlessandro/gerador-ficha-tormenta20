import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useHistory, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  Container,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorageIcon from '@mui/icons-material/Storage';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  removeItem,
  selectActiveId,
  selectGrimoireById,
} from '../../store/slices/pocketGrimoire/pocketGrimoireSlice';
import {
  getFullEncyclopediaIndex,
  groupResolvedItems,
  itemTitle,
  matchesFilter,
  resolveItems,
} from '../../functions/pocketGrimoire/resolveItems';
import {
  filterOfId,
  GrimoireFilter,
} from '../../functions/pocketGrimoire/itemId';
import { searchEncyclopedia } from '../../functions/encyclopediaSearch';
import { normalizeSearch } from '../../functions/stringUtils';
import { SEO } from '../SEO';
import GrimoireItemCard from './cards/GrimoireItemCard';
import GrimoireMenu from './GrimoireMenu';
import AddToGrimoireButton from './AddToGrimoireButton';
import GrimoireCollectibleCard from './cards/GrimoireCollectibleCard';
import GrimoireCardViewer from './cards/GrimoireCardViewer';
import GrimoireCardLegend from './cards/GrimoireCardLegend';
import { presentItem } from './cards/itemPresentation';
import { GrimoireViewMode, useGrimoireViewMode } from './useGrimoireViewMode';

/** Grimórios pequenos (uma one-shot) já abrem com tudo à vista. */
export const AUTO_OPEN_MAX_ITEMS = 5;
const SEARCH_RESULTS = 8;

const FILTERS: { value: GrimoireFilter; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'spells', label: 'Magias' },
  { value: 'powers', label: 'Poderes' },
  { value: 'abilities', label: 'Habilidades' },
  { value: 'others', label: 'Outros' },
];

const PocketGrimoirePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const grimoire = useAppSelector(selectGrimoireById(id));
  const activeId = useAppSelector(selectActiveId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GrimoireFilter>('all');
  const [viewMode, setViewMode] = useGrimoireViewMode();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const itemIds = grimoire?.itemIds;
  const resolved = useMemo(() => resolveItems(itemIds ?? []), [itemIds]);

  // Com uma categoria só, os chips não filtram nada: ficam escondidos.
  const presentFilters = useMemo(() => {
    const present = new Set<GrimoireFilter | null>(
      resolved.map((item) => filterOfId(item.id))
    );
    return FILTERS.filter(
      (option) => option.value === 'all' || present.has(option.value)
    );
  }, [resolved]);

  const normalizedQuery = normalizeSearch(query).trim();
  const groups = useMemo(
    () =>
      groupResolvedItems(
        resolved.filter(
          (item) =>
            matchesFilter(item, filter) &&
            normalizeSearch(itemTitle(item)).includes(normalizedQuery)
        )
      ),
    [resolved, filter, normalizedQuery]
  );

  // Ordem em que as cartas aparecem: é a ordem das setas ‹ › da carta ampliada.
  const orderedItems = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );
  // Ao remover a última carta, o visualizador recua; sem cartas, fecha.
  const openIndex =
    viewerIndex === null || orderedItems.length === 0
      ? null
      : Math.min(viewerIndex, orderedItems.length - 1);

  const searchResults = useMemo(
    () =>
      normalizedQuery.length >= 2
        ? searchEncyclopedia(getFullEncyclopediaIndex(), query, SEARCH_RESULTS)
        : [],
    [normalizedQuery, query]
  );

  if (!grimoire) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='info'>
          <Typography sx={{ fontWeight: 600 }}>
            Grimório não encontrado
          </Typography>
          <Link component={RouterLink} to='/grimorio'>
            Ver meus grimórios
          </Link>
        </Alert>
      </Container>
    );
  }

  const defaultOpen = grimoire.itemIds.length <= AUTO_OPEN_MAX_ITEMS;
  const handleRemove = (itemId: string) =>
    dispatch(removeItem(grimoire.id, itemId));

  return (
    <>
      <SEO title={`${grimoire.name} · Grimório de bolso`} url='/grimorio' />
      <Container maxWidth='md' sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 1,
          }}
        >
          <Link
            component={RouterLink}
            to='/grimorio'
            underline='hover'
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <ArrowBackIcon fontSize='small' />
            Meus grimórios de bolso
          </Link>
          <Link
            component={RouterLink}
            to='/database'
            underline='hover'
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <StorageIcon fontSize='small' />
            Ir para a enciclopédia
          </Link>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography
            variant='h4'
            sx={{ fontFamily: 'Tfont, serif', flex: 1, minWidth: 0 }}
          >
            {grimoire.name}
          </Typography>
          {grimoire.id === activeId && (
            <Chip label='ativo' size='small' color='primary' />
          )}
          <GrimoireMenu
            grimoire={grimoire}
            isActive={grimoire.id === activeId}
            onDeleted={() => history.push('/grimorio')}
          />
        </Box>

        <TextField
          fullWidth
          size='small'
          label='Buscar no grimório ou adicionar'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1.5 }}
        />

        {searchResults.length > 0 && (
          <Paper variant='outlined' sx={{ mb: 2 }}>
            <Typography
              variant='overline'
              sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}
            >
              Adicionar da enciclopédia
            </Typography>
            <List dense disablePadding>
              {searchResults.map(({ entry }) => (
                <ListItem
                  key={entry.id}
                  secondaryAction={
                    <AddToGrimoireButton
                      itemId={entry.id}
                      itemName={entry.title}
                      grimoireId={grimoire.id}
                    />
                  }
                >
                  <ListItemText
                    primary={entry.title}
                    secondary={`${entry.categoryLabel}${
                      entry.subtitle ? ` · ${entry.subtitle}` : ''
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {grimoire.itemIds.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
            }}
          >
            <Stack
              direction='row'
              spacing={1}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              {presentFilters.length > 2 &&
                presentFilters.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    clickable
                    color={filter === option.value ? 'primary' : 'default'}
                    onClick={() => setFilter(option.value)}
                  />
                ))}
            </Stack>
            <ToggleButtonGroup
              size='small'
              exclusive
              value={viewMode}
              onChange={(_event, next: GrimoireViewMode | null) => {
                if (next) setViewMode(next);
              }}
              aria-label='Como ver o grimório'
            >
              <ToggleButton value='list'>
                <FormatListBulletedIcon fontSize='small' sx={{ mr: 0.5 }} />
                Lista
              </ToggleButton>
              <ToggleButton value='cards'>
                <ViewModuleIcon fontSize='small' sx={{ mr: 0.5 }} />
                Cartas
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {grimoire.itemIds.length === 0 && (
          <Alert severity='info'>
            Este grimório está vazio. Busque acima ou use o marcador nos cards
            da{' '}
            <Link component={RouterLink} to='/database'>
              Enciclopédia
            </Link>
            .
          </Alert>
        )}

        {groups.map((group) => (
          <Box key={group.key} sx={{ mb: 2 }}>
            <Typography
              variant='overline'
              sx={{ color: 'primary.main', fontWeight: 700 }}
            >
              {group.label}
            </Typography>
            {viewMode === 'list' ? (
              group.items.map((item) => (
                <GrimoireItemCard
                  key={item.id}
                  item={item}
                  defaultOpen={defaultOpen}
                  onRemove={handleRemove}
                />
              ))
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 1.5,
                }}
              >
                {group.items.map((item) => (
                  <GrimoireCollectibleCard
                    key={item.id}
                    item={item}
                    onOpen={() => setViewerIndex(orderedItems.indexOf(item))}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}

        {viewMode === 'cards' && (
          <GrimoireCardLegend
            accents={orderedItems.map((item) => presentItem(item).accent)}
          />
        )}
      </Container>

      <GrimoireCardViewer
        items={orderedItems}
        index={openIndex}
        onIndexChange={setViewerIndex}
        onClose={() => setViewerIndex(null)}
        onRemove={handleRemove}
      />
    </>
  );
};

export default PocketGrimoirePage;
