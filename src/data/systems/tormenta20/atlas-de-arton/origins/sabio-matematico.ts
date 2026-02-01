import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CONHECIMENTO],
    powers: {
      origin: [atlasOriginPowers.SABIO_MATEMATICO],
      general: [],
    },
  };
}

const SABIO_MATEMATICO: Origin = {
  name: 'Sábio Matemático (Halak-Tûr)',
  pericias: [Skill.CONHECIMENTO],
  poderes: [atlasOriginPowers.SABIO_MATEMATICO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Coleção de livros',
      qtd: 1,
      description: 'Livros de matemática e geometria',
    },
    {
      equipment: 'Luneta',
      qtd: 1,
    },
  ],
};

export default SABIO_MATEMATICO;
