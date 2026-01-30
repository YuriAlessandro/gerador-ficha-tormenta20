import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.CAO_DE_BRIGA],
      general: [],
    },
  };
}

const CAO_DE_BRIGA: Origin = {
  name: 'Cão de Briga',
  pericias: [],
  poderes: [heroisArtonOriginPowers.CAO_DE_BRIGA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Manoplas ou uma arma marcial',
    },
  ],
};

export default CAO_DE_BRIGA;
