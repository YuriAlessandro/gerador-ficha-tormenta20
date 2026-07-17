import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.NOBREZA],
    powers: {
      origin: [atlasOriginPowers.ARISTOCRATA_DAIZENSHI],
      general: [],
    },
  };
}

const ARISTOCRATA_DAIZENSHI: Origin = {
  name: "Aristocrata Dai'zenshi (Tamu-ra)",
  pericias: [Skill.NOBREZA],
  poderes: [atlasOriginPowers.ARISTOCRATA_DAIZENSHI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Traje da corte',
    },
    {
      equipment: 'Katana superior com uma melhoria (exceto material especial)',
    },
  ],
};

export default ARISTOCRATA_DAIZENSHI;
