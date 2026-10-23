/**
 * Formas dos documentos do sistema Tormenta20 do Foundry VTT (1.6.x / v14) que
 * a exportação produz. O sistema preenche com o valor inicial todo campo que o
 * JSON não trouxer, então só tipamos o que escrevemos.
 */
export type FoundryValue =
  | string
  | number
  | boolean
  | null
  | FoundryValue[]
  | { [key: string]: FoundryValue };

export type FoundryData = { [key: string]: FoundryValue };

export type FoundryRollType = 'ataque' | 'dano' | 'formula';

export type FoundryRoll = {
  name: string;
  /** Único dentro do item: efeitos de uso casam rolagens por esta chave. */
  key: string;
  type: FoundryRollType;
  /** Cada parte é `[fórmula, tipo, origem]`. */
  parts: string[][];
  versatil: string;
  adaptavel: string;
};

export type FoundryChangeType =
  | 'add'
  | 'override'
  | 'custom'
  | 'multiply'
  | 'upgrade'
  | 'downgrade';

export interface FoundryEffectChange {
  key: string;
  value: string | number | boolean;
  type: FoundryChangeType;
  phase: string;
  priority: number | null;
}

export interface FoundryAbilityUse {
  description: string;
  automatic: boolean;
  /** Pode ser aplicado mais de uma vez no mesmo uso. */
  aumenta: boolean;
  /** Custo extra em PM. `null` = truque. */
  custo: number | null;
  names: string[];
  types: string[];
}

export interface FoundryEffect {
  /** Único entre TODOS os itens do ator (o diálogo de uso indexa por id). */
  _id: string;
  name: string;
  img: string;
  type: 'base';
  disabled: boolean;
  /** `true` = efeito do item aplicado ao ator dono; `false` = aplicado ao usar. */
  transfer: boolean;
  duration?: { expiry?: string | null };
  description: string;
  system: {
    changes: FoundryEffectChange[];
    onuse: boolean;
    abilityUse?: FoundryAbilityUse;
  };
  flags: FoundryData;
}

export interface FoundryItem {
  _id: string;
  name: string;
  type: string;
  img?: string;
  effects: FoundryEffect[];
  flags: FoundryData;
  system: FoundryData;
}

export interface FoundryStats {
  systemId: string;
  systemVersion: string;
}

export interface FoundryJSON {
  name: string;
  type: string;
  system: FoundryData;
  items: FoundryItem[];
  /** Efeitos do próprio ator (bônus cuja fonte não é um item exportado). */
  effects: FoundryEffect[];
  flags: FoundryData;
  _stats: FoundryStats;
}
