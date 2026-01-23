import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CONHECIMENTO, Skill.DIPLOMACIA, Skill.NOBREZA],
    powers: {
      origin: [heroisArtonOriginPowers.BACHAREL],
      general: [],
    },
  };
}

const BACHAREL: Origin = {
  name: 'Bacharel',
  pericias: [Skill.CONHECIMENTO, Skill.DIPLOMACIA, Skill.NOBREZA],
  poderes: [heroisArtonOriginPowers.BACHAREL],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Tabardo com o símbolo de Khalmyr',
    },
    {
      equipment: 'Coleção de livros a sua escolha',
    },
  ],
};

export default BACHAREL;
