import Equipment from './Equipment';
import { OriginPower, GeneralPower, PowerGetter } from './Poderes';
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
}

export interface Items {
  equipment: Equipment | string;
  qtd?: number;
  description?: string;
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
