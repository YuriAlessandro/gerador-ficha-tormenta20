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
      origin: [atlasOriginPowers.TRADICIONALISTA_SVALANO],
      general: [],
    },
  };
}

const TRADICIONALISTA_SVALANO: Origin = {
  name: 'Tradicionalista Svalano (Svalas)',
  pericias: [],
  poderes: [atlasOriginPowers.TRADICIONALISTA_SVALANO],
  getPowersAndSkills: () => getAllRegionalBenefits(),
  isRegional: true,
  getItems: (): Items[] => {
    // Armas simples
    const armasSimples = [
      Armas.ADAGA,
      Armas.AZAGAIA,
      Armas.BORDAO,
      Armas.CAJADO_FERRADO,
      Armas.CLAVA,
      Armas.LANCA_MONTARIA,
      Armas.MACHADINHA,
      Armas.MACA,
      Armas.FOICE,
    ];

    // Armas marciais
    const armasMarciais = [
      Armas.ESPADA_LONGA,
      Armas.MACHADO_DE_BATALHA,
      Armas.MANGUAL,
      Armas.MARTELO_DE_GUERRA,
      Armas.TRIDENTE,
      Armas.GLADIO,
      Armas.KATANA,
      Armas.CIMITARRA,
      Armas.ALFANJE,
      Armas.PICARETA_DE_GUERRA,
      Armas.MACHADO_ANAO,
      Armas.LANCA,
      Armas.MONTANTE,
      Armas.ALABARDA,
    ];

    const todasArmas = [...armasSimples, ...armasMarciais];
    const armaSelecionada = getRandomItemFromArray(todasArmas);

    return [
      {
        equipment: armaSelecionada,
        qtd: 1,
      },
      {
        equipment: 'Corda',
        qtd: 1,
      },
      {
        equipment: 'Mochila de aventureiro',
        qtd: 1,
      },
      {
        equipment: 'Vara de madeira (3 m)',
        qtd: 1,
      },
    ];
  },
};

export default TRADICIONALISTA_SVALANO;
