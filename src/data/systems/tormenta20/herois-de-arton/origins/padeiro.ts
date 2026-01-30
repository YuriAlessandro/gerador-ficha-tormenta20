import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.OFICIO_CULINARIA],
    powers: {
      origin: [heroisArtonOriginPowers.PADEIRO],
      general: [],
    },
  };
}

const PADEIRO: Origin = {
  name: 'Padeiro',
  pericias: [Skill.OFICIO_CULINARIA],
  poderes: [heroisArtonOriginPowers.PADEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de Ofício (cozinheiro)',
    },
    {
      equipment: 'Rolo de massa',
      description: 'Mesmas estatísticas de uma clava',
    },
  ],
};

export default PADEIRO;
