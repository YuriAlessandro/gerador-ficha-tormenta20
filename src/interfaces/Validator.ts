import CustomizableCharacterSheet from '../model/CustomizableCharacterSheet';

export type ValidationResult = {
  warnings: string[];
  steps: string[];
};

export default abstract class Validator {
  public abstract validate(sheet: CustomizableCharacterSheet): ValidationResult;
}
