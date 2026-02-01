import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.CARPINTEIRO_DE_GUILDA],
      general: [],
    },
  };
}

const CARPINTEIRO_DE_GUILDA: Origin = {
  name: 'Carpinteiro de Guilda',
  pericias: [Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.CARPINTEIRO_DE_GUILDA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de Ofício (carpinteiro)',
    },
    {
      equipment: 'Uma arma de corte a sua escolha',
    },
  ],
};

export default CARPINTEIRO_DE_GUILDA;
