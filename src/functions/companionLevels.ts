import CharacterSheet from '@/interfaces/CharacterSheet';
import { getClassLevel } from './multiclass';
import {
  LEARNED_CLASS_ABILITY_LEVEL,
  hasLearnedClassAbility,
} from './learnedClassAbility';

export interface CompanionLevels {
  /** Nível de Treinador: truques, RD do Treino Intensivo, Treinamento Marcial */
  trainerLevel: number;
  /** Nível para PV (inclusive o +4/nível do Treino Intensivo), Defesa e perícias */
  statLevel: number;
}

type CompanionLevelSheet = Pick<
  CharacterSheet,
  'nivel' | 'classLevels' | 'classPowers' | 'classe' | 'sheetActionHistory'
>;

/**
 * Níveis REAIS de Treinador. Não usa `getClassLevel` direto: numa ficha
 * mono-classe ele devolve o nível total para qualquer classe perguntada.
 */
export function getRealTrainerLevel(sheet: CompanionLevelSheet): number {
  const isTreinador =
    sheet.classe?.name === 'Treinador' ||
    (sheet.classLevels ?? []).some((cl) => cl.className === 'Treinador');
  return isTreinador ? getClassLevel(sheet as CharacterSheet, 'Treinador') : 0;
}

/** Melhor Amigo aprendido por outra classe (origem "Duplo Feérico"). */
export function hasLearnedBestFriend(sheet: CompanionLevelSheet): boolean {
  return hasLearnedClassAbility(sheet, 'Melhor Amigo', 'Treinador');
}

/** A ficha tem a habilidade Melhor Amigo — pela classe ou aprendida. */
export function hasBestFriendAbility(sheet: CompanionLevelSheet): boolean {
  return getRealTrainerLevel(sheet) > 0 || hasLearnedBestFriend(sheet);
}

/**
 * Níveis que regem o melhor amigo. Com o poder Treinador Eclético, PV, Defesa
 * e perícias usam o nível de personagem em vez do nível de Treinador. Melhor
 * Amigo aprendido sem níveis de Treinador funciona como Treinador de 1º nível.
 */
export function getCompanionLevels(
  sheet: CompanionLevelSheet
): CompanionLevels {
  const realLevel = getRealTrainerLevel(sheet);
  let trainerLevel = realLevel;
  if (!trainerLevel) {
    trainerLevel = hasLearnedBestFriend(sheet)
      ? LEARNED_CLASS_ABILITY_LEVEL
      : sheet.nivel;
  }
  const hasEclectic = !!sheet.classPowers?.some(
    (power) => power.name === 'Treinador Eclético'
  );
  return {
    trainerLevel,
    statLevel: hasEclectic ? sheet.nivel : trainerLevel,
  };
}
