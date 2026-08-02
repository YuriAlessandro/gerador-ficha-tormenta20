import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armaduras, Escudos } from '../../equipamentos';
import { itemChoice } from '../../originItemHelpers';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [Skill.NOBREZA],
    powers: {
      origin: [atlasOriginPowers.ESCUDEIRO_DA_LUZ],
      general: [],
    },
  };
}

const ESCUDEIRO_DA_LUZ: Origin = {
  name: 'Escudeiro da Luz (Bielefeld)',
  pericias: [Skill.NOBREZA],
  poderes: [atlasOriginPowers.ESCUDEIRO_DA_LUZ],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => [
    itemChoice('equipamento', 'Cota de malha ou escudo pesado', [
      Armaduras.COTA_DE_MALHA,
      Escudos.ESCUDO_PESADO,
    ]),
    {
      equipment: 'Enfeite de elmo com o símbolo da Ordem da Luz',
      description: 'Símbolo honorário da Ordem da Luz',
    },
  ],
};

export default ESCUDEIRO_DA_LUZ;
