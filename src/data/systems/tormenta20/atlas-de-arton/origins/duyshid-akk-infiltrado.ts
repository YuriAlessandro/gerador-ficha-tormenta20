import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

/**
 * Função customizada para origens regionais - retorna TODOS os benefícios
 * (diferente das origens básicas que permitem escolher 2)
 */
function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.DUYSHID_AKK_INFILTRADO],
      general: [],
    },
  };
}

const DUYSHID_AKK_INFILTRADO: Origin = {
  name: 'Duyshid akk Infiltrado (Tyrondir)',
  pericias: [],
  poderes: [atlasOriginPowers.DUYSHID_AKK_INFILTRADO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Escolhe arma marcial aleatória
    const armasMarciais = [
      Armas.ALFANJE,
      Armas.ARCO_CURTO,
      Armas.ARCO_LONGO,
      Armas.BESTA_LEVE,
      Armas.BESTA_PESADA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MACHADO_DE_GUERRA,
      Armas.MARTELO_DE_GUERRA,
      Armas.MONTANTE,
    ];

    const armaSorteada = getRandomItemFromArray(armasMarciais);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma marcial',
      },
      {
        equipment: 'Peças sobressalentes',
        description: 'T$ 100 para vender ou construir engenhocas',
      },
    ];
  },
};

export default DUYSHID_AKK_INFILTRADO;
