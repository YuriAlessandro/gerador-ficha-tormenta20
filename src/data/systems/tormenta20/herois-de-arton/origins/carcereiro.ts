import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [heroisArtonOriginPowers.CARCEREIRO],
      general: [],
    },
  };
}

const CARCEREIRO: Origin = {
  name: 'Carcereiro',
  pericias: [],
  poderes: [heroisArtonOriginPowers.CARCEREIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Algemas',
    },
    {
      equipment: 'Lampião',
    },
    {
      equipment: 'Uma arma de até T$ 500 a sua escolha',
      description: 'Pode ter sido obtida de um detento',
    },
  ],
};

export default CARCEREIRO;
