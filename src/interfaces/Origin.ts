import Equipment from './Equipment';
import { OriginPower } from './Poderes';

interface Origin {
  name: string;
  itens: Equipment[];
  pericias: string[];
  poder: OriginPower;
}

export default Origin;
