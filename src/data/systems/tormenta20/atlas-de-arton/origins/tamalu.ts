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
    skills: [Skill.DIPLOMACIA, Skill.NOBREZA],
    powers: {
      origin: [atlasOriginPowers.TAMALU],
      general: [],
    },
  };
}

const TAMALU: Origin = {
  name: 'Tamalu (Khubar)',
  pericias: [Skill.DIPLOMACIA, Skill.NOBREZA],
  poderes: [atlasOriginPowers.TAMALU],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Traje da corte',
      qtd: 1,
    },
  ],
};

export default TAMALU;
