import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  ClickAwayListener,
  IconButton,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useHistory } from 'react-router-dom';
import {
  buildEncyclopediaIndex,
  searchEncyclopedia,
  EncyclopediaEntry,
} from '../../functions/encyclopediaSearch';
import { normalizeSearch } from '../../functions/stringUtils';

interface IProps {
  /** URL base da enciclopédia (ex.: "/database"), vinda do useRouteMatch pai. */
  baseUrl: string;
}

const CATEGORY_COLORS: Record<
  EncyclopediaEntry['category'],
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  race: 'success',
  class: 'warning',
  origin: 'info',
  deity: 'secondary',
  power: 'primary',
  spell: 'secondary',
};

/**
 * Realça as ocorrências da busca dentro de um trecho de texto.
 * Compara de forma normalizada (sem acento/caixa) mas exibe o texto original.
 */
function highlight(
  text: string,
  query: string,
  tokens: string[]
): React.ReactNode {
  if (!text) return text;
  const nText = normalizeSearch(text);

  // Marca os índices que fazem parte de algum match (busca inteira ou termos).
  const marked = new Array<boolean>(text.length).fill(false);
  const markAll = (needle: string) => {
    if (!needle) return;
    let from = nText.indexOf(needle);
    while (from !== -1) {
      for (let i = from; i < from + needle.length; i += 1) marked[i] = true;
      from = nText.indexOf(needle, from + needle.length);
    }
  };
  markAll(query);
  tokens.forEach(markAll);

  if (!marked.includes(true)) return text;

  const nodes: React.ReactNode[] = [];
  let buffer = '';
  let bufferMarked = marked[0];
  const flush = (key: number) => {
    if (!buffer) return;
    nodes.push(
      bufferMarked ? (
        <strong key={key} style={{ fontWeight: 700 }}>
          {buffer}
        </strong>
      ) : (
        <React.Fragment key={key}>{buffer}</React.Fragment>
      )
    );
    buffer = '';
  };
  for (let i = 0; i < text.length; i += 1) {
    if (marked[i] !== bufferMarked) {
      flush(i);
      bufferMarked = marked[i];
    }
    buffer += text[i];
  }
  flush(text.length);
  return nodes;
}

/** Recorta um trecho da descrição em torno do primeiro match. */
function snippet(description: string, query: string, tokens: string[]): string {
  if (!description) return '';
  const nDesc = normalizeSearch(description);
  const needles = [query, ...tokens].filter(Boolean);
  let hit = -1;
  needles.forEach((n) => {
    const idx = nDesc.indexOf(n);
    if (idx !== -1 && (hit === -1 || idx < hit)) hit = idx;
  });

  const MAX = 180;
  if (hit === -1 || description.length <= MAX) {
    return description.length > MAX
      ? `${description.slice(0, MAX).trimEnd()}…`
      : description;
  }
  const start = Math.max(0, hit - 60);
  const end = Math.min(description.length, start + MAX);
  return `${start > 0 ? '…' : ''}${description.slice(start, end).trim()}${
    end < description.length ? '…' : ''
  }`;
}

const EncyclopediaSearch: React.FC<IProps> = ({ baseUrl }) => {
  const theme = useTheme();
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  // Índice montado uma vez (suplementos padrão são constantes).
  const index = useMemo(() => buildEncyclopediaIndex(), []);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchEncyclopedia(index, query, 30);
  }, [index, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const normalizedQuery = normalizeSearch(query).trim();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const goTo = (entry: EncyclopediaEntry) => {
    setOpen(false);
    setQuery('');
    history.push(
      `${baseUrl}/${entry.route}/${encodeURIComponent(entry.param)}`
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
      setOpen(true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const chosen = results[activeIndex];
      if (chosen) goTo(chosen.entry);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={anchorRef} sx={{ width: '100%', mb: 3 }}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder='Busque em toda a enciclopédia: poderes, magias, habilidades de classe, raças…'
          variant='outlined'
          autoComplete='off'
          InputProps={{
            sx: {
              fontFamily: 'Tfont, serif',
              borderRadius: 2,
              background:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.02)',
            },
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon color='primary' />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  aria-label='Limpar busca'
                  onClick={() => {
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />

        <Popper
          open={showPanel}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          style={{
            zIndex: theme.zIndex.modal,
            width: anchorRef.current?.clientWidth,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              maxHeight: 480,
              overflowY: 'auto',
              borderRadius: 2,
            }}
          >
            {results.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  Nenhum resultado para “{query}”. Tente outro termo ou parte do
                  nome.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    {results.length} resultado
                    {results.length > 1 ? 's' : ''} — ordenados por relevância
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {results.map(({ entry }, idx) => (
                    <ListItemButton
                      key={entry.id}
                      selected={idx === activeIndex}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => goTo(entry)}
                      sx={{ alignItems: 'flex-start', py: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography
                              component='span'
                              sx={{
                                fontFamily: 'Tfont, serif',
                                fontWeight: 600,
                                fontSize: '1rem',
                              }}
                            >
                              {highlight(entry.title, normalizedQuery, tokens)}
                            </Typography>
                            <Chip
                              label={entry.categoryLabel}
                              size='small'
                              color={CATEGORY_COLORS[entry.category]}
                              variant='outlined'
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            {entry.subtitle && (
                              <Typography
                                component='span'
                                variant='caption'
                                color='text.secondary'
                              >
                                {entry.subtitle}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          entry.description ? (
                            <Typography
                              component='span'
                              variant='body2'
                              color='text.secondary'
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {highlight(
                                snippet(
                                  entry.description,
                                  normalizedQuery,
                                  tokens
                                ),
                                normalizedQuery,
                                tokens
                              )}
                            </Typography>
                          ) : null
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default EncyclopediaSearch;
