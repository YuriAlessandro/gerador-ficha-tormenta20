import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armaduras, Escudos } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

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
  getItems: (): Items[] => {
    // Escolhe entre cota de malha ou escudo pesado
    const opcoes = [
      { equipment: Armaduras.COTA_DE_MALHA },
      { equipment: Escudos.ESCUDO_PESADO },
    ];

    const itemEscolhido = getRandomItemFromArray(opcoes);

    return [
      itemEscolhido,
      {
        equipment: 'Enfeite de elmo com o símbolo da Ordem da Luz',
        description: 'Símbolo honorário da Ordem da Luz',
      },
    ];
  },
};

export default ESCUDEIRO_DA_LUZ;
