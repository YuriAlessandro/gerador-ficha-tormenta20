/* eslint-disable class-methods-use-this */
import Validator, { ValidationResult } from '../../interfaces/Validator';
import CustomizableCharacterSheet from '../../model/CustomizableCharacterSheet';

export class RaceGenderNameValidator extends Validator {
  public validate(sheet: CustomizableCharacterSheet): ValidationResult {
    const warnings = [];
    const steps = [];

    if (sheet.name) {
      steps.push(`Nome: ${sheet.name}`);
    } else {
      warnings.push('Nenhum nome escolhido');
    }

    if (sheet.race) {
      steps.push(
        `Raça: ${sheet.race.name}${
          sheet.race.oldRace ? ` (${sheet.race.oldRace.name})` : ''
        }`
      );
    } else {
      warnings.push('Nenhuma raça definida');
    }

    if (sheet.gender) {
      steps.push(`Gênero: ${sheet.gender}`);
    } else {
      warnings.push(`Gênero não definido`);
    }

    return {
      warnings,
      steps,
    };
  }
}
