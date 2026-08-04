import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.NOMADE_SAR_ALLAN],
      general: [],
    },
  };
}

const NOMADE_SAR_ALLAN: Origin = {
  name: 'Nômade Sar-Allan (Halak-Tûr)',
  pericias: [],
  poderes: [atlasOriginPowers.NOMADE_SAR_ALLAN],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS),
    itemChoice(
      'montaria',
      'Corcel do deserto ou dromedário',
      ['Corcel do deserto', 'Dromedário'],
      1
    ),
    {
      equipment: 'Manto camuflado (deserto)',
      qtd: 1,
    },
  ],
};

export default NOMADE_SAR_ALLAN;
