import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FURTIVIDADE, Skill.INTIMIDACAO],
    powers: {
      origin: [atlasOriginPowers.BANDOLEIRO_DA_FORTALEZA],
      general: [],
    },
  };
}

const BANDOLEIRO_DA_FORTALEZA: Origin = {
  name: 'Bandoleiro da Fortaleza (Khalifor)',
  pericias: [Skill.FURTIVIDADE, Skill.INTIMIDACAO],
  poderes: [atlasOriginPowers.BANDOLEIRO_DA_FORTALEZA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Adaga',
    },
    {
      equipment: 'Gazua',
    },
    {
      equipment: 'Manto camuflado',
      description: 'Urbano',
    },
  ],
};

export default BANDOLEIRO_DA_FORTALEZA;
