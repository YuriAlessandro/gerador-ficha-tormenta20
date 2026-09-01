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
  // Perícias concedidas cujo valor final o jogador escolhe (ex.: qual Ofício
  // específico), em vez de uma perícia fixa em `skills`.
  skillChoices?: OriginSkillChoice[];
  // Tipo de poder que conta como UM único slot (escolha entre muitos).
  // Ex.: COMBATE para Gladiador/Soldado, TORMENTA para Assistente de Laboratório.
  limitedPowerType?: GeneralPowerType;
}

/**
 * Escolha de perícia concedida pela origem ("Ofício qualquer" -> jogador
 * escolhe qual). Espelha `OriginItemChoice`: a fonte da verdade é a escolha do
 * jogador, resolvida por `resolveOriginSkillChoices`.
 */
export interface OriginSkillChoice {
  /** Chave estável dentro da origem (ex.: 'oficio'), casa a escolha do jogador. */
  key: string;
  /** Rótulo exibido ao jogador: "Ofício". */
  label: string;
  /** Perícias entre as quais o jogador escolhe. */
  options: Skill[];
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
