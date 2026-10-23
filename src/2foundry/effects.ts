import { foundryId, textToHtml } from './normalize';
import { FoundryEffect, FoundryEffectChange, FoundryValue } from './types';

/**
 * Efeitos no formato do sistema 1.6 (Foundry v14): os metadados de uso vivem em
 * `effect.system` — o sistema ignora o formato antigo (`flags.tormenta20.onuse`,
 * `changes` no topo com `mode` numérico) e NÃO migra documentos importados.
 */
export function buildChange(
  key: string,
  value: string | number,
  type: FoundryEffectChange['type']
): FoundryEffectChange {
  return { key, value, type, phase: 'initial', priority: null };
}

interface OnUseEffectInput {
  /** Nome do item dono do efeito — é o que o sistema usa como nome do efeito. */
  itemName: string;
  /** Texto do aprimoramento, mostrado no diálogo de uso. */
  text: string;
  /** Custo extra em PM; `null` = truque. */
  cost: number | null;
  repeatable: boolean;
  changes: FoundryEffectChange[];
  /**
   * Em que usos o efeito é oferecido. Padrão `['self']`: só no uso do próprio
   * item (aprimoramento de magia). `'attack'` = ataques com qualquer arma.
   */
  types?: string[];
}

/**
 * Efeito de uso — por padrão o aprimoramento de uma magia (`types: ['self']`),
 * desligado até o jogador marcá-lo no diálogo de conjuração.
 */
export function buildOnUseEffect(input: OnUseEffectInput): FoundryEffect {
  return {
    _id: foundryId(),
    name: input.itemName,
    img: 'icons/svg/upgrade.svg',
    type: 'base',
    disabled: true,
    transfer: false,
    description: textToHtml(input.text),
    system: {
      changes: input.changes,
      onuse: true,
      abilityUse: {
        description: '',
        automatic: false,
        aumenta: input.repeatable,
        custo: input.cost,
        names: [],
        types: input.types ?? ['self'],
      },
    },
    flags: { tormenta20: {} },
  };
}

export function isRecord(
  value: FoundryValue | undefined
): value is { [key: string]: FoundryValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Efeito passivo: sempre ligado, aplicando bônus fixos ao ator. Num item,
 * `transfer` é o que faz o Foundry aplicá-lo ao dono; num efeito do próprio
 * ator o campo não tem papel.
 */
export function buildPassiveEffect(
  name: string,
  changes: FoundryEffectChange[],
  onItem: boolean
): FoundryEffect {
  return {
    _id: foundryId(),
    name,
    img: 'icons/svg/aura.svg',
    type: 'base',
    disabled: false,
    transfer: onItem,
    description: '',
    system: { changes, onuse: false },
    flags: { tormenta20: {} },
  };
}
