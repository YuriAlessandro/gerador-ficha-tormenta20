import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import { DiceRoll } from './DiceRoll';
import { CountsAsTormentaPower } from './Poderes';

export interface CustomPower extends CountsAsTormentaPower {
  id: string; // UUID para identificação única
  name: string; // Nome do poder (definido pelo usuário)
  description: string; // Descrição do poder
  rolls?: DiceRoll[]; // Rolagens opcionais (ex: "Dano" - "2d6+3")
  customEffects?: CustomEffect[]; // Efeitos customizados (definidos pelo usuário)
  // Override de exibição vindo da aba "Exibição" do poder na ficha. O
  // `CustomPowerDialog` edita `name`/`description` (a identidade do poder);
  // estes campos existem só para o leitor ser único em toda a aba de Poderes.
  customName?: string;
  customDescription?: string;
}
