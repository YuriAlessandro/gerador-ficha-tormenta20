import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CURA, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.BOTICARIO],
      general: [],
    },
  };
}

const BOTICARIO: Origin = {
  name: 'Boticário',
  pericias: [Skill.CURA, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.BOTICARIO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bálsamo restaurador',
    },
    {
      equipment: 'Instrumentos de Ofício (alquimista)',
    },
    {
      equipment: 'Maleta de medicamentos',
    },
  ],
};

export default BOTICARIO;
