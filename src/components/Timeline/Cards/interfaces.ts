import CharacterSheet from '../../../interfaces/CharacterSheet';

export interface CardInterface {
  sheet: CharacterSheet;
  onContinue: (newStep: number, newSheet: CharacterSheet) => void;
}
