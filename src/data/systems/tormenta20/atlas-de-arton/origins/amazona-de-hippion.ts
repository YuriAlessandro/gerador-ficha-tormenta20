import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CAVALGAR],
    powers: {
      origin: [atlasOriginPowers.AMAZONA_DE_HIPPION],
      general: [],
    },
  };
}

const AMAZONA_DE_HIPPION: Origin = {
  name: 'Amazona de Hippion (Deheon, Namalkah)',
  pericias: [Skill.CAVALGAR],
  poderes: [atlasOriginPowers.AMAZONA_DE_HIPPION],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS),
    {
      equipment: 'Cavalo de guerra (montaria)',
    },
  ],
};

export default AMAZONA_DE_HIPPION;
