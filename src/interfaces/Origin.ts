import Equipment from './Equipment';
import { OriginPower, GeneralPower, PowerGetter } from './Poderes';
import Skill from './Skills';

export interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: PowerGetter[];
  };
  skills: Skill[];
}

export interface Items {
  equipment: Equipment | string;
  qtd?: number;
}

interface Origin {
  name: string;
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
  getPowersAndSkills?: (usedSkills: Skill[], origin: Origin) => OriginBenefits;
  getItems: () => Items[];
}

export default Origin;
