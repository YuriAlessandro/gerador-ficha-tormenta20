import React from 'react';
import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import { presentItem } from './itemPresentation';
import { accentColor } from './accentColor';

interface Props {
  item: ResolvedItem;
  onOpen: () => void;
}

/** Carta compacta do modo cartas: o essencial para reconhecer o item. */
const GrimoireCollectibleCard: React.FC<Props> = ({ item, onOpen }) => {
  const theme = useTheme();
  const view = presentItem(item);
  const color = accentColor(theme, view.accent);

  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Abrir carta ${view.title}`}
      sx={{
        width: '100%',
        aspectRatio: '5 / 7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderTop: `4px solid ${color}`,
        boxShadow: 1,
        borderStyle: view.accent === 'missing' ? 'dashed' : 'solid',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <Box
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
          <Typography
            sx={{
              flex: 1,
              fontFamily: 'Tfont, serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              lineHeight: 1.2,
            }}
          >
            {view.title}
          </Typography>
          {view.circle && (
            <Box
              title={`${view.circle}º círculo`}
              sx={{
                flex: 'none',
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: color,
                color: 'common.white',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {view.circle}
            </Box>
          )}
        </Box>
        {view.subtitle && (
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              lineHeight: 1.2,
              fontSize: '0.65rem',
            }}
          >
            {view.subtitle}
          </Typography>
        )}
        {view.metaLine && (
          <Typography
            sx={{
              fontSize: '0.65rem',
              bgcolor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
            }}
          >
            {view.metaLine}
          </Typography>
        )}
        {/* Ocupa só o espaço que sobra (o título pode quebrar em várias
            linhas numa carta estreita) e some em degradê, sem invadir o
            rodapé — um corte por número fixo de linhas não se adapta. */}
        <Typography
          sx={{
            flex: '1 1 0',
            minHeight: 0,
            fontSize: '0.68rem',
            lineHeight: 1.3,
            color: 'text.secondary',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, black 65%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 65%, transparent)',
          }}
        >
          {view.description}
        </Typography>
        {view.footer && (
          <Typography
            sx={{
              flex: 'none',
              fontSize: '0.62rem',
              fontWeight: 700,
              color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {view.footer}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
};

export default GrimoireCollectibleCard;
