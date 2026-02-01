import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ENGANACAO, Skill.LADINAGEM],
    powers: {
      origin: [heroisArtonOriginPowers.ESPIAO],
      general: [],
    },
  };
}

const ESPIAO: Origin = {
  name: 'Espião',
  pericias: [Skill.ENGANACAO, Skill.LADINAGEM],
  poderes: [heroisArtonOriginPowers.ESPIAO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Estojo de disfarces',
    },
    {
      equipment: 'Gazua',
    },
    {
      equipment: 'Luneta',
    },
    {
      equipment: 'Três doses de cosmético',
    },
  ],
};

export default ESPIAO;
