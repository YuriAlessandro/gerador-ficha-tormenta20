import React, { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import GrimoireItemDetails from './GrimoireItemDetails';
import { presentItem } from './itemPresentation';
import { accentColor } from './accentColor';

interface Props {
  /** Itens na ordem em que aparecem na coleção (grupos já aplicados). */
  items: ResolvedItem[];
  /** Índice da carta aberta, ou `null` com o visualizador fechado. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onRemove: (itemId: string) => void;
}

/** Deslocamento horizontal mínimo (px) para um gesto contar como deslizar. */
const SWIPE_THRESHOLD = 50;

/** Carta ampliada: o item inteiro, com ‹ › para folhear a coleção. */
const GrimoireCardViewer: React.FC<Props> = ({
  items,
  index,
  onIndexChange,
  onClose,
  onRemove,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 720px)');
  const touchStartX = useRef<number | null>(null);

  const item = index === null ? undefined : items[index];
  if (!item || index === null) return null;

  const view = presentItem(item);
  const color = accentColor(theme, view.accent);
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const goPrev = () => hasPrev && onIndexChange(index - 1);
  const goNext = () => hasNext && onIndexChange(index + 1);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') goPrev();
    if (event.key === 'ArrowRight') goNext();
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const delta = event.changedTouches[0].clientX - start;
    if (delta > SWIPE_THRESHOLD) goPrev();
    if (delta < -SWIPE_THRESHOLD) goNext();
  };

  const navButton = (direction: 'prev' | 'next') => (
    <IconButton
      aria-label={direction === 'prev' ? 'Carta anterior' : 'Próxima carta'}
      onClick={direction === 'prev' ? goPrev : goNext}
      disabled={direction === 'prev' ? !hasPrev : !hasNext}
      size='small'
    >
      {direction === 'prev' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </IconButton>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      onKeyDown={handleKeyDown}
      fullScreen={isMobile}
      fullWidth
      maxWidth='sm'
      aria-labelledby='grimoire-card-viewer-title'
      slotProps={{
        paper: {
          onTouchStart: (event: React.TouchEvent) => {
            touchStartX.current = event.touches[0].clientX;
          },
          onTouchEnd: handleTouchEnd,
          sx: { borderTop: `6px solid ${color}` },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          pt: 1.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            id='grimoire-card-viewer-title'
            variant='h6'
            sx={{ fontFamily: 'Tfont, serif', lineHeight: 1.2 }}
          >
            {view.title}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {index + 1} de {items.length}
          </Typography>
        </Box>
        {navButton('prev')}
        {navButton('next')}
        <IconButton aria-label='Fechar' onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 1 }}>
        <GrimoireItemDetails item={item} />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          color='error'
          startIcon={<DeleteOutlinedIcon />}
          onClick={() => onRemove(item.id)}
        >
          Remover do grimório
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GrimoireCardViewer;
