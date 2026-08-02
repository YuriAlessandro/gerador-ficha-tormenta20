import Equipment from './Equipment';
import {
  OriginPower,
  GeneralPower,
  GeneralPowerType,
  PowerGetter,
} from './Poderes';
import Skill from './Skills';
import { Atributo } from '../data/systems/tormenta20/atributos';

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
}

export interface Items {
  equipment: Equipment | string;
  qtd?: number;
  description?: string;
  choice?: OriginItemChoice;
}

export interface AttributeModifier {
  attribute: Atributo;
  modifier: number;
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
  getAttributeModifier?: (classPriority: Atributo[]) => AttributeModifier;
  isRegional?: boolean; // true = origem regional que concede TODOS os benefícios automaticamente
}

export default Origin;
