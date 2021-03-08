import { Race } from '../interfaces/CharacterSheet';
import nomes from '../utils/nomes';

export function getRandomItemFromArray<ElementType>(
  array: ElementType[]
): ElementType {
  return array[Math.floor(Math.random() * array.length)];
}
export function generateRandomName(raca: Race, sexo: string): string {
  if (raca.getName) {
    return raca.getName(sexo);
  }

  const possibleNames = nomes[raca.name][sexo] as string[];

  return getRandomItemFromArray<string>(possibleNames);
}
