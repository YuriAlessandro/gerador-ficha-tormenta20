/**
 * PV/PM atuais de uma ameaça controlados pela própria ficha (sem mesa
 * virtual). Mesmas regras da ficha de jogador (`Result.tsx`): dano consome o
 * temporário primeiro, PV desce até o piso de morte, cura acima do máximo vira
 * temporário.
 */

import type { ThreatSheet } from '../interfaces/ThreatSheet';
import { addPointsOverflowingToTemp } from './general';

export interface ThreatVitals {
  maxPV: number;
  currentPV: number;
  tempPV: number;
  maxPM: number;
  currentPM: number;
  tempPM: number;
  hasPM: boolean;
}

export function getThreatVitals(threat: ThreatSheet): ThreatVitals {
  const maxPV = threat.combatStats.hitPoints;
  const maxPM = threat.combatStats.manaPoints ?? 0;
  // Editar a ameaça pode baixar o máximo: o atual gravado não pode passar dele.
  return {
    maxPV,
    currentPV: Math.min(threat.currentPV ?? maxPV, maxPV),
    tempPV: threat.tempPV ?? 0,
    maxPM,
    currentPM: Math.min(threat.currentPM ?? maxPM, maxPM),
    tempPM: threat.tempPM ?? 0,
    hasPM: maxPM > 0,
  };
}

export function isThreatAtFullVitals(threat: ThreatSheet): boolean {
  const v = getThreatVitals(threat);
  return (
    v.currentPV === v.maxPV &&
    v.tempPV === 0 &&
    v.currentPM === v.maxPM &&
    v.tempPM === 0
  );
}

export function damageThreatPV(
  threat: ThreatSheet,
  amount: number
): ThreatSheet {
  const { maxPV, currentPV, tempPV } = getThreatVitals(threat);
  const tempConsumed = Math.min(tempPV, amount);
  const pvMinimo = Math.min(-10, -Math.floor(maxPV / 2));
  return {
    ...threat,
    tempPV: tempPV - tempConsumed,
    currentPV: Math.max(pvMinimo, currentPV - (amount - tempConsumed)),
  };
}

export function spendThreatPM(
  threat: ThreatSheet,
  amount: number
): ThreatSheet {
  const { currentPM, tempPM } = getThreatVitals(threat);
  const tempConsumed = Math.min(tempPM, amount);
  return {
    ...threat,
    tempPM: tempPM - tempConsumed,
    currentPM: Math.max(0, currentPM - (amount - tempConsumed)),
  };
}

export function healThreatPV(threat: ThreatSheet, amount: number): ThreatSheet {
  const { maxPV, currentPV, tempPV } = getThreatVitals(threat);
  const { current, temp } = addPointsOverflowingToTemp(
    amount,
    currentPV,
    maxPV,
    tempPV
  );
  return { ...threat, currentPV: current, tempPV: temp };
}

export function recoverThreatPM(
  threat: ThreatSheet,
  amount: number
): ThreatSheet {
  const { maxPM, currentPM, tempPM } = getThreatVitals(threat);
  const { current, temp } = addPointsOverflowingToTemp(
    amount,
    currentPM,
    maxPM,
    tempPM
  );
  return { ...threat, currentPM: current, tempPM: temp };
}

/** Volta a ameaça a "cheia" (campos ausentes = PV/PM máximos, sem temporário). */
export function restoreThreatVitals(threat: ThreatSheet): ThreatSheet {
  const restored = { ...threat };
  delete restored.currentPV;
  delete restored.tempPV;
  delete restored.currentPM;
  delete restored.tempPM;
  return restored;
}
