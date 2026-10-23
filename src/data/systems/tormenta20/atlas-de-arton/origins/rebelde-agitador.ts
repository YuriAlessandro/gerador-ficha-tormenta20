import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';
import { rollDice } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.INICIATIVA],
    powers: {
      origin: [atlasOriginPowers.REBELDE_AGITADOR],
      general: [],
    },
  };
}

const REBELDE_AGITADOR: Origin = {
  name: 'Rebelde Agitador (Sckharshantallas)',
  pericias: [Skill.INICIATIVA],
  poderes: [atlasOriginPowers.REBELDE_AGITADOR],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS, 1),
    {
      equipment: 'Panfleto revolucionário',
      qtd: 1,
    },
  ],
  // T$ 6d12, impostos que você deixou de pagar (Atlas p. 477). Vai para o
  // dinheiro da ficha, não para a mochila.
  getMoney: () => rollDice(6, 12),
};

export default REBELDE_AGITADOR;
