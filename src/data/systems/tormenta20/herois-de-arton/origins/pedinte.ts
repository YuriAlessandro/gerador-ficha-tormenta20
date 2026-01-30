import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.PEDINTE],
      general: [],
    },
  };
}

const PEDINTE: Origin = {
  name: 'Pedinte',
  pericias: [],
  poderes: [heroisArtonOriginPowers.PEDINTE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Andrajos',
    },
    {
      equipment: 'Esmolas que guardou',
      description: '1 bálsamo restaurador e 1 essência de mana',
    },
  ],
};

export default PEDINTE;
