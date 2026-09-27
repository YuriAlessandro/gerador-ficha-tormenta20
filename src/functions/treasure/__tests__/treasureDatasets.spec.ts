/**
 * Integridade das tabelas e rastreabilidade da "cola" escrita à mão
 * (marcadores, mapeamento do 1d6, regras dos livros).
 */
import {
  TREASURE_DATASETS,
  TreasureDataset,
} from '@/data/treasure/treasureDatasets';
import {
  ARMOR_ENCHANTMENT_RULES,
  ARMOR_IMPROVEMENT_RULES,
  ESOTERIC_ENCHANTMENT_RULES,
  ESOTERIC_IMPROVEMENT_RULES,
  WEAPON_ENCHANTMENT_RULES,
  WEAPON_IMPROVEMENT_RULES,
} from '@/data/treasure/treasureRules';
import type { TreasureRange, TreasureTable } from '@/data/treasure/types';
import { ND_ORDER, parseMaterialList } from '../treasureRoller';

const datasets = Object.values(TREASURE_DATASETS);

function expectCoverage(rows: TreasureRange[], max: number, label: string) {
  let expected = 1;
  rows.forEach((r) => {
    expect({ label, min: r.min }).toEqual({ label, min: expected });
    expect(r.max).toBeGreaterThanOrEqual(r.min);
    expected = r.max + 1;
  });
  expect({ label, end: expected - 1 }).toEqual({ label, end: max });
}

function allTables(ds: TreasureDataset): [string, TreasureTable, number][] {
  const t = ds.tables;
  const list: [string, TreasureTable | undefined, number][] = [
    ['itensDiversos', t.itensDiversos, 100],
    ['equipamentos.armas', t.equipamentos.armas, 100],
    ['equipamentos.armaduras', t.equipamentos.armaduras, 100],
    ['equipamentos.esotericos', t.equipamentos.esotericos, 100],
    ['pocoes', t.pocoes, ds.potionMax],
    ['superiores.armas', t.superiores.armas, 100],
    ['superiores.armaduras', t.superiores.armaduras, 100],
    ['superiores.esotericos', t.superiores.esotericos, 100],
    ['magicos.armas', t.magicos.armas, 100],
    ['magicos.armasEspecificas', t.magicos.armasEspecificas, 100],
    ['magicos.armaduras', t.magicos.armaduras, 100],
    ['magicos.armadurasEspecificas', t.magicos.armadurasEspecificas, 100],
    ['magicos.esotericos', t.magicos.esotericos, 100],
    ['magicos.esotericosEspecificos', t.magicos.esotericosEspecificos, 100],
    ['acessorios.menor', t.acessorios.menor, 100],
    ['acessorios.medio', t.acessorios.medio, 100],
    ['acessorios.maior', t.acessorios.maior, 100],
  ];
  return list.filter((x): x is [string, TreasureTable, number] =>
    Boolean(x[1])
  );
}

describe.each(datasets)('dataset $mode', (ds) => {
  it('toda tabela d% cobre a faixa inteira sem buracos', () => {
    allTables(ds).forEach(([label, table, max]) =>
      expectCoverage(table.rows, max, `${ds.mode} ${label}`)
    );
  });

  it('Tesouro por ND tem os 22 NDs e as duas colunas cobrem 1-100', () => {
    // Chaves numéricas vêm antes de '1/4' num objeto JS: compara ordenado.
    expect(Object.keys(ds.tables.tesouroPorNd.byNd).sort()).toEqual(
      [...ND_ORDER].sort()
    );
    ND_ORDER.forEach((nd) => {
      const row = ds.tables.tesouroPorNd.byNd[nd];
      expectCoverage(row.money, 100, `${ds.mode} ND ${nd} dinheiro`);
      expectCoverage(row.items, 100, `${ds.mode} ND ${nd} itens`);
    });
  });

  it('riquezas cobrem 1-100 nas três categorias', () => {
    (['menor', 'media', 'maior'] as const).forEach((tier) =>
      expectCoverage(
        ds.tables.riquezas.values
          .map((v) => v[tier])
          .filter((r): r is TreasureRange => r !== null),
        100,
        `${ds.mode} riqueza ${tier}`
      )
    );
  });

  it('o mapeamento do 1d6 está escrito na fonte e cobre 1-6', () => {
    const text = [
      ...ds.tables.tesouroPorNd.instructions,
      ...(ds.tables.introduction ?? []),
    ].join(' ');
    [ds.equipmentType, ds.magicType].forEach((m) => {
      expect(text).toContain(m.sourceText);
      expectCoverage(m.ranges, 6, `${ds.mode} 1d6`);
    });
  });

  it('todo marcador das tabelas tem significado, vindo de uma nota da fonte', () => {
    const groups: [string, TreasureTable[]][] = [
      [
        'superiores',
        [
          ds.tables.superiores.armas,
          ds.tables.superiores.armaduras,
          ds.tables.superiores.esotericos,
        ],
      ],
      ['encantosArmas', [ds.tables.magicos.armas]],
      ['encantosArmaduras', [ds.tables.magicos.armaduras]],
      [
        'encantosEsotericos',
        ds.tables.magicos.esotericos ? [ds.tables.magicos.esotericos] : [],
      ],
    ];
    const allFootnotes = allTables(ds)
      .flatMap(([, t]) => t.footnotes)
      .join(' ');
    groups.forEach(([key, tables]) => {
      const rules = ds.markers[key as keyof TreasureDataset['markers']];
      tables
        .flatMap((t) => t.rows)
        .filter((r) => r.marker)
        .forEach((r) => {
          expect({
            key,
            marker: r.marker,
            ok: Boolean(rules[r.marker!]),
          }).toEqual({ key, marker: r.marker, ok: true });
        });
      Object.values(rules).forEach((rule) => {
        expect(rule.footnote).not.toBe('');
        expect(allFootnotes).toContain(rule.footnote.split(' Se o item')[0]);
      });
    });
  });

  it('todo item "conta como dois" tem pré-requisito com citação', () => {
    const check = (
      table: TreasureTable | undefined,
      markerKey: keyof TreasureDataset['markers'],
      rules: Record<string, { prerequisite?: unknown }>
    ) =>
      table?.rows
        .filter(
          (r) =>
            r.marker &&
            ds.markers[markerKey][r.marker]?.meaning.kind === 'double'
        )
        .forEach((r) =>
          expect({
            name: r.name,
            has: Boolean(rules[r.name]?.prerequisite),
          }).toEqual({
            name: r.name,
            has: true,
          })
        );
    check(ds.tables.superiores.armas, 'superiores', WEAPON_IMPROVEMENT_RULES);
    check(
      ds.tables.superiores.armaduras,
      'superiores',
      ARMOR_IMPROVEMENT_RULES
    );
    check(
      ds.tables.superiores.esotericos,
      'superiores',
      ESOTERIC_IMPROVEMENT_RULES
    );
    check(ds.tables.magicos.armas, 'encantosArmas', WEAPON_ENCHANTMENT_RULES);
    check(
      ds.tables.magicos.armaduras,
      'encantosArmaduras',
      ARMOR_ENCHANTMENT_RULES
    );
  });

  it('a nota de material especial lista os 6 materiais', () => {
    const material = Object.values(ds.markers.superiores).find(
      (m) => m.meaning.kind === 'material'
    );
    expect(parseMaterialList(material!.footnote)).toEqual([
      'aço-rubi',
      'adamante',
      'gelo eterno',
      'madeira Tollon',
      'matéria vermelha',
      'mitral',
    ]);
  });
});

describe('regras dos livros', () => {
  const names = (tables: (TreasureTable | undefined)[]) =>
    new Set(tables.flatMap((t) => t?.rows.map((r) => r.name) ?? []));
  const pick = (
    fn: (ds: TreasureDataset) => TreasureTable | undefined
  ): Set<string> => names(datasets.map(fn));

  it.each([
    [
      'melhorias de armas',
      WEAPON_IMPROVEMENT_RULES,
      pick((d) => d.tables.superiores.armas),
    ],
    [
      'melhorias de armaduras',
      ARMOR_IMPROVEMENT_RULES,
      pick((d) => d.tables.superiores.armaduras),
    ],
    [
      'melhorias de esotéricos',
      ESOTERIC_IMPROVEMENT_RULES,
      pick((d) => d.tables.superiores.esotericos),
    ],
    [
      'encantos de armas',
      WEAPON_ENCHANTMENT_RULES,
      pick((d) => d.tables.magicos.armas),
    ],
    [
      'encantos de armaduras',
      ARMOR_ENCHANTMENT_RULES,
      pick((d) => d.tables.magicos.armaduras),
    ],
    [
      'encantos de esotéricos',
      ESOTERIC_ENCHANTMENT_RULES,
      pick((d) => d.tables.magicos.esotericos),
    ],
  ])(
    'toda regra de %s corresponde a uma entrada das tabelas',
    (_, rules, tableNames) => {
      Object.keys(rules).forEach((name) =>
        expect({ name, found: tableNames.has(name) }).toEqual({
          name,
          found: true,
        })
      );
    }
  );
});
