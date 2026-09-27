/**
 * Schema dos dados do gerador de tesouro (/recompensas).
 *
 * Dois conjuntos de dados usam este mesmo formato:
 * - `basic.generated.ts` — Tormenta20 Jogo do Ano, Capítulo 8 (Tabelas 8-1 a
 *   8-15), extraído de `livros/jda` por `scripts/treasure/extract-jda.mjs`;
 * - `supplements.generated.ts` — planilha "Geração de Tesouros em Tormenta20"
 *   (Guilherme Dei Svaldi), importada por
 *   `scripts/treasure/import-spreadsheet.mjs`.
 *
 * Os dois arquivos são GERADOS — a regra de jogo que as tabelas não
 * explicitam mora em `treasureDatasets.ts`, com citação da fonte.
 */

export type TreasureBook =
  | 'Tormenta20'
  | 'Ameaças de Arton'
  | 'Deuses de Arton'
  | 'Heróis de Arton';

export interface TreasureRange {
  min: number;
  max: number;
}

export interface TreasureEntry extends TreasureRange {
  /** Nome sem o marcador de nota de rodapé. */
  name: string;
  /** Texto exatamente como está na tabela (com marcador). */
  rawName: string;
  /**
   * Marcador de nota de rodapé. Planilha: `*`, `**`, `***`. Livro básico:
   * `1`, `2` (sobrescritos) ou `*`. O significado depende da tabela — ver
   * `markerRules` em `treasureDatasets.ts`.
   */
  marker?: string;
  book?: TreasureBook;
  page?: number;
  /** Preço em T$, quando a tabela traz. */
  price?: number;
  /** "Arma específica" / "Item específico": role na sub-tabela de específicos. */
  rollOnSpecificTable?: boolean;
}

export interface TreasureTable {
  rows: TreasureEntry[];
  /** Notas de rodapé da tabela, verbatim. */
  footnotes: string[];
}

/** `{n:1,sides:3,add:1}` = 1d3+1 ; `{n:2}` = 2 fixo. */
export interface DiceCount {
  n: number;
  sides?: number;
  add?: number;
}

export type WealthTier = 'menor' | 'media' | 'maior';
export type MagicTier = 'menor' | 'medio' | 'maior';
export type Currency = 'TC' | 'T$' | 'TO';

export type MoneyResult =
  | { kind: 'none' }
  | { kind: 'coins'; count: DiceCount; mult: number; currency: Currency }
  | { kind: 'riqueza'; count: DiceCount; tier: WealthTier; bonus: boolean };

export type ItemResult =
  | { kind: 'none' }
  | { kind: 'diverso' }
  | { kind: 'equipamento'; twoDice: boolean }
  | { kind: 'pocao'; count: DiceCount; bonus: boolean }
  | { kind: 'superior'; improvements: number; twoDice: boolean }
  | { kind: 'magico'; tier: MagicTier; twoDice: boolean };

export interface NdRow<R> extends TreasureRange {
  /** Texto da célula, verbatim. */
  label: string;
  result: R;
}

export interface NdTreasure {
  money: NdRow<MoneyResult>[];
  items: NdRow<ItemResult>[];
}

/** Rótulos de ND na ordem da tabela: '1/4', '1/2', '1' … '20'. */
export type NdLabel = string;

export interface NdTable {
  byNd: Record<NdLabel, NdTreasure>;
  /** Legenda (+%, 2D), verbatim. */
  notes: string[];
  /** Instruções em prosa que acompanham a tabela, verbatim. */
  instructions: string[];
}

export interface WealthExample {
  /** Ex.: "0,5 espaço" (planilha). Vazio no livro básico (espaço vem no texto). */
  spaces: string;
  text: string;
}

export interface WealthRow {
  menor: TreasureRange | null;
  media: TreasureRange | null;
  maior: TreasureRange | null;
  valueLabel: string;
  value: { n: number; sides: number; mult: number; average: number };
  examples: WealthExample[];
}

export interface WealthSpaceRow extends TreasureRange {
  spaces: string;
  description: string;
}

export interface WealthTable {
  values: WealthRow[];
  /** Tabela opcional de espaços (1d20). Só existe na planilha. */
  spaces: WealthSpaceRow[];
  notes: string[];
}

export interface TreasureTables {
  source: { title: string; credits: string; spreadsheetId?: string };
  /** Texto introdutório da fonte, verbatim (só planilha). */
  introduction?: string[];
  tesouroPorNd: NdTable;
  riquezas: WealthTable;
  itensDiversos: TreasureTable;
  equipamentos: {
    armas: TreasureTable;
    armaduras: TreasureTable;
    esotericos: TreasureTable;
  };
  pocoes: TreasureTable;
  superiores: {
    armas: TreasureTable;
    armaduras: TreasureTable;
    esotericos: TreasureTable;
  };
  magicos: {
    armas: TreasureTable;
    armasEspecificas: TreasureTable;
    armaduras: TreasureTable;
    armadurasEspecificas: TreasureTable;
    /** Só na planilha — o livro básico não tem esotéricos mágicos no sorteio. */
    esotericos?: TreasureTable;
    esotericosEspecificos?: TreasureTable;
  };
  acessorios: {
    menor: TreasureTable;
    medio: TreasureTable;
    maior: TreasureTable;
  };
}

export type TreasureSpreadsheetData = TreasureTables;
