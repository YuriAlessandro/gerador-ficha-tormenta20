import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

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
      equipment: 'Arco curto',
    },
    {
      equipment: '20 flechas',
    },
    {
      equipment:
        'Uma bola (ou outro objeto simples) com uma cara pintada e nome de gente',
    },
  ],
};

export default NAUFRAGO;
