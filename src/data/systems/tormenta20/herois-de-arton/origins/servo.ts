import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.DIPLOMACIA, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.SERVO],
      general: [],
    },
  };
}

const SERVO: Origin = {
  name: 'Servo',
  pericias: [Skill.DIPLOMACIA, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.SERVO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Balde e vassoura',
      description: 'Mesmas estatísticas de um bordão',
    },
    {
      equipment: 'Tabardo de seu patrono',
    },
  ],
};

export default SERVO;
