/**
 * Regras do "uso" de uma habilidade/magia de ameaça que custa PM.
 *
 * Fica em código PÚBLICO e sem React de propósito: o `ThreatResult` é o
 * statblock compartilhado entre o gerador, o bestiário e a mesa virtual, e
 * ele não pode importar nada do submódulo premium (o stub OSS precisa
 * continuar compilando). O componente só renderiza o que estas funções
 * respondem; quem sabe gastar PM de verdade é o `EncounterContext`.
 */

import type { ThreatAbility } from '../interfaces/ThreatSheet';

export type ThreatPmSourceKind = 'ability' | 'spell';

/**
 * `pmCost` é gravado como `undefined` quando o custo é zero (ver a
 * normalização em `ThreatGenerator/steps/StepSpells.tsx`), então este é o
 * único predicado de "custa PM" — nunca leia `pmCost` direto.
 */
export function getThreatPmCost(source: ThreatAbility): number {
  return source.pmCost ?? 0;
}

export function isPmUsable(source: ThreatAbility): boolean {
  return getThreatPmCost(source) > 0;
}

/**
 * Prop única que o `ThreatViewDialog` passa ao `ThreatResult` quando há um
 * combatente identificado. Ausente = statblock sem gasto de PM (bestiário,
 * gerador, biblioteca da mesa, visão do jogador).
 */
export interface ThreatPmUsage {
  /** `participant.displayName` — "Goblin 2", não "Goblin". */
  casterName: string;
  currentMP: number;
  tempMP: number;
  maxMP: number;
  onUse: (
    source: ThreatAbility,
    kind: ThreatPmSourceKind,
    cost: number
  ) => void;
}

/** "9/12" ou "9/12 (+3 temp)". */
export function formatPmPool(usage: ThreatPmUsage): string {
  const base = `${usage.currentMP}/${usage.maxMP}`;
  return usage.tempMP > 0 ? `${base} (+${usage.tempMP} temp)` : base;
}

/** PM disponível para gastar: o pool temporário soma ao atual. */
export function getUsageAvailablePm(usage: ThreatPmUsage): number {
  return Math.max(0, usage.tempMP) + Math.max(0, usage.currentMP);
}

/**
 * Decide o bloqueio. Sem PM suficiente a ação é recusada por inteiro — nem
 * gasta nem rola (decisão de produto: o mestre tem os controles manuais de
 * PM do card se quiser narrar uma exceção).
 */
export function isPmUseBlocked(
  usage: ThreatPmUsage,
  source: ThreatAbility
): boolean {
  const cost = getThreatPmCost(source);
  if (cost <= 0) return false;
  return getUsageAvailablePm(usage) < cost;
}

export function pmUseTooltip(
  usage: ThreatPmUsage,
  source: ThreatAbility
): string {
  const cost = getThreatPmCost(source);
  if (cost <= 0) return `Rolar ${source.name}`;

  if (isPmUseBlocked(usage, source)) {
    return `PM insuficiente — ${source.name} custa ${cost} PM, ${
      getUsageAvailablePm(usage) === 1 ? 'resta' : 'restam'
    } ${getUsageAvailablePm(usage)}`;
  }

  return `Usar ${source.name} (gasta ${cost} PM)`;
}
