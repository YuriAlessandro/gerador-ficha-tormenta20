import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';
import { Armas } from '../../equipamentos';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.NAUFRAGO],
      general: [],
    },
  };
}

const NAUFRAGO: Origin = {
  name: 'Náufrago',
  pericias: [],
  poderes: [heroisArtonOriginPowers.NAUFRAGO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armas.ARCOCURTO,
    },
    {
      // `Armas.FLECHAS` já é o pacote de 20, com metadados de munição.
      equipment: Armas.FLECHAS,
    },
    {
      equipment:
        'Uma bola (ou outro objeto simples) com uma cara pintada e nome de gente',
    },
  ],
};

export default NAUFRAGO;
