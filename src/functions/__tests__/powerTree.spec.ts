import { describe, expect, test } from 'vitest';
import type {
  ClassAbility,
  ClassDescription,
  ClassPower,
} from '../../interfaces/Class';
import type { GeneralPower } from '../../interfaces/Poderes';
import { GeneralPowerType, RequirementType } from '../../interfaces/Poderes';
import CLASSES from '../../data/systems/tormenta20/core/classes';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import {
  buildClassPowerGraph,
  collectAncestors,
  collectDescendants,
} from '../powerTree';
import { layoutCluster, DEFAULT_LAYOUT_OPTIONS } from '../powerTreeLayout';

function makeClass(
  powers: ClassPower[],
  abilities: ClassAbility[] = []
): ClassDescription {
  return {
    name: 'Teste',
    pv: 16,
    addpv: 4,
    pm: 4,
    addpm: 4,
    periciasbasicas: [],
    periciasrestantes: { qtd: 2, list: [] },
    proficiencias: [],
    abilities,
    powers,
    probDevoto: 0,
    attrPriority: [],
  } as unknown as ClassDescription;
}

const requerPoder = (name: string) => [[{ type: RequirementType.PODER, name }]];

describe('buildClassPowerGraph', () => {
  test('separa poderes encadeados de poderes avulsos', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Raiz', text: 'a', requirements: [] },
        { name: 'Folha', text: 'b', requirements: requerPoder('Raiz') },
        { name: 'Avulso', text: 'c', requirements: [] },
      ]),
    });

    expect(graph.clusters).toHaveLength(1);
    expect(graph.clusters[0].nodeIds).toEqual(['Folha', 'Raiz']);
    expect(graph.clusters[0].rootIds).toEqual(['Raiz']);
    expect(graph.standaloneIds).toEqual(['Avulso']);
    expect(graph.stats).toEqual({
      totalPowers: 3,
      powersInClusters: 2,
      standalonePowers: 1,
      largestCluster: 2,
    });
  });

  test('liga pai e filho nos dois sentidos', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Raiz', text: 'a', requirements: [] },
        { name: 'Folha', text: 'b', requirements: requerPoder('Raiz') },
      ]),
    });

    expect(graph.nodes.Folha.prerequisites).toEqual(['Raiz']);
    expect(graph.nodes.Raiz.unlocks).toEqual(['Folha']);
    expect(graph.clusters[0].edges).toEqual([
      { from: 'Raiz', to: 'Folha', alternative: false },
    ]);
  });

  test('requisito negado exclui, então não vira aresta', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Raiz', text: 'a', requirements: [] },
        {
          name: 'Excludente',
          text: 'b',
          requirements: [
            [{ type: RequirementType.PODER, name: 'Raiz', not: true }],
          ],
        },
      ]),
    });

    expect(graph.clusters).toHaveLength(0);
    expect(graph.standaloneIds).toEqual(['Excludente', 'Raiz']);
  });

  test('grupos alternativos (OU) marcam as arestas como alternativas', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Via A', text: 'a', requirements: [] },
        { name: 'Via B', text: 'b', requirements: [] },
        {
          name: 'Destino',
          text: 'c',
          requirements: [
            [{ type: RequirementType.PODER, name: 'Via A' }],
            [{ type: RequirementType.PODER, name: 'Via B' }],
          ],
        },
      ]),
    });

    expect(graph.nodes.Destino.hasAlternatives).toBe(true);
    expect(graph.clusters[0].edges.every((e) => e.alternative)).toBe(true);
  });

  test('requisitos do mesmo grupo (E) não são alternativos', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Via A', text: 'a', requirements: [] },
        { name: 'Via B', text: 'b', requirements: [] },
        {
          name: 'Destino',
          text: 'c',
          requirements: [
            [
              { type: RequirementType.PODER, name: 'Via A' },
              { type: RequirementType.PODER, name: 'Via B' },
            ],
          ],
        },
      ]),
    });

    expect(graph.nodes.Destino.hasAlternatives).toBe(false);
    expect(graph.clusters[0].edges.every((e) => !e.alternative)).toBe(true);
  });

  test('separa por origem exata em vez de fundir tudo que se toca', () => {
    // "Extra" depende das duas raízes; os demais só de "Base". Fundir os dois
    // conjuntos numa árvore só é o que o agrupamento por componente conexo
    // fazia, e é o que este critério evita.
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Base', text: 'a', requirements: [] },
        { name: 'Outra Raiz', text: 'b', requirements: [] },
        { name: 'Só da Base', text: 'c', requirements: requerPoder('Base') },
        {
          name: 'Das Duas',
          text: 'd',
          requirements: [
            [
              { type: RequirementType.PODER, name: 'Base' },
              { type: RequirementType.PODER, name: 'Outra Raiz' },
            ],
          ],
        },
      ]),
    });

    const porOrigem = graph.clusters.map((c) => c.rootIds.join(' + '));
    expect(porOrigem).toContain('Base');
    expect(porOrigem).toContain('Base + Outra Raiz');

    const daBase = graph.clusters.find((c) => c.id === 'Base');
    expect(daBase?.nodeIds).toEqual(['Base', 'Só da Base']);

    const dasDuas = graph.clusters.find((c) => c.id === 'Base|Outra Raiz');
    expect(dasDuas?.nodeIds).toEqual(['Base', 'Das Duas', 'Outra Raiz']);
  });

  test('a cadeia inteira acompanha a árvore da sua origem', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Raiz', text: 'a', requirements: [] },
        { name: 'Meio', text: 'b', requirements: requerPoder('Raiz') },
        { name: 'Ponta', text: 'c', requirements: requerPoder('Meio') },
      ]),
    });

    expect(graph.clusters).toHaveLength(1);
    expect(graph.clusters[0].nodeIds).toEqual(['Meio', 'Ponta', 'Raiz']);
  });

  test('resolve pré-requisito que é habilidade de classe', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass(
        [
          {
            name: 'Derivado',
            text: 'b',
            requirements: [
              [{ type: RequirementType.HABILIDADE, name: 'Ataque Furtivo' }],
            ],
          },
        ],
        [{ name: 'Ataque Furtivo', text: 'hab', nivel: 1 }]
      ),
    });

    expect(graph.nodes['Ataque Furtivo'].kind).toBe('ability');
    expect(graph.nodes['Ataque Furtivo'].abilityLevel).toBe(1);
  });

  test('resolve pré-requisito que é poder geral', () => {
    const geral: GeneralPower = {
      name: 'Celebrar Ritual',
      description: 'geral',
      type: GeneralPowerType.MAGIA,
      requirements: [],
    };

    const graph = buildClassPowerGraph({
      classe: makeClass([
        {
          name: 'Ritual do Lich',
          text: 'b',
          requirements: requerPoder('Celebrar Ritual'),
        },
      ]),
      generalPowers: [geral],
    });

    expect(graph.nodes['Celebrar Ritual'].kind).toBe('general');
    expect(graph.nodes['Celebrar Ritual'].text).toBe('geral');
  });

  test('resolve pré-requisito que é opção de uma habilidade de classe', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass(
        [
          {
            name: 'Líder da Matilha',
            text: 'b',
            requirements: requerPoder('Conquistar pelos Números'),
          },
        ],
        [
          {
            name: 'Treino Especializado',
            text: 'escolha uma',
            nivel: 5,
            sheetActions: [
              {
                source: { type: 'class', className: 'Treinador' },
                action: {
                  type: 'chooseFromOptions',
                  optionKey: 'treinoEspecializado',
                  options: [
                    { name: 'Conquistar pelos Números', text: 'segundo amigo' },
                    { name: 'Treino Intensivo', text: 'amigo mais forte' },
                  ],
                },
              },
            ],
          } as ClassAbility,
        ]
      ),
    });

    const node = graph.nodes['Conquistar pelos Números'];
    expect(node.kind).toBe('abilityOption');
    expect(node.parentAbilityName).toBe('Treino Especializado');
    expect(node.text).toBe('segundo amigo');
    // Herda o nível da habilidade que oferece a escolha.
    expect(graph.nodes['Líder da Matilha'].minLevel).toBe(5);
  });

  test('pré-requisito não encontrado vira nó externo em vez de sumir', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        {
          name: 'Forma Aberrante',
          text: 'b',
          requirements: requerPoder('Forma Selvagem'),
        },
      ]),
    });

    expect(graph.nodes['Forma Selvagem'].kind).toBe('external');
    expect(graph.clusters[0].nodeIds).toContain('Forma Selvagem');
  });

  test('não duplica aresta quando o mesmo pré-requisito aparece em vários grupos', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'Raiz', text: 'a', requirements: [] },
        {
          name: 'Folha',
          text: 'b',
          requirements: [
            [{ type: RequirementType.PODER, name: 'Raiz' }],
            [
              { type: RequirementType.PODER, name: 'Raiz' },
              { type: RequirementType.NIVEL, value: 5 },
            ],
          ],
        },
      ]),
    });

    expect(graph.clusters[0].edges).toHaveLength(1);
    expect(graph.nodes.Folha.prerequisites).toEqual(['Raiz']);
  });
});

describe('nível mínimo', () => {
  test('grupos alternativos usam o caminho mais barato', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        {
          name: 'Poder',
          text: 'a',
          requirements: [
            [{ type: RequirementType.NIVEL, value: 12 }],
            [{ type: RequirementType.NIVEL, value: 5 }],
          ],
        },
      ]),
    });

    expect(graph.nodes.Poder.levelRequirement).toBe(5);
    expect(graph.nodes.Poder.minLevel).toBe(5);
  });

  test('requisitos do mesmo grupo usam o mais caro', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        {
          name: 'Poder',
          text: 'a',
          requirements: [
            [
              { type: RequirementType.NIVEL, value: 5 },
              { type: RequirementType.NIVEL, value: 12 },
            ],
          ],
        },
      ]),
    });

    expect(graph.nodes.Poder.levelRequirement).toBe(12);
  });

  test('herda o nível da cadeia de pré-requisitos', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        {
          name: 'Base',
          text: 'a',
          requirements: [[{ type: RequirementType.NIVEL, value: 7 }]],
        },
        { name: 'Meio', text: 'b', requirements: requerPoder('Base') },
        { name: 'Topo', text: 'c', requirements: requerPoder('Meio') },
      ]),
    });

    // Nenhum dos dois declara nível, mas dependem de um poder de 7º nível.
    expect(graph.nodes.Meio.levelRequirement).toBe(1);
    expect(graph.nodes.Meio.minLevel).toBe(7);
    expect(graph.nodes.Topo.minLevel).toBe(7);
  });

  test('habilidade de classe leva o nível em que é ganha', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass(
        [{ name: 'Derivado', text: 'b', requirements: requerPoder('Evasão') }],
        [{ name: 'Evasão', text: 'hab', nivel: 3 }]
      ),
    });

    expect(graph.nodes['Evasão'].minLevel).toBe(3);
    expect(graph.nodes.Derivado.minLevel).toBe(3);
  });

  test('ciclo nos dados não trava o cálculo', () => {
    const graph = buildClassPowerGraph({
      classe: makeClass([
        { name: 'A', text: 'a', requirements: requerPoder('B') },
        { name: 'B', text: 'b', requirements: requerPoder('A') },
      ]),
    });

    expect(graph.nodes.A.minLevel).toBeGreaterThanOrEqual(1);
    expect(graph.clusters[0].nodeIds).toEqual(['A', 'B']);
  });
});

describe('travessia', () => {
  const graph = buildClassPowerGraph({
    classe: makeClass([
      { name: 'Raiz', text: 'a', requirements: [] },
      { name: 'Meio', text: 'b', requirements: requerPoder('Raiz') },
      { name: 'Folha', text: 'c', requirements: requerPoder('Meio') },
      { name: 'Outro', text: 'd', requirements: requerPoder('Raiz') },
    ]),
  });

  test('descendentes cobrem a cadeia inteira', () => {
    expect(collectDescendants(graph, 'Raiz')).toEqual(
      new Set(['Meio', 'Folha', 'Outro'])
    );
  });

  test('ancestrais sobem até a raiz', () => {
    expect(collectAncestors(graph, 'Folha')).toEqual(new Set(['Meio', 'Raiz']));
  });

  test('travessia não entra em laço infinito com ciclo', () => {
    const ciclico = buildClassPowerGraph({
      classe: makeClass([
        { name: 'A', text: 'a', requirements: requerPoder('B') },
        { name: 'B', text: 'b', requirements: requerPoder('A') },
      ]),
    });

    expect(collectDescendants(ciclico, 'A')).toEqual(new Set(['A', 'B']));
  });
});

describe('dados reais de Tormenta 20', () => {
  const findClass = (name: string) => {
    const classe = CLASSES.find((c) => c.name === name);
    if (!classe) throw new Error(`classe ${name} não encontrada`);
    return classe;
  };

  test('Forma Selvagem abre uma linha de poderes do Druida', () => {
    const graph = buildClassPowerGraph({ classe: findClass('Druida') });
    const arvore = graph.clusters.find((c) =>
      c.nodeIds.includes('Forma Selvagem')
    );

    expect(arvore?.rootIds).toContain('Forma Selvagem');
    expect(graph.nodes['Forma Selvagem'].unlocks).toContain(
      'Forma Selvagem Aprimorada'
    );
    expect(graph.nodes['Forma Selvagem'].unlocks).toContain('Presas Afiadas');
  });

  test('as árvores vêm da maior para a menor', () => {
    const graph = buildClassPowerGraph({ classe: findClass('Druida') });
    const tamanhos = graph.clusters.map((c) => c.nodeIds.length);

    expect(tamanhos).toEqual([...tamanhos].sort((a, b) => b - a));
    expect(graph.stats.largestCluster).toBe(tamanhos[0]);
  });

  test('Alquimista Iniciado destrava a linha alquímica do Inventor', () => {
    const graph = buildClassPowerGraph({ classe: findClass('Inventor') });

    expect(graph.nodes['Alquimista Iniciado'].unlocks).toContain(
      'Mestre Alquimista'
    );
    expect(graph.stats.powersInClusters).toBeGreaterThan(0);
  });

  test('Farmácia Mágica sai da linha alquímica por exigir Farmacêutico', () => {
    // Farmacêutico vem de Heróis de Arton, então este caso precisa do registry
    // com os suplementos ligados — o livro básico sozinho não o tem.
    const comSuplementos = dataRegistry.getClassesWithSupplementInfo([
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
    const inventor = comSuplementos.find((c) => c.name === 'Inventor');
    if (!inventor) throw new Error('Inventor não encontrado');
    const graph = buildClassPowerGraph({ classe: inventor });

    const alquimica = graph.clusters.find(
      (c) => c.id === 'Alquimista Iniciado'
    );
    const comFarmaceutico = graph.clusters.find(
      (c) => c.id === 'Alquimista Iniciado|Farmacêutico'
    );

    expect(comFarmaceutico?.nodeIds).toEqual([
      'Alquimista Iniciado',
      'Farmacêutico',
      'Farmácia Mágica',
    ]);
    expect(alquimica?.nodeIds).not.toContain('Farmácia Mágica');
    expect(alquimica?.nodeIds).not.toContain('Farmacêutico');
    // A raiz compartilhada aparece nas duas — ela participa das duas linhas.
    expect(alquimica?.nodeIds).toContain('Alquimista Iniciado');
  });

  test('um poder não some da conta por estar em duas árvores', () => {
    CLASSES.forEach((classe) => {
      const graph = buildClassPowerGraph({ classe });
      const emArvores = new Set(graph.clusters.flatMap((c) => c.nodeIds));
      const poderesEmArvores = classe.powers.filter((p) =>
        emArvores.has(p.name)
      );

      expect(poderesEmArvores.length).toBe(graph.stats.powersInClusters);
    });
  });

  test('Conquistar pelos Números é da classe, não pré-requisito externo', () => {
    // Ela é uma das opções de "Treino Especializado" (5º nível) do Treinador,
    // e mora dentro de sheetActions — não na lista de poderes nem de
    // habilidades. Sem olhar lá, apareceria como "fora desta classe".
    const comSuplementos = dataRegistry.getClassesWithSupplementInfo([
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
    const treinador = comSuplementos.find((c) => c.name === 'Treinador');
    if (!treinador) throw new Error('Treinador não encontrado');
    const graph = buildClassPowerGraph({ classe: treinador });

    expect(graph.nodes['Conquistar pelos Números'].kind).toBe('abilityOption');
    expect(graph.nodes['Conquistar pelos Números'].parentAbilityName).toBe(
      'Treino Especializado'
    );
  });

  test('as opções de Bênção da Justiça do Paladino também resolvem', () => {
    // Escudo Fraterno e Investida Sagrada vêm de suplemento, então este caso
    // precisa do registry com eles ligados.
    const comSuplementos = dataRegistry.getClassesWithSupplementInfo([
      SupplementId.TORMENTA20_CORE,
      SupplementId.TORMENTA20_AMEACAS_ARTON,
      SupplementId.TORMENTA20_DEUSES_ARTON,
      SupplementId.TORMENTA20_HEROIS_ARTON,
    ]);
    const paladino = comSuplementos.find((c) => c.name === 'Paladino');
    if (!paladino) throw new Error('Paladino não encontrado');
    const graph = buildClassPowerGraph({ classe: paladino });

    expect(graph.nodes['Égide Sagrada']?.kind).toBe('abilityOption');
    expect(graph.nodes['Montaria Sagrada']?.kind).toBe('abilityOption');
  });

  test('toda classe do básico gera um grafo coerente', () => {
    CLASSES.forEach((classe) => {
      const graph = buildClassPowerGraph({ classe });

      // Nenhum poder pode ficar fora da conta.
      expect(graph.stats.powersInClusters + graph.stats.standalonePowers).toBe(
        classe.powers.length
      );

      // Toda aresta aponta para nós existentes, nos dois sentidos.
      graph.clusters.forEach((cluster) => {
        cluster.edges.forEach((edge) => {
          expect(graph.nodes[edge.from]).toBeDefined();
          expect(graph.nodes[edge.to]).toBeDefined();
          expect(graph.nodes[edge.to].prerequisites).toContain(edge.from);
          expect(graph.nodes[edge.from].unlocks).toContain(edge.to);
        });
      });
    });
  });
});

describe('layoutCluster', () => {
  const graph = buildClassPowerGraph({
    classe: makeClass([
      { name: 'Raiz', text: 'a', requirements: [] },
      { name: 'Filho 1', text: 'b', requirements: requerPoder('Raiz') },
      { name: 'Filho 2', text: 'c', requirements: requerPoder('Raiz') },
      { name: 'Neto', text: 'd', requirements: requerPoder('Filho 1') },
    ]),
  });

  test('cada nível vira uma coluna à direita da anterior', () => {
    const layout = layoutCluster(graph.clusters[0], graph);
    const posicao = new Map(layout.nodes.map((n) => [n.id, n]));

    expect(posicao.get('Raiz')?.depth).toBe(0);
    expect(posicao.get('Filho 1')?.depth).toBe(1);
    expect(posicao.get('Neto')?.depth).toBe(2);
    expect(posicao.get('Neto')?.x).toBeGreaterThan(
      posicao.get('Filho 1')?.x ?? 0
    );
    expect(layout.columns).toBe(3);
  });

  test('nós da mesma coluna nunca se sobrepõem', () => {
    const layout = layoutCluster(graph.clusters[0], graph);
    const porColuna = new Map<number, number[]>();
    layout.nodes.forEach((node) => {
      porColuna.set(node.depth, [...(porColuna.get(node.depth) ?? []), node.y]);
    });

    porColuna.forEach((ys) => {
      ys.sort((a, b) => a - b).forEach((y, index) => {
        if (index === 0) return;
        expect(y - ys[index - 1]).toBeGreaterThanOrEqual(
          DEFAULT_LAYOUT_OPTIONS.nodeHeight
        );
      });
    });
  });

  test('o desenho começa no topo e cabe na área calculada', () => {
    const layout = layoutCluster(graph.clusters[0], graph);

    expect(Math.min(...layout.nodes.map((n) => n.y))).toBe(0);
    layout.nodes.forEach((node) => {
      expect(node.y + layout.nodeHeight).toBeLessThanOrEqual(layout.height);
      expect(node.x + layout.nodeWidth).toBeLessThanOrEqual(layout.width);
    });
  });

  test('gera uma curva por aresta', () => {
    const layout = layoutCluster(graph.clusters[0], graph);

    expect(layout.edges).toHaveLength(3);
    layout.edges.forEach((edge) => {
      expect(edge.path).toMatch(/^M [\d.-]+ [\d.-]+ C /);
    });
  });

  test('aguenta as árvores largas dos dados reais', () => {
    const druida = buildClassPowerGraph({
      classe: CLASSES.find((c) => c.name === 'Druida') as ClassDescription,
    });

    druida.clusters.forEach((cluster) => {
      const layout = layoutCluster(cluster, druida);
      expect(layout.nodes).toHaveLength(cluster.nodeIds.length);
      expect(layout.height).toBeGreaterThan(0);
      expect(layout.width).toBeGreaterThan(0);
    });
  });
});
