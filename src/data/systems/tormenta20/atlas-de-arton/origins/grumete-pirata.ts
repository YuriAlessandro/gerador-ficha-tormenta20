import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ACROBACIA, Skill.ATLETISMO, Skill.REFLEXOS],
    powers: {
      origin: [atlasOriginPowers.GRUMETE_PIRATA],
      general: [],
    },
  };
}

const GRUMETE_PIRATA: Origin = {
  name: 'Grumete Pirata (Três Mares)',
  pericias: [Skill.ACROBACIA, Skill.ATLETISMO, Skill.REFLEXOS],
  poderes: [atlasOriginPowers.GRUMETE_PIRATA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: Armas.ADAGA,
    },
    {
      equipment: 'Corda',
      qtd: 1,
    },
    {
      equipment: 'Tatuagem de tripulação',
      qtd: 1,
      description: '+1 em Intimidação',
    },
  ],
};

export default GRUMETE_PIRATA;
