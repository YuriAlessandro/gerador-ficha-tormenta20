/**
 * Motor do gerador de tesouro (/recompensas), usado pelos dois modos.
 *
 * Tudo que vem das tabelas sai dos arquivos gerados em `src/data/treasure/`.
 * As regras que as tabelas não trazem saem de `treasureRules.ts`, com citação.
 * Onde nenhuma fonte decide, o motor não inventa: mantém o resultado e anexa
 * um aviso "verificar".
 *
 * Funções puras: o dado (`die`) e a consulta ao catálogo (`itemInfo`) são
 * injetados, para que os testes possam roteirizar cada rolagem.
 */
import {
  ItemKind,
  MarkerRules,
  TreasureDataset,
} from '@/data/treasure/treasureDatasets';
import {
  ARMOR_ENCHANTMENT_RULES,
  ARMOR_IMPROVEMENT_RULES,
  ATTRIBUTE_ORDER,
  ESOTERIC_ENCHANTMENT_RULES,
  ESOTERIC_IMPROVEMENT_RULES,
  EnhancementRule,
  GENERAL_RULES,
  PREDICATE_LABELS,
  UNRESOLVED_GAPS,
  WEAPON_ENCHANTMENT_RULES,
  WEAPON_IMPROVEMENT_RULES,
} from '@/data/treasure/treasureRules';
import type {
  DiceCount,
  ItemResult,
  MagicTier,
  MoneyResult,
  NdRow,
  TreasureEntry,
  TreasureRange,
  TreasureTable,
  WealthRow,
} from '@/data/treasure/types';
import { rollDice } from '../randomUtils';
import {
  ItemInfoResolver,
  TreasureItemInfo,
  catalogItemInfo,
} from './treasureItemInfo';

// ---------------------------------------------------------------------------
// Tipos do resultado
// ---------------------------------------------------------------------------

/** Um dado de N faces → resultado entre 1 e N. */
export type Die = (sides: number) => number;

export const defaultDie: Die = (sides) => rollDice(1, sides);

export interface TreasureContext {
  dataset: TreasureDataset;
  die: Die;
  itemInfo: ItemInfoResolver;
}

export const createTreasureContext = (
  dataset: TreasureDataset,
  die: Die = defaultDie,
  itemInfo: ItemInfoResolver = catalogItemInfo
): TreasureContext => ({ dataset, die, itemInfo });

export type TreasureMultiplier = 'Padrão' | 'Metade' | 'Dobro';

export interface CountRoll {
  /** Dados rolados (vazio para quantidade fixa). */
  rolls: number[];
  total: number;
}

export interface TableRoll {
  /** Valor rolado no d%. */
  roll: number;
  /** Valor usado na consulta (com +20 e teto, quando houver). */
  lookup: number;
  entry: TreasureEntry;
}

export interface RejectedRoll {
  roll: number;
  name: string;
  reason: string;
}

export interface EnhancementPick {
  roll: number;
  entry: TreasureEntry;
  slots: 1 | 2;
  /** Pré-requisito incluído pela regra "conta como dois e inclui o pré-requisito". */
  includes?: string;
  material?: { roll: number; name: string };
  notes: string[];
}

/** Uma rolagem na tabela de melhorias/encantos, na ordem em que aconteceu. */
export interface EnhancementAttempt {
  roll: number;
  entry: TreasureEntry;
  accepted: boolean;
  /** Motivo da rejeição (quando `accepted` é false). */
  reason?: string;
}

export interface EnhancementSet {
  /** Todas as rolagens, aceitas e rejeitadas, em ordem cronológica. */
  attempts: EnhancementAttempt[];
  picks: EnhancementPick[];
  rejected: RejectedRoll[];
  warnings: string[];
}

export interface WealthOutcome {
  roll: number;
  lookup: number;
  row: WealthRow;
  valueRolls: number[];
  value: number;
}

export type MoneyDetail =
  | { kind: 'none' }
  | {
      kind: 'coins';
      count: CountRoll;
      amount: number;
      /** Valor após "Metade" (só presente quando aplicado). */
      halved?: number;
      currency: string;
    }
  | { kind: 'riqueza'; count: CountRoll; wealth: WealthOutcome[] };

export interface MoneyOutcome {
  roll: number;
  row: NdRow<MoneyResult>;
  detail: MoneyDetail;
}

export interface PotionOutcome extends TableRoll {
  /** Poção de Orientação: atributo sorteado. */
  attribute?: { roll: number; name: string };
}

export type ItemDetail =
  | { kind: 'none' }
  | { kind: 'diverso'; item: TableRoll }
  | {
      kind: 'equipamento';
      typeRoll?: number;
      itemKind: ItemKind;
      item: TableRoll;
    }
  | { kind: 'pocao'; count: CountRoll; potions: PotionOutcome[] }
  | {
      kind: 'superior';
      typeRoll?: number;
      itemKind: ItemKind;
      item: TableRoll;
      improvements: EnhancementSet;
    }
  | {
      kind: 'magico';
      typeRoll?: number;
      itemKind: ItemKind;
      tier: MagicTier;
      base?: TableRoll;
      enchantments?: EnhancementSet;
      /** "Arma/Item/Esotérico específico": substitui os encantos. */
      specific?: TableRoll & { discarded: EnhancementPick[] };
      accessory?: TableRoll;
    };

/** Resultado "2D": dois tipos possíveis, o usuário escolhe. */
export interface TwoDiceChoice {
  dice: [number, number];
  options: [ItemKind, ItemKind];
}

export interface ItemOutcome {
  roll: number;
  row: NdRow<ItemResult>;
  detail?: ItemDetail;
  choice?: TwoDiceChoice;
}

export interface TreasureRollResult {
  nd: string;
  multiplier: TreasureMultiplier;
  money: MoneyOutcome[];
  items: ItemOutcome[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 100;

function inRange(r: TreasureRange, value: number): boolean {
  return value >= r.min && value <= r.max;
}

function lookup(table: TreasureTable, value: number): TreasureEntry {
  const entry = table.rows.find((r) => inRange(r, value));
  if (!entry) throw new Error(`Tabela sem faixa para ${value}`);
  return entry;
}

function rollTable(
  ctx: TreasureContext,
  table: TreasureTable,
  adjust?: (roll: number) => number
): TableRoll {
  const roll = ctx.die(100);
  const value = adjust ? adjust(roll) : roll;
  return { roll, lookup: value, entry: lookup(table, value) };
}

export function rollCount(ctx: TreasureContext, count: DiceCount): CountRoll {
  if (!count.sides) return { rolls: [], total: count.n + (count.add ?? 0) };
  const rolls = Array.from({ length: count.n }, () =>
    ctx.die(count.sides as number)
  );
  return {
    rolls,
    total: rolls.reduce((a, b) => a + b, 0) + (count.add ?? 0),
  };
}

/** Compara nomes de melhoria/encanto ignorando acento, caixa e gênero. */
export function sameEnhancement(a: string, b: string): boolean {
  const n = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\([^)]*\)/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(/[ao]s?$/, ''))
      .join(' ');
  return n(a) === n(b);
}

function findKind(ranges: TreasureDataset['equipmentType'], d6: number) {
  const r = ranges.ranges.find((x) => inRange(x, d6));
  if (!r) throw new Error(`1d6 sem tipo: ${d6}`);
  return r.kind;
}

/** Lista de materiais a partir da nota "Role 1d6 [...]: 1) aço-rubi, 2) ...". */
export function parseMaterialList(footnote: string): string[] {
  const list: string[] = [];
  [...footnote.matchAll(/(\d)\)\s*([^,.;]+)/g)].forEach((m) => {
    list[Number(m[1]) - 1] = m[2].trim();
  });
  return list;
}

const TOLLON_ITEMS = [
  'arco curto',
  'arco longo',
  'bordao',
  'clava',
  'lanca',
  'pique',
  'tacape',
  'escudo leve',
];

function checkPredicate(
  rule: EnhancementRule | undefined,
  info: TreasureItemInfo | undefined
): 'ok' | 'fails' | 'unknown' {
  if (!rule?.appliesTo) return 'ok';
  if (!info) return 'unknown';
  return info[rule.appliesTo.predicate] ? 'ok' : 'fails';
}

function hasEnhancement(picks: EnhancementPick[], name: string): boolean {
  return picks.some(
    (p) =>
      sameEnhancement(p.entry.name, name) ||
      (p.includes !== undefined && sameEnhancement(p.includes, name))
  );
}

function prerequisiteText(rule: EnhancementRule): string {
  const alts = rule.prerequisite?.anyOf ?? [];
  if (alts.includes('*')) return 'outra melhoria/encanto';
  return alts.join(' ou ');
}

/** Pré-requisitos não incluídos precisam estar no item ao final. */
function checkPrerequisites(
  set: EnhancementSet,
  rules: Record<string, EnhancementRule>
) {
  set.picks.forEach((p) => {
    const rule = rules[p.entry.name];
    // "Conta como dois" já foi tratado (incluído ou avisado) em applyDouble.
    if (!rule?.prerequisite || p.slots === 2) return;
    const { anyOf } = rule.prerequisite;
    const others = set.picks.filter((o) => o !== p);
    const ok = anyOf.includes('*')
      ? others.length > 0
      : anyOf.some((alt) => hasEnhancement(others, alt));
    if (!ok) {
      set.warnings.push(
        UNRESOLVED_GAPS.missingPrerequisite(
          p.entry.name,
          prerequisiteText(rule)
        )
      );
    }
  });
}

type RulesByKind = Record<
  'arma' | 'armadura' | 'esoterico',
  Record<string, EnhancementRule>
>;

const IMPROVEMENT_RULES: RulesByKind = {
  arma: WEAPON_IMPROVEMENT_RULES,
  armadura: ARMOR_IMPROVEMENT_RULES,
  esoterico: ESOTERIC_IMPROVEMENT_RULES,
};

const ENCHANTMENT_RULES: RulesByKind = {
  arma: WEAPON_ENCHANTMENT_RULES,
  armadura: ARMOR_ENCHANTMENT_RULES,
  esoterico: ESOTERIC_ENCHANTMENT_RULES,
};

const TABLE_KEY = {
  arma: 'armas',
  armadura: 'armaduras',
  esoterico: 'esotericos',
} as const;

/** Anexa o pré-requisito de um item "conta como dois". */
function applyDouble(
  pick: EnhancementPick,
  rule: EnhancementRule | undefined,
  includesPrerequisite: boolean,
  warnings: string[]
) {
  if (!rule?.prerequisite) {
    warnings.push(
      `${pick.entry.name} conta como dois, mas o pré-requisito não foi encontrado nos livros — verifique.`
    );
    return;
  }
  const text = prerequisiteText(rule);
  if (includesPrerequisite) {
    // eslint-disable-next-line no-param-reassign
    pick.includes = text;
  } else {
    warnings.push(
      `${pick.entry.name} conta como dois (pré-requisito: ${text}, ${rule.prerequisite.citation.source}). A tabela do livro básico não diz se o pré-requisito está incluído — verifique.`
    );
  }
}

// ---------------------------------------------------------------------------
// Melhorias (itens superiores)
// ---------------------------------------------------------------------------

export function rollImprovements(
  ctx: TreasureContext,
  kind: 'arma' | 'armadura' | 'esoterico',
  base: TreasureEntry,
  count: number
): EnhancementSet {
  const { dataset } = ctx;
  const table = dataset.tables.superiores[TABLE_KEY[kind]];
  const markers: MarkerRules = dataset.markers.superiores;
  const rules = IMPROVEMENT_RULES[kind];
  const info = ctx.itemInfo(base.name, kind);
  const set: EnhancementSet = {
    attempts: [],
    picks: [],
    rejected: [],
    warnings: [],
  };
  const reroll = dataset.rerollInapplicableImprovements;

  let slotsLeft = count;
  let tries = 0;
  while (slotsLeft > 0 && tries < MAX_ATTEMPTS) {
    tries += 1;
    const roll = ctx.die(100);
    const entry = lookup(table, roll);
    const marker = entry.marker ? markers[entry.marker] : undefined;
    const rule = rules[entry.name];
    const reject = (reason: string) => {
      set.rejected.push({ roll, name: entry.rawName, reason });
      set.attempts.push({ roll, entry, accepted: false, reason });
    };

    if (hasEnhancement(set.picks, entry.name)) {
      reject(`já está no item — ${GENERAL_RULES.improvementOncePerItem.quote}`);
    } else if (marker?.meaning.kind === 'double' && count < 2) {
      reject(marker.footnote);
    } else if (marker?.meaning.kind === 'double' && slotsLeft < 2) {
      reject(UNRESOLVED_GAPS.noSlotForDouble(entry.name));
    } else {
      const applies = checkPredicate(rule, info);
      const clash = rule?.exclusiveWith?.names.find((n) =>
        hasEnhancement(set.picks, n)
      );
      const what = rule?.appliesTo
        ? PREDICATE_LABELS[rule.appliesTo.predicate]
        : '';

      if ((applies === 'fails' || clash) && reroll) {
        reject(
          clash
            ? `${rule?.exclusiveWith?.citation.quote} ${reroll}`
            : `só se aplica a ${what}. ${reroll}`
        );
      } else {
        if (applies === 'fails')
          set.warnings.push(
            UNRESOLVED_GAPS.inapplicableNoReroll(entry.name, what)
          );
        if (applies === 'unknown')
          set.warnings.push(
            UNRESOLVED_GAPS.unknownItem(base.name, entry.name, what)
          );
        if (clash)
          set.warnings.push(UNRESOLVED_GAPS.exclusive(entry.name, clash));

        const double = marker?.meaning.kind === 'double';
        const pick: EnhancementPick = {
          roll,
          entry,
          slots: double ? 2 : 1,
          notes: [],
        };
        if (marker?.meaning.kind === 'double')
          applyDouble(
            pick,
            rule,
            marker.meaning.includesPrerequisite,
            set.warnings
          );
        if (marker?.meaning.kind === 'material') {
          const materials = parseMaterialList(marker.footnote);
          const mRoll = ctx.die(6);
          const name = materials[mRoll - 1];
          pick.material = { roll: mRoll, name };
          const baseName = base.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
          if (
            name.toLowerCase().includes('tollon') &&
            kind !== 'esoterico' &&
            !TOLLON_ITEMS.includes(baseName)
          )
            set.warnings.push(UNRESOLVED_GAPS.tollon(base.name));
        }
        if (rule?.warning) set.warnings.push(rule.warning);
        set.picks.push(pick);
        set.attempts.push({ roll, entry, accepted: true });
        slotsLeft -= pick.slots;
      }
    }
  }
  if (slotsLeft > 0) set.warnings.push(UNRESOLVED_GAPS.rerollLimit);
  checkPrerequisites(set, rules);
  return set;
}

// ---------------------------------------------------------------------------
// Encantos (itens mágicos)
// ---------------------------------------------------------------------------

const TIER_SLOTS: Record<MagicTier, number> = { menor: 1, medio: 2, maior: 3 };

function enchantmentMarkers(ds: TreasureDataset, kind: ItemKind): MarkerRules {
  if (kind === 'arma') return ds.markers.encantosArmas;
  if (kind === 'armadura') return ds.markers.encantosArmaduras;
  return ds.markers.encantosEsotericos;
}

function rollMagicItem(
  ctx: TreasureContext,
  kind: ItemKind,
  tier: MagicTier
): ItemDetail {
  const { tables } = ctx.dataset;
  if (kind === 'acessorio') {
    return {
      kind: 'magico',
      itemKind: kind,
      tier,
      accessory: rollTable(ctx, tables.acessorios[tier]),
    };
  }

  const baseTable = tables.equipamentos[TABLE_KEY[kind]];
  const MAGIC_TABLES = {
    arma: [tables.magicos.armas, tables.magicos.armasEspecificas],
    armadura: [tables.magicos.armaduras, tables.magicos.armadurasEspecificas],
    esoterico: [
      tables.magicos.esotericos,
      tables.magicos.esotericosEspecificos,
    ],
  } as const;
  const [enchTable, specificTable] = MAGIC_TABLES[kind];
  if (!enchTable || !specificTable)
    throw new Error(`Modo sem tabela de encantos para ${kind}`);

  const base = rollTable(ctx, baseTable);
  const info = ctx.itemInfo(base.entry.name, kind);
  const markers = enchantmentMarkers(ctx.dataset, kind);
  const rules = ENCHANTMENT_RULES[kind];
  const slots = TIER_SLOTS[tier];
  const set: EnhancementSet = {
    attempts: [],
    picks: [],
    rejected: [],
    warnings: [],
  };

  let slotsLeft = slots;
  let tries = 0;
  while (slotsLeft > 0 && tries < MAX_ATTEMPTS) {
    tries += 1;
    const roll = ctx.die(100);
    const entry = lookup(enchTable, roll);

    if (entry.rollOnSpecificTable) {
      set.attempts.push({ roll, entry, accepted: true });
      const specific = rollTable(ctx, specificTable);
      return {
        kind: 'magico',
        itemKind: kind,
        tier,
        base,
        enchantments: { ...set, picks: [] },
        specific: { ...specific, discarded: set.picks },
      };
    }

    const marker = entry.marker ? markers[entry.marker] : undefined;
    const meaning = marker?.meaning.kind;
    const rule = rules[entry.name];
    const reject = (reason: string) => {
      set.rejected.push({ roll, name: entry.rawName, reason });
      set.attempts.push({ roll, entry, accepted: false, reason });
    };

    if ((meaning === 'double' || meaning === 'minTwo') && slots < 2) {
      reject(marker?.footnote ?? '');
    } else if (meaning === 'double' && slotsLeft < 2) {
      reject(UNRESOLVED_GAPS.noSlotForDouble(entry.name));
    } else if (meaning === 'onlyArmor' && info?.shield) {
      reject(marker?.footnote ?? '');
    } else if (meaning === 'onlyShield' && info?.armor) {
      reject(marker?.footnote ?? '');
    } else {
      if ((meaning === 'onlyArmor' || meaning === 'onlyShield') && !info)
        set.warnings.push(
          UNRESOLVED_GAPS.unknownItem(
            base.entry.name,
            entry.name,
            meaning === 'onlyArmor' ? 'armaduras' : 'escudos'
          )
        );
      if (hasEnhancement(set.picks, entry.name))
        set.warnings.push(UNRESOLVED_GAPS.duplicateEnchantment);

      const applies = checkPredicate(rule, info);
      const what = rule?.appliesTo
        ? PREDICATE_LABELS[rule.appliesTo.predicate]
        : '';
      if (applies === 'fails')
        set.warnings.push(
          UNRESOLVED_GAPS.inapplicableNoReroll(entry.name, what)
        );
      if (applies === 'unknown')
        set.warnings.push(
          UNRESOLVED_GAPS.unknownItem(base.entry.name, entry.name, what)
        );
      const clash = rule?.exclusiveWith?.names.find((n) =>
        hasEnhancement(set.picks, n)
      );
      if (clash)
        set.warnings.push(UNRESOLVED_GAPS.exclusive(entry.name, clash));

      const pick: EnhancementPick = {
        roll,
        entry,
        slots: meaning === 'double' ? 2 : 1,
        notes: [],
      };
      if (marker?.meaning.kind === 'double')
        applyDouble(
          pick,
          rule,
          marker.meaning.includesPrerequisite,
          set.warnings
        );
      if (rule?.warning) set.warnings.push(rule.warning);
      set.picks.push(pick);
      set.attempts.push({ roll, entry, accepted: true });
      slotsLeft -= pick.slots;
    }
  }
  if (slotsLeft > 0) set.warnings.push(UNRESOLVED_GAPS.rerollLimit);
  checkPrerequisites(set, rules);
  return {
    kind: 'magico',
    itemKind: kind,
    tier,
    base,
    enchantments: set,
  };
}

// ---------------------------------------------------------------------------
// Coluna Itens
// ---------------------------------------------------------------------------

function rollPotions(
  ctx: TreasureContext,
  count: DiceCount,
  bonus: boolean
): ItemDetail {
  const { dataset } = ctx;
  const qty = rollCount(ctx, count);
  const potions: PotionOutcome[] = Array.from({ length: qty.total }, () => {
    const potion: PotionOutcome = rollTable(ctx, dataset.tables.pocoes, (r) =>
      bonus ? Math.min(r + 20, dataset.potionMax) : r
    );
    if (/role o atributo afetado/.test(potion.entry.name)) {
      const aRoll = ctx.die(6);
      potion.attribute = { roll: aRoll, name: ATTRIBUTE_ORDER[aRoll - 1] };
    }
    return potion;
  });
  return { kind: 'pocao', count: qty, potions };
}

/** Resolve um item cujo tipo (arma/armadura/...) já é conhecido. */
export function resolveItemOfKind(
  ctx: TreasureContext,
  result: ItemResult,
  itemKind: ItemKind,
  typeRoll?: number
): ItemDetail {
  const { tables } = ctx.dataset;
  if (result.kind === 'equipamento' || result.kind === 'superior') {
    if (itemKind === 'acessorio')
      throw new Error('Equipamento não é acessório');
    const item = rollTable(ctx, tables.equipamentos[TABLE_KEY[itemKind]]);
    if (result.kind === 'equipamento')
      return { kind: 'equipamento', typeRoll, itemKind, item };
    return {
      kind: 'superior',
      typeRoll,
      itemKind,
      item,
      improvements: rollImprovements(
        ctx,
        itemKind,
        item.entry,
        result.improvements
      ),
    };
  }
  if (result.kind === 'magico') {
    const detail = rollMagicItem(ctx, itemKind, result.tier);
    return detail.kind === 'magico' ? { ...detail, typeRoll } : detail;
  }
  throw new Error(`Resultado sem tipo de item: ${result.kind}`);
}

export function rollItemColumn(
  ctx: TreasureContext,
  row: NdRow<ItemResult>,
  roll: number
): ItemOutcome {
  const { result } = row;
  const { dataset } = ctx;
  switch (result.kind) {
    case 'none':
      return { roll, row, detail: { kind: 'none' } };
    case 'diverso':
      return {
        roll,
        row,
        detail: {
          kind: 'diverso',
          item: rollTable(ctx, dataset.tables.itensDiversos),
        },
      };
    case 'pocao':
      return {
        roll,
        row,
        detail: rollPotions(ctx, result.count, result.bonus),
      };
    default: {
      const mapping =
        result.kind === 'magico' ? dataset.magicType : dataset.equipmentType;
      if (result.twoDice) {
        const dice: [number, number] = [ctx.die(6), ctx.die(6)];
        const options: [ItemKind, ItemKind] = [
          findKind(mapping, dice[0]),
          findKind(mapping, dice[1]),
        ];
        // Mesmo tipo nos dois dados: não há o que escolher.
        if (options[0] === options[1])
          return {
            roll,
            row,
            choice: { dice, options },
            detail: resolveItemOfKind(ctx, result, options[0]),
          };
        return { roll, row, choice: { dice, options } };
      }
      const typeRoll = ctx.die(6);
      return {
        roll,
        row,
        detail: resolveItemOfKind(
          ctx,
          result,
          findKind(mapping, typeRoll),
          typeRoll
        ),
      };
    }
  }
}

/** Escolha do usuário num resultado "2D". */
export function chooseTwoDice(
  ctx: TreasureContext,
  outcome: ItemOutcome,
  kind: ItemKind
): ItemOutcome {
  if (!outcome.choice || !outcome.choice.options.includes(kind)) return outcome;
  return {
    ...outcome,
    detail: resolveItemOfKind(ctx, outcome.row.result, kind),
  };
}

// ---------------------------------------------------------------------------
// Coluna Dinheiro
// ---------------------------------------------------------------------------

function wealthRow(
  rows: WealthRow[],
  tier: 'menor' | 'media' | 'maior',
  value: number
): WealthRow {
  const row = rows.find((r) => {
    const range = r[tier];
    return range !== null && inRange(range, value);
  });
  if (!row) throw new Error(`Riqueza ${tier} sem faixa para ${value}`);
  return row;
}

export function rollMoneyColumn(
  ctx: TreasureContext,
  row: NdRow<MoneyResult>,
  roll: number,
  half: boolean
): MoneyOutcome {
  const { result } = row;
  if (result.kind === 'none') return { roll, row, detail: { kind: 'none' } };
  const count = rollCount(ctx, result.count);
  if (result.kind === 'coins') {
    const amount = count.total * result.mult;
    return {
      roll,
      row,
      detail: {
        kind: 'coins',
        count,
        amount,
        halved: half ? amount / 2 : undefined,
        currency: result.currency,
      },
    };
  }
  const wealth = Array.from({ length: count.total }, () => {
    const r = ctx.die(100);
    // +20%, com teto em 100 (Tabela 8-1 do JdA; a planilha é omissa).
    const value = result.bonus ? Math.min(r + 20, 100) : r;
    const w = wealthRow(ctx.dataset.tables.riquezas.values, result.tier, value);
    const valueRolls = Array.from({ length: w.value.n }, () =>
      ctx.die(w.value.sides)
    );
    return {
      roll: r,
      lookup: value,
      row: w,
      valueRolls,
      value: valueRolls.reduce((a, b) => a + b, 0) * w.value.mult,
    };
  });
  return { roll, row, detail: { kind: 'riqueza', count, wealth } };
}

// ---------------------------------------------------------------------------
// Entrada principal
// ---------------------------------------------------------------------------

export function rollTreasure(
  ctx: TreasureContext,
  nd: string,
  multiplier: TreasureMultiplier
): TreasureRollResult {
  const table = ctx.dataset.tables.tesouroPorNd.byNd[nd];
  if (!table) throw new Error(`ND desconhecido: ${nd}`);
  // "Dobro": role duas vezes em cada coluna.
  const times = multiplier === 'Dobro' ? 2 : 1;
  const money: MoneyOutcome[] = [];
  const items: ItemOutcome[] = [];
  for (let i = 0; i < times; i += 1) {
    const mRoll = ctx.die(100);
    const mRow = table.money.find((r) => inRange(r, mRoll));
    if (!mRow) throw new Error(`ND ${nd}: dinheiro sem faixa ${mRoll}`);
    money.push(rollMoneyColumn(ctx, mRow, mRoll, multiplier === 'Metade'));
  }
  for (let i = 0; i < times; i += 1) {
    const iRoll = ctx.die(100);
    const iRow = table.items.find((r) => inRange(r, iRoll));
    if (!iRow) throw new Error(`ND ${nd}: itens sem faixa ${iRoll}`);
    items.push(rollItemColumn(ctx, iRow, iRoll));
  }
  return { nd, multiplier, money, items };
}

export const ND_ORDER = [
  '1/4',
  '1/2',
  ...Array.from({ length: 20 }, (_, i) => String(i + 1)),
];
