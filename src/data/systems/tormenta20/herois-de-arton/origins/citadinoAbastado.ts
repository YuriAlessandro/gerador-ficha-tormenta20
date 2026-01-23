import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.NOBREZA, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.CITADINO_ABASTADO],
      general: [],
    },
  };
}

const CITADINO_ABASTADO: Origin = {
  name: 'Citadino Abastado',
  pericias: [Skill.NOBREZA, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.CITADINO_ABASTADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Arma, armadura, ferramenta ou vestuário de até T$ 500',
    },
  ],
};

export default CITADINO_ABASTADO;
