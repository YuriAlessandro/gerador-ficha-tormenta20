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
    skills: [Skill.ACROBACIA, Skill.PILOTAGEM],
    powers: {
      origin: [atlasOriginPowers.FILHOTE_DA_REVOADA],
      general: [],
    },
  };
}

const FILHOTE_DA_REVOADA: Origin = {
  name: 'Filhote da Revoada (Lamnor)',
  pericias: [Skill.ACROBACIA, Skill.PILOTAGEM],
  poderes: [atlasOriginPowers.FILHOTE_DA_REVOADA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Instrumentos de Ofício (artesão)',
      description: 'Ferramentas para construir veículos aéreos',
    },
  ],
  getMoney: () => 100,
};

export default FILHOTE_DA_REVOADA;
