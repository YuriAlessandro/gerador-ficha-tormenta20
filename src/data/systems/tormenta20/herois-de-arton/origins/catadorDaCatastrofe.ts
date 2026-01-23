import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import heroisArtonOriginPowers from './originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FORTITUDE, Skill.PERCEPCAO],
    powers: {
      origin: [heroisArtonOriginPowers.CATADOR_DA_CATASTROFE],
      general: [],
    },
  };
}

const CATADOR_DA_CATASTROFE: Origin = {
  name: 'Catador da Catástrofe',
  pericias: [Skill.FORTITUDE, Skill.PERCEPCAO],
  poderes: [heroisArtonOriginPowers.CATADOR_DA_CATASTROFE],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Equipamento de aventura de até T$ 150',
      qtd: 2,
      description: 'Dois equipamentos a sua escolha',
    },
  ],
};

export default CATADOR_DA_CATASTROFE;
