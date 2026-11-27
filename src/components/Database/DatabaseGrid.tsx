import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

export interface DatabaseGridProps {
  children: React.ReactNode[];
  /** `compact` para cartas médias (poderes, magias, origens, raças); `wide` para classes e divindades. */
  variant?: 'compact' | 'wide';
  ariaLabel: string;
  emptyState?: React.ReactNode;
  batchSize?: number;
  /** Alterar quando filtros mudam para reiniciar o lote visível sem pulos. */
  resetKey?: string;
}

const DEFAULT_BATCH_SIZE = 48;

/**
 * Grid CSS responsivo para as telas de enciclopédia (/database/*).
 * Exibe lotes progressivos conforme o usuário rola para manter fluidez mesmo
 * com centenas de cards abertos com texto completo.
 */
const DatabaseGrid: React.FC<DatabaseGridProps> = ({
  children,
  variant = 'compact',
  ariaLabel,
  emptyState,
  batchSize = DEFAULT_BATCH_SIZE,
  resetKey = '',
}) => {
  const total = React.Children.count(children);
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [batchSize, resetKey]);

  const hasMore = visibleCount < total;

  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === 'undefined') return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) => Math.min(total, prev + batchSize));
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, total, batchSize]);

  if (total === 0) {
    return (
      <>
        {emptyState ?? (
          <Paper variant='outlined' sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
              Nenhum registro encontrado com os filtros aplicados.
            </Typography>
          </Paper>
        )}
      </>
    );
  }

  const visibleItems = hasMore ? children.slice(0, visibleCount) : children;

  return (
    <Box>
      <Box
        component='section'
        aria-label={ariaLabel}
        sx={{
          display: 'grid',
          gridTemplateColumns:
            variant === 'wide'
              ? {
                  xs: '1fr',
                  lg: 'repeat(auto-fill, minmax(min(100%, 500px), 1fr))',
                }
              : {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                  lg: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
                },
          gap: variant === 'wide' ? 2.5 : 2,
          alignItems: 'stretch',
        }}
      >
        {visibleItems}
      </Box>

      {hasMore && (
        <Box
          ref={sentinelRef}
          sx={{
            mt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Button
            variant='outlined'
            size='small'
            onClick={() =>
              setVisibleCount((prev) => Math.min(total, prev + batchSize))
            }
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Mostrar mais ({Math.min(batchSize, total - visibleCount)} de{' '}
            {total - visibleCount} restantes)
          </Button>
          <Button
            variant='text'
            size='small'
            onClick={() => setVisibleCount(total)}
            sx={{ fontFamily: 'Tfont, serif' }}
          >
            Mostrar todos ({total})
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DatabaseGrid;
