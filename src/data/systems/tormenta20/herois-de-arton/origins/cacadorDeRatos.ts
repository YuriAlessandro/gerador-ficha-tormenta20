import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FURTIVIDADE, Skill.INVESTIGACAO, Skill.SOBREVIVENCIA],
    powers: {
      origin: [heroisArtonOriginPowers.CACADOR_DE_RATOS],
      general: [],
    },
  };
}

const CACADOR_DE_RATOS: Origin = {
  name: 'Caçador de Ratos',
  pericias: [Skill.FURTIVIDADE, Skill.INVESTIGACAO, Skill.SOBREVIVENCIA],
  poderes: [heroisArtonOriginPowers.CACADOR_DE_RATOS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Clava',
    },
    {
      equipment: 'Um gato (parceiro perseguidor iniciante)',
    },
  ],
  getMoney: () => 50,
};

export default CACADOR_DE_RATOS;
