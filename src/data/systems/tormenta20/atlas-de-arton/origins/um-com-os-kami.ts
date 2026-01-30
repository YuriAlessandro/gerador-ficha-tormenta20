import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.MISTICISMO],
    powers: {
      origin: [atlasOriginPowers.UM_COM_OS_KAMI],
      general: [],
    },
  };
}

const UM_COM_OS_KAMI: Origin = {
  name: 'Um com os Kami (Tamu-ra)',
  pericias: [Skill.MISTICISMO],
  poderes: [atlasOriginPowers.UM_COM_OS_KAMI],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Bálsamo restaurador',
      qtd: 1,
    },
    {
      equipment: 'Essência de mana',
      qtd: 1,
    },
  ],
};

export default UM_COM_OS_KAMI;
