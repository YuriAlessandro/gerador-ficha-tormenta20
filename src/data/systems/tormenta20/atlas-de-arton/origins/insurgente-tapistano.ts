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
      origin: [atlasOriginPowers.INSURGENTE_TAPISTANO],
      general: [],
    },
  };
}

const INSURGENTE_TAPISTANO: Origin = {
  name: 'Insurgente Tapistano (Império de Tauron)',
  pericias: [],
  poderes: [atlasOriginPowers.INSURGENTE_TAPISTANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples', EQUIPAMENTOS.armasSimples),
    {
      equipment: 'Amuleto da resistência',
      qtd: 1,
      description: 'Símbolo reconhecível por outros rebeldes',
    },
  ],
};

export default INSURGENTE_TAPISTANO;
