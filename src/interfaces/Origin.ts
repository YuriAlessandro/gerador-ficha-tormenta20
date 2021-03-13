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
}

export default Origin;
