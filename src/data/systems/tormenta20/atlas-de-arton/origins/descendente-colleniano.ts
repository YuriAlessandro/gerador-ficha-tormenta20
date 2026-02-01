import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import Skill from '../../../../../interfaces/Skills';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

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
  getItems: (): Items[] => {
    // Escolhe arma simples aleatória
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDAO,
      Armas.CLAVA,
      Armas.FACA,
      Armas.FOICE,
      Armas.LANCA,
      Armas.LANCA_MONTARIA,
      Armas.MANGUAL,
      Armas.MACHADINHA,
    ];

    const armaSorteada = getRandomItemFromArray(armasSimples);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma simples',
      },
      {
        equipment: 'Estojo de disfarces',
      },
      {
        equipment: 'Ração de viagem',
        qtd: 5,
      },
    ];
  },
};

export default DESCENDENTE_COLLENIANO;
