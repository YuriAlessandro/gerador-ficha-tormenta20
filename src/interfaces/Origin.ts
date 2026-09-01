import Equipment from './Equipment';
import {
  OriginPower,
  GeneralPower,
  GeneralPowerType,
  PowerGetter,
} from './Poderes';
import Skill from './Skills';

export interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: PowerGetter[];
    // Raw general powers for wizard display (not converted to PowerGetters)
    generalPowers?: GeneralPower[];
  };
  skills: Skill[];
  // Tipo de poder que conta como UM único slot (escolha entre muitos).
  // Ex.: COMBATE para Gladiador/Soldado, TORMENTA para Assistente de Laboratório.
  limitedPowerType?: GeneralPowerType;
}

/**
 * Escolha de item concedida pela origem ("uma arma marcial ou exótica").
 * Quando presente, `Items.equipment` guarda apenas o sorteio de fallback — a
 * fonte da verdade é a escolha do jogador, resolvida por `resolveOriginItems`.
 */
export interface OriginItemChoice {
  /** Chave estável dentro da origem (ex.: 'arma'), casa a escolha do jogador. */
  key: string;
  /** Rótulo do livro exibido ao jogador: "Uma arma marcial ou exótica". */
  label: string;
  /** Mesmo par do `Items.equipment`: item do catálogo ou texto livre. */
  options: (Equipment | string)[];
  /**
   * Material especial aplicado automaticamente ao item escolhido (ex.:
   * "madeira Tollon", Lenhador de Tollon). Grava a mesma `AppliedModification`
   * que o editor de itens gravaria; o efeito numérico (quando o material tem
   * um modelado em `materialEffects.ts`) é calculado por
   * `applyItemEnhancements` a cada recálculo — materiais sem modelo numérico
   * (caso de "madeira Tollon") ficam só descritivos, como já é o caso ao
   * aplicá-los manualmente pelo editor.
   */
  specialMaterial?: string;
  /**
   * Melhoria ("modificação de item superior") aplicada automaticamente ao
   * item escolhido (ex.: "Certeira", Nobre Zakharoviano). Diferente de
   * `specialMaterial`: é uma `AppliedModification` comum, resolvida por
   * `modificationEffects`/`TEXT_ONLY_MODIFICATIONS`.
   */
  modification?: string;
}

export interface Items {
  equipment: Equipment | string;
  qtd?: number;
  description?: string;
  choice?: OriginItemChoice;
}

interface Origin {
  name: string;
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
  getPowersAndSkills?: (
    usedSkills: Skill[],
    origin: Origin,
    returnAllOptions?: boolean
  ) => OriginBenefits;
  getItems: () => Items[];
  getMoney?: () => number;
  isRegional?: boolean; // true = origem regional que concede TODOS os benefícios automaticamente
}

export default Origin;
