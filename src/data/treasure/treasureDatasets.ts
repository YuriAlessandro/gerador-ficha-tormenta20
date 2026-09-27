/**
 * Os dois modos do gerador de tesouro, montados sobre as tabelas GERADAS.
 *
 * O que está aqui é só a "cola" que as tabelas trazem em prosa — o significado
 * de cada marcador de rodapé e o mapeamento do 1d6 de tipo. Cada item aponta
 * o texto de origem, e `treasureDatasets.spec.ts` confere que esse texto está
 * de fato nas notas/instruções importadas.
 */
import BASIC_BOOK_TABLES from './basic.generated';
import SUPPLEMENTS_SPREADSHEET from './supplements.generated';
import type { TreasureTables } from './types';

export type TreasureMode = 'basic' | 'supplements';

export type ItemKind = 'arma' | 'armadura' | 'esoterico' | 'acessorio';

/** O que um marcador de rodapé significa numa tabela específica. */
export type MarkerMeaning =
  /** Conta como dois; reroll se o item só tiver um espaço. */
  | { kind: 'double'; includesPrerequisite: boolean }
  /** Role 1d6 para o material. */
  | { kind: 'material' }
  /** Só para armaduras (reroll em escudos). */
  | { kind: 'onlyArmor' }
  /** Só para escudos (reroll em armaduras). */
  | { kind: 'onlyShield' }
  /** Só para itens com pelo menos dois encantos. */
  | { kind: 'minTwo' };

export interface MarkerRule {
  meaning: MarkerMeaning;
  /** Nota de rodapé que define o marcador (verbatim da fonte). */
  footnote: string;
}

export type MarkerRules = Record<string, MarkerRule>;

/** Faixa do 1d6 → tipo, com o texto que a define. */
export interface D6Mapping {
  ranges: { min: number; max: number; kind: ItemKind }[];
  /** Trecho da fonte que define o mapeamento (verbatim). */
  sourceText: string;
}

export interface TreasureDataset {
  mode: TreasureMode;
  label: string;
  tables: TreasureTables;
  equipmentType: D6Mapping;
  magicType: D6Mapping;
  markers: {
    superiores: MarkerRules;
    encantosArmas: MarkerRules;
    encantosArmaduras: MarkerRules;
    encantosEsotericos: MarkerRules;
  };
  /**
   * Maior valor da tabela de poções. No livro básico ela vai até 100 e o +%
   * é limitado a 100 ("Resultados acima de 100% contam como 100%"). Na
   * planilha ela vai até 120 — as faixas 101-120 existem justamente para o +%.
   */
  potionMax: number;
  /**
   * Se a fonte manda rolar novamente uma melhoria que não se aplica ao item.
   * Só a planilha diz isso ("Se rolar uma melhoria que não se aplique ao item
   * em questão [...], role novamente."). No livro básico o gerador só avisa.
   */
  rerollInapplicableImprovements: string | null;
  /** Mostra livro/página de cada item (só a planilha tem). */
  showBooks: boolean;
}

// ---------------------------------------------------------------------------
// Livro básico (Tormenta20 JdA)
// ---------------------------------------------------------------------------

const jda = BASIC_BOOK_TABLES;
const jdaInstructions = jda.tesouroPorNd.instructions.join(' ');

const BASIC: TreasureDataset = {
  mode: 'basic',
  label: 'Livro básico',
  tables: jda,
  equipmentType: {
    ranges: [
      { min: 1, max: 3, kind: 'arma' },
      { min: 4, max: 5, kind: 'armadura' },
      { min: 6, max: 6, kind: 'esoterico' },
    ],
    sourceText:
      'Role 1d6 para determinar o tipo de equipamento: 1–3), arma; 4–5) armadura ou escudo; 6) esotérico.',
  },
  magicType: {
    ranges: [
      { min: 1, max: 2, kind: 'arma' },
      { min: 3, max: 3, kind: 'armadura' },
      { min: 4, max: 6, kind: 'acessorio' },
    ],
    sourceText:
      'Role 1d6 para determinar o tipo de item: 1–2) arma (página 336); 3) armadura/escudo (página 339); 4–6) acessório (página 342).',
  },
  markers: {
    superiores: {
      '1': {
        meaning: { kind: 'double', includesPrerequisite: false },
        footnote: jda.superiores.armas.footnotes[0],
      },
      '2': {
        meaning: { kind: 'material' },
        footnote: jda.superiores.armas.footnotes[1],
      },
    },
    encantosArmas: {
      '*': {
        meaning: { kind: 'double', includesPrerequisite: false },
        footnote: jda.magicos.armas.footnotes[0],
      },
    },
    encantosArmaduras: {
      '1': {
        meaning: { kind: 'onlyShield' },
        footnote: jda.magicos.armaduras.footnotes[0],
      },
      '2': {
        meaning: { kind: 'double', includesPrerequisite: false },
        footnote: jda.magicos.armaduras.footnotes[1],
      },
    },
    encantosEsotericos: {},
  },
  potionMax: 100,
  rerollInapplicableImprovements: null,
  showBooks: false,
};

// ---------------------------------------------------------------------------
// Suplementos (planilha de Guilherme Dei Svaldi)
// ---------------------------------------------------------------------------

const sheet = SUPPLEMENTS_SPREADSHEET;
const supFootnotes = sheet.superiores.armas.footnotes;
const magArmorNotes = sheet.magicos.armaduras.footnotes;

const SUPPLEMENTS: TreasureDataset = {
  mode: 'supplements',
  label: 'Todos os suplementos',
  tables: sheet,
  equipmentType: {
    ranges: [
      { min: 1, max: 3, kind: 'arma' },
      { min: 4, max: 5, kind: 'armadura' },
      { min: 6, max: 6, kind: 'esoterico' },
    ],
    sourceText: '1-3) arma; 4-5) armadura; 6) esotérico.',
  },
  magicType: {
    ranges: [
      { min: 1, max: 2, kind: 'arma' },
      { min: 3, max: 3, kind: 'armadura' },
      { min: 4, max: 4, kind: 'esoterico' },
      { min: 5, max: 6, kind: 'acessorio' },
    ],
    sourceText: '1-2) arma; 3) armadura; 4) esotérico; 5-6) acessório.',
  },
  markers: {
    superiores: {
      '*': {
        meaning: { kind: 'double', includesPrerequisite: true },
        footnote: supFootnotes[1],
      },
      '**': { meaning: { kind: 'material' }, footnote: supFootnotes[2] },
    },
    encantosArmas: {
      '*': {
        meaning: { kind: 'double', includesPrerequisite: true },
        footnote: sheet.magicos.armas.footnotes.join(' '),
      },
    },
    encantosArmaduras: {
      '*': { meaning: { kind: 'onlyArmor' }, footnote: magArmorNotes[0] },
      '**': { meaning: { kind: 'onlyShield' }, footnote: magArmorNotes[1] },
      '***': {
        meaning: { kind: 'double', includesPrerequisite: true },
        footnote: `${magArmorNotes[2]} ${magArmorNotes[3]}`,
      },
    },
    encantosEsotericos: {
      '*': {
        meaning: { kind: 'minTwo' },
        footnote: sheet.magicos.esotericos?.footnotes[0] ?? '',
      },
    },
  },
  potionMax: 120,
  rerollInapplicableImprovements: supFootnotes[0],
  showBooks: true,
};

export const TREASURE_DATASETS: Record<TreasureMode, TreasureDataset> = {
  basic: BASIC,
  supplements: SUPPLEMENTS,
};

/** Instruções em prosa do livro básico (usadas nos testes de rastreabilidade). */
export const BASIC_INSTRUCTIONS_TEXT = jdaInstructions;
