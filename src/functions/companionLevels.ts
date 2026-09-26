import CharacterSheet from '@/interfaces/CharacterSheet';
import { getClassLevel } from './multiclass';

export interface CompanionLevels {
  /** Nível de Treinador: truques, RD do Treino Intensivo, Treinamento Marcial */
  trainerLevel: number;
  /** Nível para PV (inclusive o +4/nível do Treino Intensivo), Defesa e perícias */
  statLevel: number;
}

/**
 * Níveis que regem o melhor amigo. Com o poder Treinador Eclético, PV, Defesa
 * e perícias usam o nível de personagem em vez do nível de Treinador.
 */
export function getCompanionLevels(
  sheet: Pick<CharacterSheet, 'nivel' | 'classLevels' | 'classPowers'>
): CompanionLevels {
  const trainerLevel =
    getClassLevel(sheet as CharacterSheet, 'Treinador') || sheet.nivel;
  const hasEclectic = !!sheet.classPowers?.some(
    (power) => power.name === 'Treinador Eclético'
  );
  return {
    trainerLevel,
    statLevel: hasEclectic ? sheet.nivel : trainerLevel,
  };
}
