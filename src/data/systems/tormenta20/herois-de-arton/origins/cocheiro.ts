import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ADESTRAMENTO, Skill.PILOTAGEM],
    powers: {
      origin: [heroisArtonOriginPowers.COCHEIRO],
      general: [],
    },
  };
}

const COCHEIRO: Origin = {
  name: 'Cocheiro',
  pericias: [Skill.ADESTRAMENTO, Skill.PILOTAGEM],
  poderes: [heroisArtonOriginPowers.COCHEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Cavalo ou trobo',
    },
    {
      equipment: 'Carroça',
    },
  ],
};

export default COCHEIRO;
