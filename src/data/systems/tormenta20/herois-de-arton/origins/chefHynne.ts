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
      origin: [heroisArtonOriginPowers.CHEF_HYNNE],
      general: [],
    },
  };
}

const CHEF_HYNNE: Origin = {
  name: 'Chef Hynne',
  pericias: [Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.CHEF_HYNNE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Cutelo',
      description: 'Mesmas estatísticas de uma foice',
    },
    {
      equipment: 'Instrumentos de cozinheiro aprimorados',
    },
  ],
};

export default CHEF_HYNNE;
