import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import Skill from '../../../../../interfaces/Skills';
import { Armaduras } from '../../equipamentos';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.ATLETISMO],
    powers: {
      origin: [atlasOriginPowers.TOCADO_PELO_INDOMAVEL],
      general: [],
    },
  };
}

const TOCADO_PELO_INDOMAVEL: Origin = {
  name: 'Tocado pelo Indomável (Moreania)',
  pericias: [Skill.ATLETISMO],
  poderes: [atlasOriginPowers.TOCADO_PELO_INDOMAVEL],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    {
      equipment: 'Trapos surrados',
      qtd: 1,
    },
    {
      equipment: Armaduras.GIBAO_DE_PELES,
      qtd: 1,
      description: 'Carcaça de couro de animal caçado',
    },
  ],
};

export default TOCADO_PELO_INDOMAVEL;
