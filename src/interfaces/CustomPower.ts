import type { CustomEffect } from '../premium/interfaces/CustomEffect';
import type { SheetBonus } from './CharacterSheet';
import { DiceRoll } from './DiceRoll';
import { CountsAsTormentaPower } from './Poderes';

export interface CustomPower extends CountsAsTormentaPower {
  id: string; // UUID para identificação única
  name: string; // Nome do poder (definido pelo usuário)
  description: string; // Descrição do poder
  rolls?: DiceRoll[]; // Rolagens opcionais (ex: "Dano" - "2d6+3")
  customEffects?: CustomEffect[]; // Efeitos customizados (definidos pelo usuário)
  /**
   * Bônus passivos declarados pelo usuário — mesmo formato dos poderes de livro
   * e de homebrew, para a ficha calcular sozinha o que o poder concede.
   *
   * O `source` gravado aqui é só informativo: quem manda é o Step 7.1 do
   * `recalculateSheet`, que re-carimba `{ type: 'power', name }` a cada
   * recálculo — o usuário pode renomear o poder a qualquer momento, e um
   * `source.name` congelado quebraria o casamento em `getPowerAppliedBonuses`.
   *
   * Conteúdo de usuário: sempre passar por `sanitizeCustomPowerBonuses`
   * (`functions/powers/customPowerBonuses.ts`) antes de virar número.
   */
  sheetBonuses?: SheetBonus[];
  // Override de exibição vindo da aba "Exibição" do poder na ficha. O
  // `CustomPowerDialog` edita `name`/`description` (a identidade do poder);
  // estes campos existem só para o leitor ser único em toda a aba de Poderes.
  customName?: string;
  customDescription?: string;
}
