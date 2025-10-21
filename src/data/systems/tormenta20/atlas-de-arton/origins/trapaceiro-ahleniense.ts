import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ENGANACAO, Skill.FURTIVIDADE],
    powers: {
      origin: [atlasOriginPowers.TRAPACEIRO_AHLENIENSE],
      general: [],
    },
  };
}

const TRAPACEIRO_AHLENIENSE: Origin = {
  name: 'Trapaceiro Ahleniense (Ahlen)',
  pericias: [Skill.ENGANACAO, Skill.FURTIVIDADE],
  poderes: [atlasOriginPowers.TRAPACEIRO_AHLENIENSE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de sombra',
      qtd: 1,
    },
    {
      equipment: 'Gazua',
      qtd: 1,
    },
    {
      equipment: 'Estojo de disfarces',
      qtd: 1,
    },
  ],
};

export default TRAPACEIRO_AHLENIENSE;
