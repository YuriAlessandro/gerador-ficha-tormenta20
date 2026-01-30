import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ATUACAO],
    powers: {
      origin: [heroisArtonOriginPowers.MENESTREL],
      general: [],
    },
  };
}

const MENESTREL: Origin = {
  name: 'Menestrel',
  pericias: [Skill.ATUACAO],
  poderes: [heroisArtonOriginPowers.MENESTREL],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Um instrumento musical a sua escolha',
      description: 'De até T$ 35',
    },
  ],
};

export default MENESTREL;
