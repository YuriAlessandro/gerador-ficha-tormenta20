import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.ASPIRANTE_A_HEROI],
      general: [],
    },
  };
}

const ASPIRANTE_A_HEROI: Origin = {
  name: 'Aspirante a Herói (Deheon)',
  pericias: [],
  poderes: [atlasOriginPowers.ASPIRANTE_A_HEROI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Essência de mana',
    },
    {
      equipment: 'Mochila de aventureiro',
    },
  ],
};

export default ASPIRANTE_A_HEROI;
