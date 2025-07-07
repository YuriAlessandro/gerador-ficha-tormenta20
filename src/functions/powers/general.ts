import { Atributo } from '@/data/atributos';
import CharacterSheet from '@/interfaces/CharacterSheet';

export function getCurrentPlateau(sheet: CharacterSheet): number {
  if (sheet.nivel <= 4) {
    return 1;
  }
  if (sheet.nivel <= 10) {
    return 2;
  }
  if (sheet.nivel <= 16) {
    return 3;
  }

  return 4;
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
