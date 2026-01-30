import { DiceRoll } from './DiceRoll';

export interface CustomPower {
  id: string; // UUID para identificação única
  name: string; // Nome do poder (definido pelo usuário)
  description: string; // Descrição do poder
  rolls?: DiceRoll[]; // Rolagens opcionais (ex: "Dano" - "2d6+3")
}
