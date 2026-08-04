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
    skills: [Skill.PERCEPCAO],
    powers: {
      origin: [atlasOriginPowers.DESCENDENTE_COLLENIANO],
      general: [],
    },
  };
}

const DESCENDENTE_COLLENIANO: Origin = {
  name: 'Descendente Colleniano (Ahlen)',
  pericias: [Skill.PERCEPCAO],
  poderes: [atlasOriginPowers.DESCENDENTE_COLLENIANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma simples', EQUIPAMENTOS.armasSimples),
    {
      equipment: 'Estojo de disfarces',
    },
    {
      equipment: 'Ração de viagem',
      qtd: 5,
    },
  ],
};

export default DESCENDENTE_COLLENIANO;
