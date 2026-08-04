import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import EQUIPAMENTOS, { Armaduras } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.CAVALGAR],
    powers: {
      origin: [atlasOriginPowers.RECRUTA_DA_FENIX],
      general: [],
    },
  };
}

const RECRUTA_DA_FENIX: Origin = {
  name: 'Recruta da Fênix (Triunphus)',
  pericias: [Skill.CAVALGAR],
  poderes: [atlasOriginPowers.RECRUTA_DA_FENIX],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('arma', 'Arma marcial', EQUIPAMENTOS.armasMarciais, 1),
    {
      equipment: Armaduras.BRUNEA,
      qtd: 1,
    },
    {
      equipment: 'Grifo iniciante',
      qtd: 1,
      description: 'Parceiro montaria',
    },
  ],
};

export default RECRUTA_DA_FENIX;
