import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FORTITUDE, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.CONSTRUTOR],
      general: [],
    },
  };
}

const CONSTRUTOR: Origin = {
  name: 'Construtor',
  pericias: [Skill.FORTITUDE, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.CONSTRUTOR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de pedreiro ou ferramenta pesada',
      description:
        'Ferramenta pesada tem mesmas estatísticas de uma maça ou lança, a sua escolha',
    },
  ],
};

export default CONSTRUTOR;
