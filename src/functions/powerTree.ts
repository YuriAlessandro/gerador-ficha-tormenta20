import type {
  ClassAbility,
  ClassDescription,
  ClassPower,
} from '../interfaces/Class';
import type { GeneralPower, Requirement } from '../interfaces/Poderes';
import { RequirementType } from '../interfaces/Poderes';

/**
 * Grafo de dependências dos poderes de uma classe.
 *
 * Em T20 os poderes de classe não formam uma árvore única: a maioria é avulsa
 * (só exige nível/atributo/perícia) e um punhado forma cadeias — Forma Selvagem
 * destrava 10 poderes do Druida, Alquimista Iniciado destrava 10 do Inventor.
 * O que interessa para planejar build são justamente essas cadeias, então o
 * grafo separa os componentes conexos ("árvores") do resto ("poderes avulsos").
 */

export type PowerNodeKind =
  | 'power'
  | 'ability'
  | 'abilityOption'
  | 'general'
  | 'external';

export interface PowerTreeNode {
  /** Nome do poder — também é a chave do nó (os dados referenciam por nome). */
  id: string;
  name: string;
  kind: PowerNodeKind;
  /** Texto da regra. Vazio em nós `external`, cuja fonte não foi encontrada. */
  text: string;
  /** Nível exigido pelo próprio poder (1 quando não há exigência de nível). */
  levelRequirement: number;
  /**
   * Nível mínimo considerando também a cadeia de pré-requisitos. Se um poder
   * exige outro que só existe a partir do 5º nível, ele também só existe a
   * partir do 5º — mesmo sem declarar nível nenhum.
   */
  minLevel: number;
  /** Nível em que a habilidade é ganha. Só para os kinds de habilidade. */
  abilityLevel?: number;
  /** Habilidade que oferece a escolha. Só para `kind === 'abilityOption'`. */
  parentAbilityName?: string;
  requirements: Requirement[][];
  /** Pré-requisitos que são poderes/habilidades, já resolvidos e sem repetição. */
  prerequisites: string[];
  /** Nós que este destrava. */
  unlocks: string[];
  /** `true` quando os pré-requisitos estão em grupos alternativos (OU). */
  hasAlternatives: boolean;
}

export interface PowerTreeEdge {
  from: string;
  to: string;
  /**
   * `true` quando o destino tem mais de um grupo de pré-requisitos, ou seja,
   * esta aresta é um caminho alternativo e não uma exigência obrigatória.
   */
  alternative: boolean;
}

export interface PowerTreeCluster {
  /** Identificador estável derivado das raízes, usado como `key` no React. */
  id: string;
  rootIds: string[];
  nodeIds: string[];
  edges: PowerTreeEdge[];
}

export interface ClassPowerGraph {
  className: string;
  nodes: Record<string, PowerTreeNode>;
  /** Componentes conexos com 2+ nós, do maior para o menor. */
  clusters: PowerTreeCluster[];
  /** Poderes da classe sem nenhuma relação de pré-requisito. */
  standaloneIds: string[];
  stats: {
    totalPowers: number;
    powersInClusters: number;
    standalonePowers: number;
    largestCluster: number;
  };
}

interface BuildGraphParams {
  classe: ClassDescription;
  /** Poderes gerais, para resolver pré-requisitos que não são da classe. */
  generalPowers?: GeneralPower[];
}

/** Requisitos negados (`not`) excluem em vez de destravar — não viram aresta. */
function isPrerequisiteLink(req: Requirement): boolean {
  if (req.not) return false;
  return (
    req.type === RequirementType.PODER ||
    req.type === RequirementType.HABILIDADE
  );
}

/** Maior exigência de nível dentro de um grupo (E), ignorando negações. */
function groupLevelRequirement(group: Requirement[]): number {
  return group.reduce((max, req) => {
    if (req.type !== RequirementType.NIVEL || req.not) return max;
    return Math.max(max, req.value ?? 1);
  }, 1);
}

/**
 * Nível exigido diretamente: grupos são alternativos (OU), então vale o
 * caminho mais barato.
 */
function directLevelRequirement(requirements: Requirement[][]): number {
  const groups = requirements.filter((group) => group.length > 0);
  if (groups.length === 0) return 1;
  return Math.min(...groups.map(groupLevelRequirement));
}

function makeNode(
  partial: Pick<PowerTreeNode, 'id' | 'name' | 'kind' | 'text'> &
    Partial<PowerTreeNode>
): PowerTreeNode {
  const requirements = partial.requirements ?? [];
  return {
    levelRequirement: directLevelRequirement(requirements),
    minLevel: 1,
    requirements,
    prerequisites: [],
    unlocks: [],
    hasAlternatives:
      requirements.filter((group) => group.length > 0).length > 1,
    ...partial,
  };
}

function powerNode(power: ClassPower): PowerTreeNode {
  return makeNode({
    id: power.name,
    name: power.name,
    kind: 'power',
    text: power.text,
    requirements: power.requirements ?? [],
  });
}

/**
 * Algumas habilidades oferecem uma escolha entre opções nomeadas (o Treinador
 * escolhe entre "Conquistar pelos Números" e "Treino Intensivo" no 5º nível), e
 * há poderes que exigem uma dessas opções. A opção não é poder nem habilidade,
 * mora dentro de `sheetActions`, então sem olhar aqui ela cairia como
 * pré-requisito externo — dizendo "fora desta classe" sobre algo que é da
 * classe.
 */
interface AbilityOption {
  name: string;
  text: string;
  abilityName: string;
  abilityLevel: number;
}

function collectAbilityOptions(
  abilities: ClassAbility[]
): Map<string, AbilityOption> {
  const options = new Map<string, AbilityOption>();

  abilities.forEach((ability) => {
    (ability.sheetActions ?? []).forEach((sheetAction) => {
      const { action } = sheetAction;
      if (action.type !== 'chooseFromOptions') return;
      action.options.forEach((option) => {
        if (!option.name || options.has(option.name)) return;
        options.set(option.name, {
          name: option.name,
          text: option.text,
          abilityName: ability.name,
          abilityLevel: ability.nivel,
        });
      });
    });
  });

  return options;
}

function abilityOptionNode(option: AbilityOption): PowerTreeNode {
  return makeNode({
    id: option.name,
    name: option.name,
    kind: 'abilityOption',
    text: option.text,
    abilityLevel: option.abilityLevel,
    levelRequirement: option.abilityLevel,
    parentAbilityName: option.abilityName,
  });
}

function abilityNode(ability: ClassAbility): PowerTreeNode {
  return makeNode({
    id: ability.name,
    name: ability.name,
    kind: 'ability',
    text: ability.text,
    abilityLevel: ability.nivel,
    levelRequirement: ability.nivel,
  });
}

function generalNode(power: GeneralPower): PowerTreeNode {
  return makeNode({
    id: power.name,
    name: power.name,
    kind: 'general',
    text: power.description,
    requirements: power.requirements ?? [],
  });
}

function externalNode(name: string): PowerTreeNode {
  return makeNode({ id: name, name, kind: 'external', text: '' });
}

/**
 * Nível mínimo real de cada nó: o próprio nível exigido, elevado pelo nível
 * mínimo do caminho de pré-requisitos mais barato (grupos são OU, itens são E).
 */
function computeMinLevels(nodes: Record<string, PowerTreeNode>): void {
  const resolved = new Map<string, number>();
  const visiting = new Set<string>();

  const minLevelOf = (id: string): number => {
    const cached = resolved.get(id);
    if (cached !== undefined) return cached;

    const node = nodes[id];
    if (!node) return 1;
    // Ciclo nos dados: para de descer e usa só a exigência direta.
    if (visiting.has(id)) return node.levelRequirement;

    visiting.add(id);
    const groups = node.requirements.filter((group) => group.length > 0);
    const level =
      groups.length === 0
        ? node.levelRequirement
        : Math.min(
            ...groups.map((group) =>
              group.reduce((max, req) => {
                if (req.not) return max;
                if (req.type === RequirementType.NIVEL)
                  return Math.max(max, req.value ?? 1);
                if (isPrerequisiteLink(req) && req.name)
                  return Math.max(max, minLevelOf(req.name as string));
                return max;
              }, 1)
            )
          );
    visiting.delete(id);

    const finalLevel = Math.max(level, node.abilityLevel ?? 1);
    resolved.set(id, finalLevel);
    return finalLevel;
  };

  Object.keys(nodes).forEach((id) => {
    nodes[id].minLevel = minLevelOf(id);
  });
}

/** Nós sem pré-requisito dos quais `id` descende. Para uma raiz, ela mesma. */
function collectOrigins(
  nodes: Record<string, PowerTreeNode>,
  id: string
): string[] {
  const origins = new Set<string>();
  const visited = new Set<string>();

  const walk = (current: string) => {
    if (visited.has(current)) return;
    visited.add(current);
    const prerequisites = nodes[current]?.prerequisites ?? [];
    if (prerequisites.length === 0) {
      origins.add(current);
      return;
    }
    prerequisites.forEach(walk);
  };

  walk(id);
  return [...origins].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Toda a cadeia de pré-requisitos acima de `id`, direta ou indireta. */
function collectAncestorIds(
  nodes: Record<string, PowerTreeNode>,
  id: string
): Set<string> {
  const found = new Set<string>();
  const walk = (current: string) => {
    (nodes[current]?.prerequisites ?? []).forEach((previous) => {
      if (found.has(previous)) return;
      found.add(previous);
      walk(previous);
    });
  };
  walk(id);
  return found;
}

/**
 * Agrupa os poderes por conjunto EXATO de origens.
 *
 * O critério óbvio seria componente conexo, mas ele funde linhas que não têm
 * nada a ver: no Inventor, "Farmácia Mágica" é o único poder que exige
 * Farmacêutico *e* Alquimista Iniciado, e só por causa dele os 14 poderes das
 * duas linhas viravam uma árvore só. Agrupando por origem exata, "Farmacêutico
 * + Alquimista Iniciado → Farmácia Mágica" fica numa árvore e o resto da linha
 * alquímica em outra.
 *
 * Uma raiz aparece em todas as árvores que nascem dela — é o preço de separar,
 * e é informação verdadeira: o poder realmente participa das duas linhas.
 */
function findClusters(
  nodes: Record<string, PowerTreeNode>,
  edges: PowerTreeEdge[]
): PowerTreeCluster[] {
  const groups = new Map<string, Set<string>>();

  Object.keys(nodes).forEach((id) => {
    if (nodes[id].prerequisites.length === 0) return;

    const ancestors = collectAncestorIds(nodes, id);
    const origins = collectOrigins(nodes, id);
    // Ciclo fechado nos dados não tem origem nenhuma; nesse caso o próprio
    // laço identifica o grupo, para os poderes não sumirem do desenho.
    const key = (
      origins.length > 0
        ? origins
        : [...new Set([...ancestors, id])].sort((a, b) =>
            a.localeCompare(b, 'pt-BR')
          )
    ).join('|');

    const group = groups.get(key) ?? new Set<string>();
    group.add(id);
    // Toda a cadeia até a origem entra junto, senão a árvore desenhada teria
    // um nó pendurado sem o pré-requisito que o destrava.
    ancestors.forEach((ancestor) => group.add(ancestor));
    groups.set(key, group);
  });

  return Array.from(groups.entries())
    .map(([key, ids]) => {
      const idSet = new Set(ids);
      const nodeIds = [...ids].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      return {
        id: key,
        rootIds: key.split('|'),
        nodeIds,
        edges: edges.filter(
          (edge) => idSet.has(edge.from) && idSet.has(edge.to)
        ),
      };
    })
    .filter((cluster) => cluster.nodeIds.length > 1)
    .sort((a, b) => {
      if (b.nodeIds.length !== a.nodeIds.length)
        return b.nodeIds.length - a.nodeIds.length;
      return a.id.localeCompare(b.id, 'pt-BR');
    });
}

/**
 * Monta o grafo de pré-requisitos dos poderes de uma classe.
 *
 * Pré-requisitos são resolvidos, nesta ordem, contra os poderes da classe, as
 * habilidades da classe, as opções de escolha dessas habilidades e os poderes
 * gerais. O que não bate com nada vira um nó
 * `external`: são ~20 casos no jogo todo (variantes que removeram o poder base,
 * nomes divergentes como "Canalizar Energia Positiva" vs. "Canalizar Energia
 * Positiva/Negativa"). Marcar em vez de descartar mantém a árvore íntegra e
 * deixa a inconsistência visível.
 */
export function buildClassPowerGraph({
  classe,
  generalPowers = [],
}: BuildGraphParams): ClassPowerGraph {
  const powersByName = new Map(classe.powers.map((p) => [p.name, p]));
  const abilitiesByName = new Map(classe.abilities.map((a) => [a.name, a]));
  const abilityOptions = collectAbilityOptions(classe.abilities);
  const generalByName = new Map(generalPowers.map((p) => [p.name, p]));

  const nodes: Record<string, PowerTreeNode> = {};
  classe.powers.forEach((power) => {
    nodes[power.name] = powerNode(power);
  });

  const resolvePrerequisite = (name: string): PowerTreeNode => {
    if (nodes[name]) return nodes[name];

    const power = powersByName.get(name);
    if (power) return powerNode(power);

    const ability = abilitiesByName.get(name);
    if (ability) return abilityNode(ability);

    // Antes dos poderes gerais: o que é da própria classe tem precedência.
    const option = abilityOptions.get(name);
    if (option) return abilityOptionNode(option);

    const general = generalByName.get(name);
    if (general) return generalNode(general);

    return externalNode(name);
  };

  const edges: PowerTreeEdge[] = [];
  const seenEdges = new Set<string>();

  classe.powers.forEach((power) => {
    const node = nodes[power.name];
    const groups = (power.requirements ?? []).filter(
      (group) => group.length > 0
    );

    groups.forEach((group) => {
      group.forEach((req) => {
        if (!isPrerequisiteLink(req) || !req.name) return;
        const prereqName = req.name as string;
        // Auto-referência nos dados: ignorar em vez de criar um laço.
        if (prereqName === power.name) return;

        if (!nodes[prereqName]) {
          nodes[prereqName] = resolvePrerequisite(prereqName);
        }

        const edgeKey = `${prereqName}->${power.name}`;
        if (seenEdges.has(edgeKey)) return;
        seenEdges.add(edgeKey);

        edges.push({
          from: prereqName,
          to: power.name,
          alternative: groups.length > 1,
        });
        node.prerequisites.push(prereqName);
        nodes[prereqName].unlocks.push(power.name);
      });
    });
  });

  Object.values(nodes).forEach((node) => {
    node.unlocks.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  });

  computeMinLevels(nodes);

  const clusters = findClusters(nodes, edges);
  const clustered = new Set(clusters.flatMap((cluster) => cluster.nodeIds));
  const standaloneIds = classe.powers
    .map((power) => power.name)
    .filter((name) => !clustered.has(name))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return {
    className: classe.name,
    nodes,
    clusters,
    standaloneIds,
    stats: {
      totalPowers: classe.powers.length,
      powersInClusters: classe.powers.length - standaloneIds.length,
      standalonePowers: standaloneIds.length,
      largestCluster: clusters[0]?.nodeIds.length ?? 0,
    },
  };
}

/**
 * Nó final único para onde todas as entradas de uma árvore convergem.
 *
 * Quando várias entradas levam ao mesmo lugar, é esse destino que dá nome à
 * linha: "Ritual do Lich" diz muito mais do que "Celebrar Ritual · Escrever
 * Pergaminho · Preparar Poção". Com mais de uma ponta não há um destino só, e
 * aí não há nome a extrair.
 */
export function convergencePoint(
  cluster: PowerTreeCluster,
  graph: ClassPowerGraph
): string | null {
  const inCluster = new Set(cluster.nodeIds);
  const pontas = cluster.nodeIds.filter(
    (id) =>
      (graph.nodes[id]?.unlocks ?? []).filter((next) => inCluster.has(next))
        .length === 0
  );
  return pontas.length === 1 ? pontas[0] : null;
}

/** Todos os nós alcançáveis a partir de `id` seguindo as arestas para frente. */
export function collectDescendants(
  graph: ClassPowerGraph,
  id: string
): Set<string> {
  const found = new Set<string>();
  const walk = (current: string) => {
    graph.nodes[current]?.unlocks.forEach((next) => {
      if (found.has(next)) return;
      found.add(next);
      walk(next);
    });
  };
  walk(id);
  return found;
}

/** Todos os nós que levam até `id` seguindo as arestas para trás. */
export function collectAncestors(
  graph: ClassPowerGraph,
  id: string
): Set<string> {
  const found = new Set<string>();
  const walk = (current: string) => {
    graph.nodes[current]?.prerequisites.forEach((prev) => {
      if (found.has(prev)) return;
      found.add(prev);
      walk(prev);
    });
  };
  walk(id);
  return found;
}
