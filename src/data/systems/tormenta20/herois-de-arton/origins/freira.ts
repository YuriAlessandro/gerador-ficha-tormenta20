import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CURA],
    powers: {
      origin: [heroisArtonOriginPowers.FREIRA],
      general: [],
    },
  };
}

const FREIRA: Origin = {
  name: 'Freira',
  pericias: [Skill.CURA],
  poderes: [heroisArtonOriginPowers.FREIRA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Maleta de medicamentos',
    },
    {
      equipment: 'Manto eclesiástico',
    },
    {
      equipment: 'Símbolo sagrado',
    },
  ],
};

export default FREIRA;
