/**
 * Roteiro da animação de caça-níquel do gerador de tesouro.
 *
 * O resultado já vem inteiro do motor (`rollTreasure`); aqui ele é convertido
 * na sequência de rolagens que o card encena, uma por vez. Cada passo traz as
 * linhas REAIS da tabela consultada e o índice da linha sorteada.
 */
import type {
  D6Mapping,
  ItemKind,
  TreasureDataset,
} from '@/data/treasure/treasureDatasets';
import type { TreasureRange, TreasureTable } from '@/data/treasure/types';
import type {
  EnhancementSet,
  ItemOutcome,
  MoneyOutcome,
  TreasureRollResult,
} from './treasureRoller';

export interface RevealStep {
  id: string;
  /** `choice` = escolha do 2D: sem rolo, só aparece. */
  kind: 'reel' | 'choice';
  lines: string[];
  finalIndex: number;
  /** Linhas de ND são maiores e giram por mais tempo. */
  size: 'major' | 'minor';
  /** Rolagem descartada: o rolo para, risca e explica. */
  rejectedReason?: string;
}

export const KIND_LABELS: Record<ItemKind, string> = {
  arma: 'Arma',
  armadura: 'Armadura/escudo',
  esoterico: 'Esotérico',
  acessorio: 'Acessório',
};

const pad = (n: number) => String(n).padStart(2, '0');

export const rangeLabel = (r: TreasureRange): string =>
  r.min === r.max ? pad(r.min) : `${pad(r.min)}-${pad(r.max)}`;

function indexOfValue(ranges: TreasureRange[], value: number): number {
  const idx = ranges.findIndex((r) => value >= r.min && value <= r.max);
  if (idx < 0) throw new Error(`Sem linha para ${value}`);
  return idx;
}

function tableStep(
  id: string,
  table: TreasureTable,
  value: number,
  rejectedReason?: string
): RevealStep {
  return {
    id,
    kind: 'reel',
    lines: table.rows.map((r) => `${rangeLabel(r)} · ${r.rawName}`),
    finalIndex: indexOfValue(table.rows, value),
    size: 'minor',
    rejectedReason,
  };
}

/** As 6 faces do 1d6 de tipo, cada uma com o tipo correspondente. */
function faceStep(id: string, mapping: D6Mapping, face: number): RevealStep {
  const lines = [1, 2, 3, 4, 5, 6].map((f) => {
    const r = mapping.ranges.find((x) => f >= x.min && f <= x.max);
    return `${f} · ${r ? KIND_LABELS[r.kind] : '?'}`;
  });
  return { id, kind: 'reel', lines, finalIndex: face - 1, size: 'minor' };
}

function moneySteps(
  ds: TreasureDataset,
  nd: string,
  outcome: MoneyOutcome,
  i: number
): RevealStep[] {
  const rows = ds.tables.tesouroPorNd.byNd[nd].money;
  const steps: RevealStep[] = [
    {
      id: `money-${i}`,
      kind: 'reel',
      lines: rows.map((r) => `${rangeLabel(r)} · ${r.label}`),
      finalIndex: indexOfValue(rows, outcome.roll),
      size: 'major',
    },
  ];
  const { detail } = outcome;
  if (detail.kind === 'riqueza' && outcome.row.result.kind === 'riqueza') {
    const { tier } = outcome.row.result;
    const values = ds.tables.riquezas.values.filter((v) => v[tier] !== null);
    detail.wealth.forEach((w, j) => {
      steps.push({
        id: `money-${i}-wealth-${j}`,
        kind: 'reel',
        lines: values.map(
          (v) => `${rangeLabel(v[tier] as TreasureRange)} · ${v.valueLabel}`
        ),
        finalIndex: values.indexOf(w.row),
        size: 'minor',
      });
    });
  }
  return steps;
}

function enhancementSteps(
  prefix: string,
  table: TreasureTable,
  set: EnhancementSet
): RevealStep[] {
  return set.attempts.map((a, k) =>
    tableStep(`${prefix}-att-${k}`, table, a.roll, a.reason)
  );
}

const TABLE_KEY = {
  arma: 'armas',
  armadura: 'armaduras',
  esoterico: 'esotericos',
} as const;

const SPECIFIC_KEY = {
  arma: 'armasEspecificas',
  armadura: 'armadurasEspecificas',
  esoterico: 'esotericosEspecificos',
} as const;

function itemSteps(
  ds: TreasureDataset,
  nd: string,
  outcome: ItemOutcome,
  i: number
): RevealStep[] {
  const { tables } = ds;
  const rows = tables.tesouroPorNd.byNd[nd].items;
  const p = `item-${i}`;
  const steps: RevealStep[] = [
    {
      id: p,
      kind: 'reel',
      lines: rows.map((r) => `${rangeLabel(r)} · ${r.label}`),
      finalIndex: indexOfValue(rows, outcome.roll),
      size: 'major',
    },
  ];
  const { detail, choice } = outcome;

  if (choice) {
    steps.push({
      id: `${p}-choice`,
      kind: 'choice',
      lines: [],
      finalIndex: 0,
      size: 'minor',
    });
  }
  if (!detail) return steps;

  switch (detail.kind) {
    case 'diverso':
      steps.push(
        tableStep(`${p}-diverso`, tables.itensDiversos, detail.item.lookup)
      );
      break;
    case 'pocao':
      detail.potions.forEach((potion, j) =>
        steps.push(tableStep(`${p}-potion-${j}`, tables.pocoes, potion.lookup))
      );
      break;
    case 'equipamento':
    case 'superior': {
      if (detail.typeRoll)
        steps.push(faceStep(`${p}-type`, ds.equipmentType, detail.typeRoll));
      if (detail.itemKind === 'acessorio') break;
      const key = TABLE_KEY[detail.itemKind];
      steps.push(
        tableStep(`${p}-base`, tables.equipamentos[key], detail.item.lookup)
      );
      if (detail.kind === 'superior')
        steps.push(
          ...enhancementSteps(p, tables.superiores[key], detail.improvements)
        );
      break;
    }
    case 'magico': {
      if (detail.typeRoll)
        steps.push(faceStep(`${p}-type`, ds.magicType, detail.typeRoll));
      if (detail.accessory) {
        steps.push(
          tableStep(
            `${p}-accessory`,
            tables.acessorios[detail.tier],
            detail.accessory.lookup
          )
        );
        break;
      }
      if (detail.itemKind === 'acessorio') break;
      const key = TABLE_KEY[detail.itemKind];
      const enchTable = tables.magicos[key];
      const specificTable = tables.magicos[SPECIFIC_KEY[detail.itemKind]];
      if (detail.base)
        steps.push(
          tableStep(`${p}-base`, tables.equipamentos[key], detail.base.lookup)
        );
      if (enchTable && detail.enchantments)
        steps.push(...enhancementSteps(p, enchTable, detail.enchantments));
      if (detail.specific && specificTable)
        steps.push(
          tableStep(`${p}-specific`, specificTable, detail.specific.lookup)
        );
      break;
    }
    default:
      break;
  }
  return steps;
}

export function buildRevealSteps(
  result: TreasureRollResult,
  dataset: TreasureDataset
): RevealStep[] {
  return [
    ...result.money.flatMap((m, i) => moneySteps(dataset, result.nd, m, i)),
    ...result.items.flatMap((it, i) => itemSteps(dataset, result.nd, it, i)),
  ];
}
