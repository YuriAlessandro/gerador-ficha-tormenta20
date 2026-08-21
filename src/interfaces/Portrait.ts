/**
 * Portrait — overlay de ficha para streams.
 *
 * Contratos de dados do overlay embutível no OBS (`/portrait/:token`).
 *
 * Este módulo é PÚBLICO de propósito, e não parte de `src/premium/`: tanto a
 * entrada do app (`src/index.tsx`) quanto o código premium precisam dos tipos,
 * e um módulo público não exige stub em `src/premium-stub/`. Mesmo motivo pelo
 * qual `src/types/featureFlags.types.ts` e `src/functions/owlbearEmbedBridge.ts`
 * moram fora do submódulo.
 *
 * O `PortraitSnapshot` é a ÚNICA forma da ficha que trafega no endpoint
 * público. Ele é uma projeção deliberadamente pobre — ver
 * `backend/src/services/portraitService.ts`.
 */

/* -------------------------------------------------------------------------- */
/* Config — o que o dono escolhe                                              */
/* -------------------------------------------------------------------------- */

/**
 * Reflow da MESMA peça, não três desenhos:
 *  - `horizontal`: retrato à esquerda, barras à direita;
 *  - `vertical`: retrato em cima, barras embaixo (colunas laterais estreitas);
 *  - `compact`: só barras e números, sem retrato nem linha secundária.
 */
export type PortraitOrientation = 'horizontal' | 'vertical' | 'compact';

export type PortraitAlignment =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Blocos que o dono liga e desliga. Todos existem na v1. */
export interface PortraitBlocks {
  /** Retrato, nome, nível, raça e classe. */
  identity: boolean;
  /** Barras de PV/PM, PV temporário e Defesa. */
  vitals: boolean;
  /** Painel da última rolagem, que desliza e some após `rollTtlSeconds`. */
  rolls: boolean;
  /** Chips de condições e efeitos ativos. */
  conditions: boolean;
}

export interface PortraitAppearance {
  theme: 'dark' | 'light';
  /** Cor de destaque, `#RRGGBB`. Default = `#d13235` (accent "Tormenta 20"). */
  accent: string;
  orientation: PortraitOrientation;
  alignment: PortraitAlignment;
  /**
   * Fundo transparente é o caso normal (Browser Source do OBS compõe com alfa).
   * Quando `false`, pinta-se APENAS o cartão com `background` — nunca o `body`,
   * senão o overlay vira um retângulo opaco cobrindo a cena.
   */
  transparent: boolean;
  /** Usado só quando `transparent === false`. */
  background: string;
  /** `transform: scale` na peça inteira. Clampado em [0.5, 2]. */
  scale: number;
  /** Quanto tempo o painel de rolagem fica em cena. Clampado em [3, 30]. */
  rollTtlSeconds: number;
  showPortraitImage: boolean;
  /** `false` deixa só as barras, sem "34/48". */
  showNumbers: boolean;
  showDefense: boolean;
}

export interface PortraitConfig {
  /** O config é gravado num campo Mixed; a versão é o que permite migrar. */
  version: 1;
  blocks: PortraitBlocks;
  appearance: PortraitAppearance;
}

/* -------------------------------------------------------------------------- */
/* Snapshot — o que trafega no canal público                                  */
/* -------------------------------------------------------------------------- */

export interface PortraitVitals {
  currentPV: number;
  maxPV: number;
  /**
   * Reserva empilhada POR CIMA dos PV totais, nunca somada ao máximo — mesma
   * regra de `src/premium/functions/pvState.ts`.
   */
  tempPV: number;
  currentPM: number;
  maxPM: number;
  tempPM: number;
  defense: number;
}

export interface PortraitIdentity {
  name: string;
  level: number;
  raceName?: string;
  /** Já formatado pelo backend (subname / multiclasse resolvidos). */
  className?: string;
  /**
   * Só vem no snapshot inicial ou quando `imageRev` mudou. `imageUrl` pode ser
   * um data-URI de megabytes, e ele não pode viajar a cada ponto de dano.
   */
  imageUrl?: string;
  imageRev?: number;
}

/**
 * Só o id: o rótulo e o ícone são resolvidos no cliente pelos dados de
 * condições do premium. Mandar o rótulo pronto engordaria o snapshot e
 * congelaria a tradução no servidor.
 */
export interface PortraitCondition {
  id: string;
}

export interface PortraitEffect {
  /** `ActiveEffect.instanceId`. */
  key: string;
  name: string;
  /** `ActiveEffect.optionLabel` — ex.: "+2 em perícias". */
  detail?: string;
}

export interface PortraitSnapshot {
  /**
   * Monotônico por ficha. O cliente descarta snapshot com `rev` menor que o
   * exibido: SSE não garante ordem entre uma reconexão e o stream anterior.
   */
  rev: number;
  identity: PortraitIdentity;
  vitals: PortraitVitals;
  conditions: PortraitCondition[];
  effects: PortraitEffect[];
}

/* -------------------------------------------------------------------------- */
/* Rolagem                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Subconjunto DELIBERADO de `RollGroup` (`src/premium/services/socket.service.ts`).
 *
 * Não reusar aquele tipo: ele mora no premium (a página pública não importaria
 * sem stub) e carrega `ability`, `damageType` e `criticalThreshold` — metadado
 * de mesa que não tem o que fazer num overlay público.
 */
export interface PortraitRollGroup {
  label: string;
  diceNotation: string;
  rolls: number[];
  modifier: number;
  total: number;
  isCritical?: boolean;
  isFumble?: boolean;
  isSummary?: boolean;
}

export interface PortraitRoll {
  /** uuid gerado pelo emissor, para dedupe. */
  id: string;
  /** `Date.now()` do emissor. O cliente descarta rolagem mais velha que a exibida. */
  at: number;
  label: string;
  characterName?: string;
  groups: PortraitRollGroup[];
}

/* -------------------------------------------------------------------------- */
/* Defaults e saneamento                                                      */
/* -------------------------------------------------------------------------- */

export const PORTRAIT_ORIENTATIONS: PortraitOrientation[] = [
  'horizontal',
  'vertical',
  'compact',
];

export const PORTRAIT_ALIGNMENTS: PortraitAlignment[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/** Cor de destaque padrão — accent `red`, "Tormenta 20" (`src/theme/accentColors.ts`). */
export const PORTRAIT_DEFAULT_ACCENT = '#d13235';

export const DEFAULT_PORTRAIT_CONFIG: PortraitConfig = {
  version: 1,
  blocks: {
    identity: true,
    vitals: true,
    rolls: true,
    conditions: true,
  },
  appearance: {
    theme: 'dark',
    accent: PORTRAIT_DEFAULT_ACCENT,
    orientation: 'horizontal',
    alignment: 'top-left',
    transparent: true,
    background: '#212121',
    scale: 1,
    rollTtlSeconds: 8,
    showPortraitImage: true,
    showNumbers: true,
    showDefense: true,
  },
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Normaliza um config vindo de fora (corpo de request, blob Mixed antigo)
 * para uma `PortraitConfig` completa e válida.
 *
 * Roda nos DOIS lados: aqui, antes de mandar; e no backend, antes de gravar
 * (`backend/src/utils/portraitConfig.ts`, que espelha este arquivo). Um dos dois
 * sozinho não basta — o cliente não é autoridade e o servidor precisa devolver
 * algo renderizável para um overlay que não tem como se defender.
 */
export function sanitizePortraitConfig(raw: unknown): PortraitConfig {
  const input = (raw ?? {}) as Partial<PortraitConfig>;
  const blocks = (input.blocks ?? {}) as Partial<PortraitBlocks>;
  const appearance = (input.appearance ?? {}) as Partial<PortraitAppearance>;
  const d = DEFAULT_PORTRAIT_CONFIG;

  return {
    version: 1,
    blocks: {
      identity: bool(blocks.identity, d.blocks.identity),
      vitals: bool(blocks.vitals, d.blocks.vitals),
      rolls: bool(blocks.rolls, d.blocks.rolls),
      conditions: bool(blocks.conditions, d.blocks.conditions),
    },
    appearance: {
      theme: oneOf(appearance.theme, ['dark', 'light'], d.appearance.theme),
      accent: color(appearance.accent, d.appearance.accent),
      orientation: oneOf(
        appearance.orientation,
        PORTRAIT_ORIENTATIONS,
        d.appearance.orientation
      ),
      alignment: oneOf(
        appearance.alignment,
        PORTRAIT_ALIGNMENTS,
        d.appearance.alignment
      ),
      transparent: bool(appearance.transparent, d.appearance.transparent),
      background: color(appearance.background, d.appearance.background),
      scale: clamp(appearance.scale, 0.5, 2, d.appearance.scale),
      rollTtlSeconds: clamp(
        appearance.rollTtlSeconds,
        3,
        30,
        d.appearance.rollTtlSeconds
      ),
      showPortraitImage: bool(
        appearance.showPortraitImage,
        d.appearance.showPortraitImage
      ),
      showNumbers: bool(appearance.showNumbers, d.appearance.showNumbers),
      showDefense: bool(appearance.showDefense, d.appearance.showDefense),
    },
  };
}
