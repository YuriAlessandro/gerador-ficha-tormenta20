import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.SOBREVIVENCIA],
    powers: {
      origin: [heroisArtonOriginPowers.INSCIENTE],
      general: [],
    },
  };
}

const INSCIENTE: Origin = {
  name: 'Insciente',
  pericias: [Skill.SOBREVIVENCIA],
  poderes: [heroisArtonOriginPowers.INSCIENTE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Uma arma simples ou ferramenta a sua escolha',
      description: 'De até T$ 100',
    },
  ],
};

export default INSCIENTE;
