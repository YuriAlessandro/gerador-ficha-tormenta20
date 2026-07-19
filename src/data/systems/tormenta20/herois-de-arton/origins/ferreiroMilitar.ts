import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';
import { HEROIS_ARTON_WEAPONS } from '../equipment/weapons';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_ARMEIRO],
    powers: {
      origin: [heroisArtonOriginPowers.FERREIRO_MILITAR],
      general: [],
    },
  };
}

const FERREIRO_MILITAR: Origin = {
  name: 'Ferreiro Militar',
  pericias: [Skill.OFICIO_ARMEIRO],
  poderes: [heroisArtonOriginPowers.FERREIRO_MILITAR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de armeiro',
    },
    {
      equipment: HEROIS_ARTON_WEAPONS.MARTELO_LEVE,
    },
  ],
};

export default FERREIRO_MILITAR;
