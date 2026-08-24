import type { ClassPowerGraph, PowerTreeCluster } from './powerTree';

/**
 * Posiciona um componente do grafo de poderes da esquerda para a direita.
 *
 * A orientação importa: as árvores de T20 são rasas (3 níveis no máximo) e
 * largas (Forma Selvagem destrava 10 poderes). De cima para baixo isso viraria
 * uma faixa de 10 cartões lado a lado — 2500px de rolagem horizontal. Deitada,
 * a mesma árvore ocupa 4 colunas e rola na vertical, que é o gesto natural em
 * qualquer tela.
 */

export interface PowerTreeLayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  columnGap?: number;
  rowGap?: number;
}

export interface LaidOutNode {
  id: string;
  x: number;
  y: number;
  /** Coluna: maior distância até uma raiz do componente. */
  depth: number;
}

export interface LaidOutEdge {
  from: string;
  to: string;
  alternative: boolean;
  /** `d` de um <path> SVG ligando a borda direita do pai à esquerda do filho. */
  path: string;
}

export interface ClusterLayout {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  columns: number;
}

export const DEFAULT_LAYOUT_OPTIONS: Required<PowerTreeLayoutOptions> = {
  nodeWidth: 208,
  nodeHeight: 68,
  columnGap: 72,
  rowGap: 16,
};

/** Profundidade = caminho mais LONGO até uma raiz, para o filho nunca ficar à esquerda do pai. */
function computeDepths(
  cluster: PowerTreeCluster,
  graph: ClassPowerGraph
): Map<string, number> {
  const inCluster = new Set(cluster.nodeIds);
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  const depthOf = (id: string): number => {
    const cached = depths.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;

    visiting.add(id);
    const parents = (graph.nodes[id]?.prerequisites ?? []).filter((p) =>
      inCluster.has(p)
    );
    const depth =
      parents.length === 0 ? 0 : 1 + Math.max(...parents.map(depthOf));
    visiting.delete(id);

    depths.set(id, depth);
    return depth;
  };

  cluster.nodeIds.forEach(depthOf);
  return depths;
}

/**
 * Linha de cada nó. Folhas ocupam linhas consecutivas na ordem em que a busca
 * em profundidade as encontra; nós internos ficam centrados na média dos
 * filhos. É o suficiente para o desenho não cruzar arestas nestas árvores.
 */
function computeRows(
  cluster: PowerTreeCluster,
  graph: ClassPowerGraph,
  depths: Map<string, number>
): Map<string, number> {
  const inCluster = new Set(cluster.nodeIds);
  const rows = new Map<string, number>();
  const visiting = new Set<string>();
  let nextLeafRow = 0;

  const childrenOf = (id: string) =>
    (graph.nodes[id]?.unlocks ?? [])
      .filter((child) => inCluster.has(child))
      .sort((a, b) => {
        const byDepth = (depths.get(a) ?? 0) - (depths.get(b) ?? 0);
        if (byDepth !== 0) return byDepth;
        return a.localeCompare(b, 'pt-BR');
      });

  const place = (id: string): number => {
    const cached = rows.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return nextLeafRow;

    visiting.add(id);
    const children = childrenOf(id);
    let row: number;
    if (children.length === 0) {
      row = nextLeafRow;
      nextLeafRow += 1;
    } else {
      const childRows = children.map(place);
      row = childRows.reduce((sum, r) => sum + r, 0) / childRows.length;
    }
    visiting.delete(id);

    rows.set(id, row);
    return row;
  };

  const roots =
    cluster.rootIds.length > 0 ? cluster.rootIds : [cluster.nodeIds[0]];
  roots.forEach(place);
  // Rede de segurança: nó preso num ciclo nunca alcançado a partir das raízes.
  cluster.nodeIds.forEach(place);

  // Descolamento por coluna: dois nós internos podem ter caído em linhas
  // próximas ao herdar a média dos filhos.
  const byDepth = new Map<number, string[]>();
  cluster.nodeIds.forEach((id) => {
    const depth = depths.get(id) ?? 0;
    byDepth.set(depth, [...(byDepth.get(depth) ?? []), id]);
  });
  byDepth.forEach((ids) => {
    ids
      .sort((a, b) => (rows.get(a) ?? 0) - (rows.get(b) ?? 0))
      .reduce((previousRow: number | null, id) => {
        const row = rows.get(id) ?? 0;
        if (previousRow !== null && row < previousRow + 1) {
          rows.set(id, previousRow + 1);
          return previousRow + 1;
        }
        return row;
      }, null);
  });

  return rows;
}

function edgePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  const controlDistance = Math.max(28, (toX - fromX) / 2);
  return `M ${fromX} ${fromY} C ${fromX + controlDistance} ${fromY}, ${
    toX - controlDistance
  } ${toY}, ${toX} ${toY}`;
}

/** Calcula posições e curvas de um componente do grafo. */
export function layoutCluster(
  cluster: PowerTreeCluster,
  graph: ClassPowerGraph,
  options: PowerTreeLayoutOptions = {}
): ClusterLayout {
  const { nodeWidth, nodeHeight, columnGap, rowGap } = {
    ...DEFAULT_LAYOUT_OPTIONS,
    ...options,
  };
  const columnStride = nodeWidth + columnGap;
  const rowStride = nodeHeight + rowGap;

  const depths = computeDepths(cluster, graph);
  const rows = computeRows(cluster, graph, depths);

  const minRow = Math.min(...cluster.nodeIds.map((id) => rows.get(id) ?? 0));
  const nodes: LaidOutNode[] = cluster.nodeIds.map((id) => {
    const depth = depths.get(id) ?? 0;
    return {
      id,
      depth,
      x: depth * columnStride,
      y: ((rows.get(id) ?? 0) - minRow) * rowStride,
    };
  });

  const positions = new Map(nodes.map((node) => [node.id, node]));
  const edges: LaidOutEdge[] = cluster.edges
    .filter((edge) => positions.has(edge.from) && positions.has(edge.to))
    .map((edge) => {
      const from = positions.get(edge.from) as LaidOutNode;
      const to = positions.get(edge.to) as LaidOutNode;
      return {
        from: edge.from,
        to: edge.to,
        alternative: edge.alternative,
        path: edgePath(
          from.x + nodeWidth,
          from.y + nodeHeight / 2,
          to.x,
          to.y + nodeHeight / 2
        ),
      };
    });

  const columns = Math.max(...nodes.map((node) => node.depth)) + 1;
  return {
    width: columns * columnStride - columnGap,
    height: Math.max(...nodes.map((node) => node.y)) + nodeHeight + rowGap / 2,
    nodeWidth,
    nodeHeight,
    nodes,
    edges,
    columns,
  };
}
