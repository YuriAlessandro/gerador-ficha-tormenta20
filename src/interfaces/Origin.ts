import Equipment from './Equipment';
import { OriginPower, GeneralPower } from './Poderes';

interface Origin {
  name: string;
  itens: Equipment[];
  pericias: string[];
  poderes: (OriginPower | GeneralPower)[];
}

export default Origin;
