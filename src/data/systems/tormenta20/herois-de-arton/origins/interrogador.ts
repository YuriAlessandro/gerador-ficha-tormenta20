import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.INTIMIDACAO, Skill.INVESTIGACAO],
    powers: {
      origin: [heroisArtonOriginPowers.INTERROGADOR],
      general: [],
    },
  };
}

const INTERROGADOR: Origin = {
  name: 'Interrogador',
  pericias: [Skill.INTIMIDACAO, Skill.INVESTIGACAO],
  poderes: [heroisArtonOriginPowers.INTERROGADOR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Itens que pertenciam a antigos interrogados',
      description: 'Um ou mais itens somando T$ 100',
    },
  ],
};

export default INTERROGADOR;
