import React from 'react';
import { Box, ButtonBase, Typography, alpha, useTheme } from '@mui/material';
import type { PowerTreeNode } from '../../functions/powerTree';
import { getNodeKindMeta } from './powerNodeStyle';

interface PowerNodeCardProps {
  node: PowerTreeNode;
  /** Posição no desenho da árvore. Sem elas o cartão flui no layout normal. */
  x?: number;
  y?: number;
  width?: number | string;
  height: number;
  selected: boolean;
  /** Está no caminho do nó selecionado (ancestral ou descendente). */
  related: boolean;
  /** Casa com a busca atual. */
  matched: boolean;
  /** Perde destaque porque há uma seleção/busca ativa e ele ficou de fora. */
  dimmed: boolean;
  /** "só Druida" quando o poder não existe em toda a família da classe. */
  ownersLabel?: string | null;
  onSelect: (id: string) => void;
}

const PowerNodeCard: React.FC<PowerNodeCardProps> = ({
  node,
  x,
  y,
  width,
  height,
  selected,
  related,
  matched,
  dimmed,
  ownersLabel,
  onSelect,
}) => {
  const theme = useTheme();
  const kind = getNodeKindMeta(node.kind, theme);
  const isExternal = node.kind === 'external';

  const borderColor = () => {
    if (selected) return theme.palette.primary.main;
    if (matched) return theme.palette.success.main;
    if (related) return alpha(kind.color, 0.7);
    return theme.palette.divider;
  };

  const roleLabel = () => {
    if (node.unlocks.length > 0) return `destrava ${node.unlocks.length}`;
    if (node.prerequisites.length > 0) return 'ponta da linha';
    return null;
  };

  const meta = [
    node.minLevel > 1 ? `Nv ${node.minLevel}` : null,
    ownersLabel,
    roleLabel(),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ButtonBase
      focusRipple
      onClick={() => onSelect(node.id)}
      aria-label={`${node.name} — ${kind.label}`}
      // Lido pelo clique-fora do painel (NODE_SELECTOR): clicar em outro nó
      // troca o poder exibido em vez de fechar o painel.
      data-power-node=''
      sx={{
        position: x === undefined ? 'relative' : 'absolute',
        left: x,
        top: y,
        width: width ?? '100%',
        height,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderStyle: isExternal ? 'dashed' : 'solid',
        borderColor: borderColor(),
        borderWidth: selected ? 2 : 1,
        boxShadow: selected
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.22)}`
          : theme.shadows[1],
        opacity: dimmed ? 0.28 : 1,
        transition: theme.transitions.create(
          ['opacity', 'box-shadow', 'border-color', 'transform'],
          { duration: theme.transitions.duration.shorter }
        ),
        '&:hover': {
          transform: dimmed ? 'none' : 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          zIndex: 3,
        },
      }}
    >
      <Box
        sx={{
          width: 5,
          flexShrink: 0,
          bgcolor: kind.color,
          opacity: isExternal ? 0.5 : 1,
        }}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          px: 1.25,
          py: 0.75,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.25,
        }}
      >
        <Typography
          component='span'
          sx={{
            fontFamily: 'Tfont, serif',
            fontSize: '0.9rem',
            lineHeight: 1.15,
            fontWeight: 600,
            color: isExternal ? 'text.secondary' : 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {node.name}
        </Typography>
        <Typography
          component='span'
          variant='caption'
          noWrap
          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
        >
          {isExternal ? 'fora desta classe' : meta || kind.label.toLowerCase()}
        </Typography>
      </Box>
    </ButtonBase>
  );
};

export default PowerNodeCard;
