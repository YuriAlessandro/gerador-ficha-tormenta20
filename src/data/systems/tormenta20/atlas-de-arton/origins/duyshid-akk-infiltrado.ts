import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.DUYSHID_AKK_INFILTRADO],
      general: [],
    },
  };
}

const DUYSHID_AKK_INFILTRADO: Origin = {
  name: 'Duyshid akk Infiltrado (Tyrondir)',
  pericias: [],
  poderes: [atlasOriginPowers.DUYSHID_AKK_INFILTRADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma marcial', EQUIPAMENTOS.armasMarciais),
    {
      equipment: 'Peças sobressalentes',
      description: 'T$ 100 para vender ou construir engenhocas',
    },
  ],
};

export default DUYSHID_AKK_INFILTRADO;
