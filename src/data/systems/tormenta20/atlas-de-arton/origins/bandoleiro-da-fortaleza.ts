import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.FURTIVIDADE, Skill.INTIMIDACAO],
    powers: {
      origin: [atlasOriginPowers.BANDOLEIRO_DA_FORTALEZA],
      general: [],
    },
  };
}

const BANDOLEIRO_DA_FORTALEZA: Origin = {
  name: 'Bandoleiro da Fortaleza (Khalifor)',
  pericias: [Skill.FURTIVIDADE, Skill.INTIMIDACAO],
  poderes: [atlasOriginPowers.BANDOLEIRO_DA_FORTALEZA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => [
    {
      equipment: 'Anel com símbolo da família',
      description: 'Vale T$ 200',
    },
    {
      equipment: 'Títulos de terras expirados',
      description: '+2 em Diplomacia com nobres e burocratas',
    },
    {
      equipment: 'Traje da corte',
    },
  ],
  getMoney: () => 200,
};

export default BANDOLEIRO_DA_FORTALEZA;
