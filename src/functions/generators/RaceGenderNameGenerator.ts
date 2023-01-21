import CustomizableCharacterSheet from '../../model/CustomizableCharacterSheet';
import { getRandomItemFromArray } from '../randomUtils';
import RACES from '../../data/races';
import { generateRandomName } from '../../data/nomes';

export class RaceGenderNameGenerator {
  static generateRaceGenderName(
    characterSheet: CustomizableCharacterSheet
  ): CustomizableCharacterSheet {
    const sheet = characterSheet;

    // Generating race
    if (!characterSheet.race) {
      const RaceClass = getRandomItemFromArray(RACES);
      sheet.race = new RaceClass();
    }

    // Generating gender
    if (!characterSheet.gender) {
      const sexos = ['Masculino', 'Feminino'] as ('Masculino' | 'Feminino')[];
      sheet.gender = getRandomItemFromArray<'Masculino' | 'Feminino'>(sexos);
    }

    // Generating name
    if (!characterSheet.name) {
      if (sheet.race && sheet.gender) {
        sheet.name = generateRandomName(sheet.race, sheet.gender);
      }
    }

    return sheet;
  }
}
