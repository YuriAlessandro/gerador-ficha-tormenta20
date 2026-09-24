import React, { useMemo } from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import type {
  ClassPowerGraph,
  PowerTreeCluster,
} from '../../functions/powerTree';
import { layoutCluster } from '../../functions/powerTreeLayout';
import PowerNodeCard from './PowerNodeCard';

interface PowerTreeCanvasProps {
  cluster: PowerTreeCluster;
  graph: ClassPowerGraph;
  selectedId: string | null;
  /** Nó selecionado + ancestrais + descendentes. Vazio quando nada está selecionado. */
  highlightedIds: Set<string>;
  /** Nós que casam com a busca. Vazio quando não há busca. */
  matchedIds: Set<string>;
  zoom: number;
  /** Rótulo de dono do nó, quando ele não vale para toda a família da classe. */
  ownersLabelOf?: (id: string) => string | null;
  onSelect: (id: string) => void;
}

const PowerTreeCanvas: React.FC<PowerTreeCanvasProps> = ({
  cluster,
  graph,
  selectedId,
  highlightedIds,
  matchedIds,
  zoom,
  ownersLabelOf,
  onSelect,
}) => {
  const theme = useTheme();
  const layout = useMemo(() => layoutCluster(cluster, graph), [cluster, graph]);

  const hasFocus = highlightedIds.size > 0 || matchedIds.size > 0;
  const isFocused = (id: string) =>
    highlightedIds.has(id) || matchedIds.has(id);

  const edgeColor = alpha(theme.palette.text.primary, 0.28);
  const activeEdgeColor = theme.palette.primary.main;
  const markerId = `arrow-${cluster.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Box
      sx={{
        // Cresce o quanto a árvore precisar: o accordion já decide o que está
        // à mostra, e uma segunda barra de rolagem dentro dele só atrapalha.
        // Na horizontal a rolagem fica, senão uma árvore de 1000px empurraria
        // a página inteira de lado no celular.
        overflowX: 'auto',
        overflowY: 'hidden',
        // O desenho vive dentro de uma célula de tabela com layout automático,
        // e `.table-container` do projeto usa overflow-x: visible. Sem isto,
        // uma árvore de 1000px estica a célula e empurra a PÁGINA de lado.
        // `width: 0` zera a contribuição do canvas para a largura da célula;
        // `minWidth: 100%` faz ele voltar a ocupar a largura disponível.
        width: 0,
        minWidth: '100%',
        // Alinhado com o padding do AccordionDetails, que é o que a lista de
        // poderes avulsos usa — as duas seções começam na mesma vertical.
        px: 2,
        py: 1,
        // Malha discreta: dá noção de deslocamento ao rolar uma árvore larga.
        backgroundImage: `radial-gradient(${alpha(
          theme.palette.text.primary,
          0.09
        )} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          width: layout.width * zoom,
          height: layout.height * zoom,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: layout.width,
            height: layout.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden='true'
          >
            <defs>
              <marker
                id={markerId}
                viewBox='0 0 10 10'
                refX='9'
                refY='5'
                markerWidth='6'
                markerHeight='6'
                orient='auto-start-reverse'
              >
                <path d='M 0 0 L 10 5 L 0 10 z' fill={edgeColor} />
              </marker>
              <marker
                id={`${markerId}-active`}
                viewBox='0 0 10 10'
                refX='9'
                refY='5'
                markerWidth='6'
                markerHeight='6'
                orient='auto-start-reverse'
              >
                <path d='M 0 0 L 10 5 L 0 10 z' fill={activeEdgeColor} />
              </marker>
            </defs>
            {layout.edges.map((edge) => {
              const active = isFocused(edge.from) && isFocused(edge.to);
              const faded = hasFocus && !active;
              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={edge.path}
                  fill='none'
                  stroke={active ? activeEdgeColor : edgeColor}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={edge.alternative ? '6 5' : undefined}
                  strokeOpacity={faded ? 0.25 : 1}
                  markerEnd={`url(#${markerId}${active ? '-active' : ''})`}
                />
              );
            })}
          </svg>

          {layout.nodes.map((position) => {
            const node = graph.nodes[position.id];
            if (!node) return null;
            return (
              <PowerNodeCard
                key={position.id}
                node={node}
                x={position.x}
                y={position.y}
                width={layout.nodeWidth}
                height={layout.nodeHeight}
                selected={selectedId === position.id}
                related={
                  selectedId !== position.id && highlightedIds.has(position.id)
                }
                matched={matchedIds.has(position.id)}
                dimmed={hasFocus && !isFocused(position.id)}
                ownersLabel={ownersLabelOf?.(position.id) ?? null}
                onSelect={onSelect}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default PowerTreeCanvas;
