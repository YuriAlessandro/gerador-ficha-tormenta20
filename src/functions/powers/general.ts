import { Atributo } from '@/data/systems/tormenta20/atributos';
import CharacterSheet from '@/interfaces/CharacterSheet';

export function getPlateauByLevel(nivel: number): number {
  if (nivel <= 4) {
    return 1;
  }
  if (nivel <= 10) {
    return 2;
  }
  if (nivel <= 16) {
    return 3;
  }

  return 4;
}

export function getCurrentPlateau(sheet: CharacterSheet): number {
  return getPlateauByLevel(sheet.nivel);
}

/**
 * Limite de PM concedido pela Tradição Perdida: 6 pontos de atributo, +2 por
 * patamar acima de iniciante (6 / 8 / 10 / 12).
 */
export function getTradicaoPerdidaPmCap(nivel: number): number {
  return 6 + 2 * (getPlateauByLevel(nivel) - 1);
}

/**
 * Valor de PM que a Tradição Perdida contribui, substituindo a contribuição do
 * atributo-chave da classe (habilidade "Magias"). Usa o valor permanente do
 * atributo escolhido (aumentos temporários não mutam `atributos[attr].value`,
 * então já são excluídos), limitado por `getTradicaoPerdidaPmCap`. Retorna
 * `null` quando o poder não está configurado (aí a contribuição normal vale).
 */
export function getTradicaoPerdidaPmValue(
  sheet: CharacterSheet
): number | null {
  const attr = sheet.tradicaoPerdidaPmAttribute;
  if (!attr) return null;
  const attrValue = sheet.atributos[attr]?.value ?? 0;
  return Math.min(attrValue, getTradicaoPerdidaPmCap(sheet.nivel));
}

export function getAttributeIncreasesInSamePlateau(
  sheet: CharacterSheet
): Atributo[] {
  const plateau = getCurrentPlateau(sheet);

  const attibutesIncreasedInSamePlateau: Atributo[] = [];
  sheet.sheetActionHistory.forEach((sah) => {
    sah.changes.forEach((change) => {
      if (
        change.type === 'AttributeIncreasedByAumentoDeAtributo' &&
        change.plateau === plateau
      ) {
        attibutesIncreasedInSamePlateau.push(change.attribute);
      }
    });
  });

  return attibutesIncreasedInSamePlateau;
}
