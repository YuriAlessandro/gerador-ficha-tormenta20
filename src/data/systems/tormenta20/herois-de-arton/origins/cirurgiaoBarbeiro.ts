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
      origin: [heroisArtonOriginPowers.CIRURGIAO_BARBEIRO],
      general: [],
    },
  };
}

const CIRURGIAO_BARBEIRO: Origin = {
  name: 'Cirurgião-Barbeiro',
  pericias: [Skill.CURA, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.CIRURGIAO_BARBEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Dente falso',
    },
    {
      equipment: 'Instrumentos de barbeiro',
    },
    {
      equipment: 'Maleta de medicamentos',
    },
  ],
};

export default CIRURGIAO_BARBEIRO;
