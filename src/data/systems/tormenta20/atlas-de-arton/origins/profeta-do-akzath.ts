import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armas, ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.RELIGIAO],
    powers: {
      origin: [atlasOriginPowers.PROFETA_DO_AKZATH],
      general: [],
    },
  };
}

const PROFETA_DO_AKZATH: Origin = {
  name: 'Profeta do Akzath (Lamnor)',
  pericias: [Skill.RELIGIAO],
  poderes: [atlasOriginPowers.PROFETA_DO_AKZATH],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS, 1),
    {
      equipment: Armas.BORDAO,
      qtd: 1,
    },
    {
      equipment: 'Pergaminho com diagrama do Akzath',
      qtd: 1,
    },
  ],
};

export default PROFETA_DO_AKZATH;
