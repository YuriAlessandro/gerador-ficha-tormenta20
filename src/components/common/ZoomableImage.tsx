import React, { useState } from 'react';
import { Box, Dialog, IconButton, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** Estilo da imagem exibida (largura, altura, recorte, borda etc.). */
  sx?: SxProps<Theme>;
  /** Estilo do contêiner que envolve a imagem e o botão de lupa. */
  containerSx?: SxProps<Theme>;
  /**
   * Se clicar na própria imagem também amplia. Desligar em imagens largas
   * (faixas de capa), onde o cursor de zoom na área toda atrapalha.
   */
  clickToZoom?: boolean;
  /** Lupa menor e colada na borda, para miniaturas tipo avatar. */
  compact?: boolean;
  /** Canto onde fica a lupa. */
  buttonPosition?: 'bottom-right' | 'top-right';
  /** O que mostrar se a imagem falhar ao carregar (padrão: nada). */
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

const overlayButtonSx = {
  color: '#fff',
  bgcolor: 'rgba(0, 0, 0, 0.55)',
  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.75)' },
};

const toSxArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx]);

/**
 * Imagem com um botão de lupa que abre a imagem inteira (sem recorte) num
 * diálogo. Se a imagem falhar ao carregar, o componente some por inteiro.
 */
const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  sx,
  containerSx,
  clickToZoom = true,
  compact = false,
  buttonPosition = 'bottom-right',
  fallback = null,
  loading,
  referrerPolicy,
}) => {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  const offset = compact ? -6 : 4;

  return (
    <>
      <Box
        sx={[
          { position: 'relative', flexShrink: 0, lineHeight: 0 },
          ...toSxArray(containerSx),
        ]}
      >
        <Box
          component='img'
          src={src}
          alt={alt}
          loading={loading}
          referrerPolicy={referrerPolicy}
          onError={() => setFailed(true)}
          onClick={clickToZoom ? () => setOpen(true) : undefined}
          sx={[
            {
              objectFit: 'cover',
              display: 'block',
              cursor: clickToZoom ? 'zoom-in' : undefined,
            },
            ...toSxArray(sx),
          ]}
        />
        <Tooltip title='Ampliar imagem'>
          <IconButton
            size='small'
            aria-label='Ampliar imagem'
            onClick={() => setOpen(true)}
            sx={{
              ...overlayButtonSx,
              position: 'absolute',
              right: offset,
              ...(buttonPosition === 'top-right'
                ? { top: offset }
                : { bottom: offset }),
              p: compact ? 0.125 : 0.25,
              displayPrint: 'none',
            }}
          >
            <ZoomInIcon sx={{ fontSize: compact ? 14 : 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              m: 2,
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
              position: 'relative',
            },
          },
        }}
      >
        <IconButton
          aria-label='Fechar'
          onClick={() => setOpen(false)}
          sx={{ ...overlayButtonSx, position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component='img'
          src={src}
          alt={alt}
          referrerPolicy={referrerPolicy}
          onClick={() => setOpen(false)}
          sx={{
            display: 'block',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 32px)',
            objectFit: 'contain',
            borderRadius: 2,
            cursor: 'zoom-out',
          }}
        />
      </Dialog>
    </>
  );
};

export default ZoomableImage;
