import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.LADINAGEM, Skill.SOBREVIVENCIA],
    powers: {
      origin: [heroisArtonOriginPowers.LADRAO_DE_TUMULOS],
      general: [],
    },
  };
}

const LADRAO_DE_TUMULOS: Origin = {
  name: 'Ladrão de Túmulos',
  pericias: [Skill.LADINAGEM, Skill.SOBREVIVENCIA],
  poderes: [heroisArtonOriginPowers.LADRAO_DE_TUMULOS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Pá',
      description: 'Mesmas estatísticas de uma lança',
    },
    {
      equipment: 'Pé de cabra',
    },
  ],
};

export default LADRAO_DE_TUMULOS;
