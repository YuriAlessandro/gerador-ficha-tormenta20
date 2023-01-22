import CustomizableCharacterSheet from '../model/CustomizableCharacterSheet';

export default abstract class Generator {
  public abstract generate(
    sheet: CustomizableCharacterSheet
  ): CustomizableCharacterSheet;
}
