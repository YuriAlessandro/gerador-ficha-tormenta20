import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import EQUIPAMENTOS from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.INTIMIDACAO],
    powers: {
      origin: [atlasOriginPowers.AMOQUE_PURPURA],
      general: [],
    },
  };
}

const AMOQUE_PURPURA: Origin = {
  name: 'Amoque Púrpura (Ermos Púrpuras)',
  pericias: [Skill.INTIMIDACAO],
  poderes: [atlasOriginPowers.AMOQUE_PURPURA],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples', EQUIPAMENTOS.armasSimples),
    {
      equipment: 'Estandarte da sua tribo',
    },
  ],
};

export default AMOQUE_PURPURA;
