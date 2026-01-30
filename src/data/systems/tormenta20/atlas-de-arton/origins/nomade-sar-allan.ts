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
      origin: [atlasOriginPowers.NOMADE_SAR_ALLAN],
      general: [],
    },
  };
}

const NOMADE_SAR_ALLAN: Origin = {
  name: 'Nômade Sar-Allan (Halak-Tûr)',
  pericias: [],
  poderes: [atlasOriginPowers.NOMADE_SAR_ALLAN],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Escolhe arma simples ou marcial aleatória
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

    const armasMarciais = [
      Armas.ALFANJE,
      Armas.ARCO_CURTO,
      Armas.ARCO_LONGO,
      Armas.BESTA_LEVE,
      Armas.BESTA_PESADA,
      Armas.CIMITARRA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MACHADO_DE_GUERRA,
      Armas.MARTELO_DE_GUERRA,
      Armas.MONTANTE,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSelecionada = getRandomItemFromArray(todasArmas);

    // Escolhe entre corcel do deserto e dromedário
    const montarias = ['Corcel do deserto', 'Dromedário'];
    const montariaSelecionada = getRandomItemFromArray(montarias);

    return [
      {
        equipment: armaSelecionada,
      },
      {
        equipment: montariaSelecionada,
        qtd: 1,
      },
      {
        equipment: 'Manto camuflado (deserto)',
        qtd: 1,
      },
    ];
  },
};

export default NOMADE_SAR_ALLAN;
