import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_PESCADOR, Skill.SOBREVIVENCIA],
    powers: {
      origin: [heroisArtonOriginPowers.PESCADOR],
      general: [],
    },
  };
}

const PESCADOR: Origin = {
  name: 'Pescador',
  pericias: [Skill.OFICIO_PESCADOR, Skill.SOBREVIVENCIA],
  poderes: [heroisArtonOriginPowers.PESCADOR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bolsa cheia de minhocas',
    },
    {
      equipment: 'Instrumentos de pescador',
    },
  ],
};

export default PESCADOR;
