import Equipment from './Equipment';
import { OriginPower, GeneralPower } from './Poderes';

export interface OriginBenefits {
  powers: {
    origin: OriginPower[];
    general: GeneralPower[];
  };
  skills: string[];
}

interface Origin {
  name: string;
  itens: Equipment[];
  pericias: string[];
  poderes: (OriginPower | GeneralPower)[];
}

export default Origin;
