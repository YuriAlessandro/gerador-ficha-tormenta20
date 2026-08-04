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
      origin: [atlasOriginPowers.TRADICIONALISTA_SVALANO],
      general: [],
    },
  };
}

const TRADICIONALISTA_SVALANO: Origin = {
  name: 'Tradicionalista Svalano (Svalas)',
  pericias: [],
  poderes: [atlasOriginPowers.TRADICIONALISTA_SVALANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS, 1),
    {
      equipment: 'Corda',
      qtd: 1,
    },
    {
      equipment: 'Mochila de aventureiro',
      qtd: 1,
    },
    {
      equipment: 'Vara de madeira (3 m)',
      qtd: 1,
    },
  ],
};

export default TRADICIONALISTA_SVALANO;
