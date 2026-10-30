import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import EQUIPAMENTOS, { ARMAS_SIMPLES_E_MARCIAIS } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';
import { rollDice } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.GUERRA, Skill.INVESTIGACAO],
    powers: {
      origin: [atlasOriginPowers.SUCATEIRO_DE_BATALHAS],
      general: [],
    },
  };
}

const SUCATEIRO_DE_BATALHAS: Origin = {
  name: 'Sucateiro de Batalhas (Conflagração do Aço)',
  pericias: [Skill.GUERRA, Skill.INVESTIGACAO],
  poderes: [atlasOriginPowers.SUCATEIRO_DE_BATALHAS],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples ou marcial', ARMAS_SIMPLES_E_MARCIAIS, 1),
    {
      equipment: 'Bálsamo restaurador',
      qtd: 1,
    },
    itemChoice('escudo', 'Escudo leve ou pesado', EQUIPAMENTOS.escudos, 1),
    {
      equipment: 'Essência de mana',
      qtd: 1,
    },
    {
      equipment: 'Ração de viagem',
      qtd: 5,
    },
  ],
  // T$ 4d6 (Atlas p. 478). Vai para o dinheiro da ficha, não para a mochila.
  getMoney: () => rollDice(4, 6, 0, 'Dinheiro da origem (4d6)'),
};

export default SUCATEIRO_DE_BATALHAS;
