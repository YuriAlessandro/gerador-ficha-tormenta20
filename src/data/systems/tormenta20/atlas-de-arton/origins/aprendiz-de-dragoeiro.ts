import Origin, {
  Items,
  OriginBenefits,
} from '../../../../../interfaces/Origin';
import atlasOriginPowers from '../powers/originPowers';
import { Armas } from '../../equipamentos';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';

function getAllRegionalBenefits(): OriginBenefits {
  return {
    skills: [],
    powers: {
      origin: [atlasOriginPowers.APRENDIZ_DE_DRAGOEIRO],
      general: [],
    },
  };
}

const APRENDIZ_DE_DRAGOEIRO: Origin = {
  name: 'Aprendiz de Dragoeiro (Sckharshantallas)',
  pericias: [],
  poderes: [atlasOriginPowers.APRENDIZ_DE_DRAGOEIRO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  getItems: (): Items[] => {
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDO,
      Armas.CAJADO,
      Armas.CLAVA,
      Armas.FOICE,
      Armas.LANCA,
      Armas.MACHADINHA,
      Armas.MACA,
    ];

    const armasMarciais = [
      Armas.ALABARDA,
      Armas.ARCO_CURTO,
      Armas.ARCO_LONGO,
      Armas.BESTA_LEVE,
      Armas.BESTA_PESADA,
      Armas.CHICOTE,
      Armas.CIMITARRA,
      Armas.ESPADA_BASTARDA,
      Armas.ESPADA_CURTA,
      Armas.ESPADA_LONGA,
      Armas.ESPADAO,
      Armas.FOICE_DE_GUERRA,
      Armas.GLAIVE,
      Armas.LANCA_DE_CAVALARIA,
      Armas.LANCA_MONTANTE,
      Armas.MACHADO_DE_ARREMESSO,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL,
      Armas.MARTELO_DE_ARREMESSO,
      Armas.MARTELO_DE_GUERRA,
      Armas.MARRETA,
      Armas.PICARETA_DE_GUERRA,
      Armas.TRIDENTE,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSorteada = getRandomItemFromArray(todasArmas);

    return [
      {
        equipment: armaSorteada,
        description: 'Arma simples ou marcial',
      },
      {
        equipment: 'Troféu de caça',
      },
      {
        equipment: 'Treckod',
      },
    ];
  },
};

export default APRENDIZ_DE_DRAGOEIRO;
