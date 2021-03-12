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

interface Origin {
  name: string;
  itens: Equipment[];
  pericias: Skill[];
  poderes: (OriginPower | GeneralPower)[];
}

export default Origin;
