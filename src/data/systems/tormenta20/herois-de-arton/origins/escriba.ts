import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CONHECIMENTO, Skill.OFICIO],
    powers: {
      origin: [heroisArtonOriginPowers.ESCRIBA],
      general: [],
    },
  };
}

const ESCRIBA: Origin = {
  name: 'Escriba',
  pericias: [Skill.CONHECIMENTO, Skill.OFICIO],
  poderes: [heroisArtonOriginPowers.ESCRIBA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de escriba',
    },
    {
      equipment: 'Organizador de pergaminhos',
    },
    {
      equipment: 'Uma coleção de livros a sua escolha',
    },
  ],
};

export default ESCRIBA;
