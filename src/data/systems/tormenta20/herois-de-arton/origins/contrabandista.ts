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
      origin: [heroisArtonOriginPowers.CONTRABANDISTA],
      general: [],
    },
  };
}

const CONTRABANDISTA: Origin = {
  name: 'Contrabandista',
  pericias: [Skill.ENGANACAO, Skill.LADINAGEM],
  poderes: [heroisArtonOriginPowers.CONTRABANDISTA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Uma arma de fogo, ou 10 doses de venenos',
      description: 'Com preço total de até T$ 500',
    },
  ],
};

export default CONTRABANDISTA;
