import React, { useEffect } from 'react';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ClassPowerGraph, PowerTreeNode } from '../../functions/powerTree';
import { formatRequirement } from '../../functions/requirementText';
import { NODE_SELECTOR, PANEL_CLASS, getNodeKindMeta } from './powerNodeStyle';

interface PowerDetailDrawerProps {
  node: PowerTreeNode | null;
  graph: ClassPowerGraph;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

const RelatedList: React.FC<{
  title: string;
  icon: React.ReactNode;
  ids: string[];
  graph: ClassPowerGraph;
  onNavigate: (id: string) => void;
}> = ({ title, icon, ids, graph, onNavigate }) => {
  if (ids.length === 0) return null;
  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack
        direction='row'
        spacing={0.75}
        sx={{ mb: 1, alignItems: 'center' }}
      >
        {icon}
        <Typography variant='subtitle2' sx={{ fontFamily: 'Tfont, serif' }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {ids.map((id) => (
          <Chip
            key={id}
            label={id}
            size='small'
            variant='outlined'
            clickable
            onClick={() => onNavigate(id)}
            sx={{
              fontFamily: 'Tfont, serif',
              maxWidth: '100%',
              opacity: graph.nodes[id] ? 1 : 0.6,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const PowerDetailDrawer: React.FC<PowerDetailDrawerProps> = ({
  node,
  graph,
  onClose,
  onNavigate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const kind = node ? getNodeKindMeta(node.kind, theme) : null;

  // O painel do desktop não é modal (para o usuário seguir clicando na árvore
  // enquanto lê), então Esc e clique-fora precisam ser tratados à mão — sem
  // Modal não há backdrop nem quem escute por nós.
  useEffect(() => {
    if (!node || isMobile) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(`.${PANEL_CLASS}`)) return;
      // Clique em outro nó troca o poder exibido; fechar aqui faria o painel
      // piscar (fecha no mousedown, reabre no click).
      if (target.closest(NODE_SELECTOR)) return;
      onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [node, isMobile, onClose]);

  const requirementGroups = (node?.requirements ?? [])
    .map((group) =>
      group.map((req) => formatRequirement(req)).filter((text) => text !== '')
    )
    .filter((group) => group.length > 0);

  return (
    <Drawer
      // Sempre `temporary`, inclusive no desktop, porque essa é a variante que
      // renderiza via portal no body. A `persistent` renderiza no lugar, e o
      // painel vive dentro de uma célula de tabela — qualquer ancestral com
      // transform vira containing block e joga o `position: fixed` para fora
      // da tela.
      //
      // No desktop o modal é desarmado (sem backdrop, sem trava de foco, sem
      // trava de rolagem, e com pointer-events só no papel): um backdrop
      // cobriria a árvore e bloquearia o clique no próximo nó, que é
      // justamente como se explora uma linha de progressão.
      variant='temporary'
      anchor={isMobile ? 'bottom' : 'right'}
      open={Boolean(node)}
      onClose={onClose}
      hideBackdrop={!isMobile}
      disableEnforceFocus={!isMobile}
      disableAutoFocus={!isMobile}
      disableScrollLock={!isMobile}
      slotProps={{
        root: isMobile ? undefined : { sx: { pointerEvents: 'none' } },
        paper: {
          className: PANEL_CLASS,
          elevation: isMobile ? 16 : 8,
          sx: {
            pointerEvents: 'auto',
            width: isMobile ? '100%' : 420,
            maxHeight: isMobile ? '80vh' : 'none',
            top: isMobile ? 'auto' : 96,
            height: isMobile ? 'auto' : 'calc(100% - 96px)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: isMobile ? 16 : 0,
            borderBottomLeftRadius: isMobile ? 0 : 16,
            overflowY: 'auto',
            p: 2.5,
          },
        },
      }}
    >
      {node && kind && (
        <Box>
          <Stack
            direction='row'
            spacing={1}
            sx={{
              mb: 1,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontFamily: 'Tfont, serif', color: 'primary.main' }}
            >
              {node.name}
            </Typography>
            <IconButton onClick={onClose} size='small' aria-label='Fechar'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Stack>

          <Stack
            direction='row'
            spacing={0.75}
            sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }}
          >
            <Chip
              size='small'
              label={kind.label}
              sx={{
                bgcolor: alpha(kind.color, 0.15),
                color: kind.color,
                fontWeight: 600,
              }}
            />
            {node.minLevel > 1 && (
              <Chip
                size='small'
                variant='outlined'
                label={`A partir do ${node.minLevel}º nível`}
              />
            )}
          </Stack>

          {node.kind === 'external' && (
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}
            >
              {kind.description}
            </Typography>
          )}

          {requirementGroups.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant='subtitle2'
                sx={{ fontFamily: 'Tfont, serif', mb: 1 }}
              >
                Pré-requisitos
              </Typography>
              {requirementGroups.map((group, index) => (
                <Box key={group.join('|')}>
                  {index > 0 && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        my: 0.5,
                        fontStyle: 'italic',
                        color: 'text.secondary',
                      }}
                    >
                      ou
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {group.map((text) => (
                      <Chip
                        key={text}
                        label={text}
                        size='small'
                        variant='outlined'
                        color='secondary'
                        sx={{ fontFamily: 'Tfont, serif' }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {node.text && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant='body2'
                sx={{ mb: 2.5, whiteSpace: 'pre-line', lineHeight: 1.65 }}
              >
                {node.text}
              </Typography>
            </>
          )}

          <Divider sx={{ mb: 2 }} />

          <RelatedList
            title='Depende de'
            icon={<ArrowBackIcon fontSize='small' color='action' />}
            ids={node.prerequisites}
            graph={graph}
            onNavigate={onNavigate}
          />
          <RelatedList
            title='Destrava'
            icon={<ArrowForwardIcon fontSize='small' color='action' />}
            ids={node.unlocks}
            graph={graph}
            onNavigate={onNavigate}
          />
        </Box>
      )}
    </Drawer>
  );
};

export default PowerDetailDrawer;
