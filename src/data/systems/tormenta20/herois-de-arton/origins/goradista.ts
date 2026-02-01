import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_CULINARIA],
    powers: {
      origin: [heroisArtonOriginPowers.GORADISTA],
      general: [],
    },
  };
}

const GORADISTA: Origin = {
  name: 'Goradista',
  pericias: [Skill.OFICIO_CULINARIA],
  poderes: [heroisArtonOriginPowers.GORADISTA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de cozinheiro',
    },
    {
      equipment: 'T$ 36 em ingredientes para produzir gorad quente',
    },
  ],
};

export default GORADISTA;
