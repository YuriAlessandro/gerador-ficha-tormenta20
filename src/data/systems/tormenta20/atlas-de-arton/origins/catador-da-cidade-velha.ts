import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FORTITUDE],
    powers: {
      origin: [atlasOriginPowers.CATADOR_DA_CIDADE_VELHA],
      general: [],
    },
  };
}

const CATADOR_DA_CIDADE_VELHA: Origin = {
  name: 'Catador da Cidade Velha (Nova Malpetrim)',
  pericias: [Skill.FORTITUDE],
  poderes: [atlasOriginPowers.CATADOR_DA_CIDADE_VELHA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Luneta',
    },
    {
      equipment: 'Luvas de pelica',
    },
    {
      equipment: 'Tranqueiras resgatadas do mar',
      description: '2 espaços, valor de venda T$ 100',
    },
  ],
};

export default CATADOR_DA_CIDADE_VELHA;
