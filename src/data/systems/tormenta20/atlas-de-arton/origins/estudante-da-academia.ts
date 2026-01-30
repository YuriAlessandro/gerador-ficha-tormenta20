import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.MISTICISMO],
    powers: {
      origin: [atlasOriginPowers.ESTUDANTE_DA_ACADEMIA],
      general: [],
    },
  };
}

const ESTUDANTE_DA_ACADEMIA: Origin = {
  name: 'Estudante da Academia (Academia Arcana)',
  pericias: [Skill.MISTICISMO],
  poderes: [atlasOriginPowers.ESTUDANTE_DA_ACADEMIA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Coleção de livros',
      description: 'Uma coleção de livros de estudos arcanos',
    },
    {
      equipment: 'Essência de mana',
      qtd: 2,
    },
  ],
};

export default ESTUDANTE_DA_ACADEMIA;
