import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.INVESTIGACAO],
    powers: {
      origin: [atlasOriginPowers.ASSISTENTE_FORENSE],
      general: [],
    },
  };
}

const ASSISTENTE_FORENSE: Origin = {
  name: 'Assistente Forense (Salistick)',
  pericias: [Skill.INVESTIGACAO],
  poderes: [atlasOriginPowers.ASSISTENTE_FORENSE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => [],
};

export default ASSISTENTE_FORENSE;
