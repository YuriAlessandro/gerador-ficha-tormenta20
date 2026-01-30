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
    skills: [Skill.SOBREVIVENCIA],
    powers: {
      origin: [atlasOriginPowers.CRIADO_PELAS_VORACIS],
      general: [],
    },
  };
}

const CRIADO_PELAS_VORACIS: Origin = {
  name: 'Criado pelas Voracis (Galrasia)',
  pericias: [Skill.SOBREVIVENCIA],
  poderes: [atlasOriginPowers.CRIADO_PELAS_VORACIS],
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
        equipment: 'Armadura leve',
      },
      {
        equipment: Armas.LANCA,
      },
    ];
  },
};

export default CRIADO_PELAS_VORACIS;
