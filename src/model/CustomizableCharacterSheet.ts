import Race from '../interfaces/Race';

export default class CustomizableCharacterSheet {
  public name = '';

  public gender?: 'Masculino' | 'Feminino';

  public race?: Race;

  // public calcDefense(): number {
  //   return 10;
  // }
}
