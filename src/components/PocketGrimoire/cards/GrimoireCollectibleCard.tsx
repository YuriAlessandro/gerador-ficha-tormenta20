import React from 'react';
import { Box, ButtonBase, Tooltip, Typography, useTheme } from '@mui/material';
import { ResolvedItem } from '../../../functions/pocketGrimoire/resolveItems';
import { presentItem, typeLabel } from './itemPresentation';
import { STAT_META } from './statIcons';
import { accentFrame } from './accentColor';

interface Props {
  item: ResolvedItem;
  onOpen: () => void;
}

/**
 * Carta do modo cartas, inspirada no Baralho de Magias: moldura na cor do
 * tipo, selo com o círculo e um "pergaminho" com estatísticas em ícones.
 */
const GrimoireCollectibleCard: React.FC<Props> = ({ item, onOpen }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const view = presentItem(item);
  const tooltip = typeLabel(view);
  const ink = isDark ? '#efe6d6' : '#2a221d';
  const costColor = isDark
    ? theme.palette.primary.light
    : theme.palette.primary.dark;

  return (
    <Tooltip title={tooltip} describeChild placement='top' enterDelay={400}>
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
          // <button> não herda a fonte da página.
          fontFamily: theme.typography.fontFamily,
          p: 1,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          background: accentFrame(theme, view.accent),
          outline:
            view.accent === 'missing'
              ? `2px dashed ${theme.palette.divider}`
              : 'none',
          boxShadow: 3,
          transition: 'transform 0.15s, box-shadow 0.15s',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: 8 },
          // Textura sutil da moldura, só em CSS.
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 14px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.75,
            px: 0.5,
            pb: 1,
            position: 'relative',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: 'Tfont, serif',
                color: 'common.white',
                fontSize: '0.9rem',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {view.title}
            </Typography>
            {view.subtitle && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  mt: 0.25,
                }}
              >
                {view.subtitle}
              </Typography>
            )}
          </Box>
          {view.circle && (
            <Box
              sx={{
                flex: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px dashed rgba(255,255,255,0.85)',
                bgcolor: 'rgba(0,0,0,0.2)',
                color: 'common.white',
                fontWeight: 900,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {view.circle}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            borderRadius: 1.5,
            px: 1,
            py: 0.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            color: ink,
            background: isDark
              ? 'linear-gradient(180deg, #3a302a, #2b231e)'
              : 'linear-gradient(180deg, #fbf7ef, #efe6d6)',
            boxShadow: 'inset 0 0 12px rgba(120, 90, 50, 0.25)',
          }}
        >
          {view.stats.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px 8px',
                pb: 0.5,
                borderBottom: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#d9ccb8',
              }}
            >
              {view.stats.map((stat) => {
                const { label, Icon, wide } = STAT_META[stat.kind];
                return (
                  <Box
                    key={stat.kind}
                    title={`${label}: ${stat.value}`}
                    sx={{
                      gridColumn: wide ? '1 / -1' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      minWidth: 0,
                      fontSize: '0.66rem',
                      fontStyle: 'italic',
                    }}
                  >
                    <Icon
                      titleAccess={label}
                      sx={{
                        fontSize: '0.8rem',
                        color: costColor,
                        flex: 'none',
                      }}
                    />
                    <Box
                      component='span'
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {stat.value}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* O texto ocupa o espaço que sobra e some em degradê. */}
          <Box
            sx={{
              flex: '1 1 0',
              minHeight: 0,
              overflow: 'hidden',
              fontSize: '0.68rem',
              lineHeight: 1.35,
              maskImage: 'linear-gradient(to bottom, black 75%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 75%, transparent)',
              '& p': { m: 0, mb: 0.5 },
            }}
          >
            {view.facts.map((fact) => (
              <p key={fact.label}>
                <Box
                  component='strong'
                  sx={{ color: costColor, fontWeight: 700 }}
                >
                  {fact.label}:
                </Box>{' '}
                {fact.value}
              </p>
            ))}
            {view.description && <p>{view.description}</p>}
            {view.aprimoramentos.map((apr) => (
              <p key={`${apr.cost}-${apr.text}`}>
                <Box
                  component='strong'
                  sx={{ color: costColor, fontWeight: 700 }}
                >
                  {apr.cost}:
                </Box>{' '}
                {apr.text}
              </p>
            ))}
          </Box>
        </Box>
      </ButtonBase>
    </Tooltip>
  );
};

export default GrimoireCollectibleCard;
