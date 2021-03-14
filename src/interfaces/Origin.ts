import Equipment from './Equipment';
import { OriginPower, GeneralPower } from './Poderes';
import Skill from './Skills';

export interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: GeneralPower[];
  };
  skills: Skill[];
}

interface Items {
  equipment: Equipment | string;
  qtd?: number;
}

interface Origin {
  name: string;
  itens: Items[];
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
  getPowersAndSkills?: (usedSkills: Skill[], origin?: Origin) => OriginBenefits;
  getItems?: (origin: Origin, items: Items[]) => Items[];
}

export default Origin;
